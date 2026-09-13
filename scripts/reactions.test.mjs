import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';
import { NextRequest } from 'next/server.js';

const require = createRequire(import.meta.url);
const credentials = {
    UPSTASH_REDIS_REST_URL: 'https://redis.example.test',
    UPSTASH_REDIS_REST_TOKEN: 'test-only-token',
};

async function loadModule(file, globals = {}, imports = {}) {
    const source = await readFile(new URL(file, import.meta.url), 'utf8');
    const scope = {
        exports: {}, Buffer, AbortSignal,
        process: { env: { ...credentials } },
        require: name => imports[name] || require(name),
        ...globals,
    };
    vm.runInNewContext(ts.transpileModule(source, {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText, scope);
    return scope.exports;
}

test('signed reader cookies survive reloads and reject tampering', async () => {
    const storage = await loadModule('../lib/reactions.ts');
    const first = storage.readerIdentity();
    assert.equal(storage.readerIdentity(first.cookie).id, first.id);
    assert.notEqual(storage.readerIdentity(`${first.id}.${'a'.repeat(64)}`).id, first.id);
    assert.notEqual(storage.readerIdentity('broken-cookie').id, first.id);
    assert.notEqual(storage.readerIdentity().id, first.id);
});

test('storage sends atomic updates and preserves null versus read operations', async () => {
    const calls = [];
    const storage = await loadModule('../lib/reactions.ts', {
        fetch: async (url, options) => {
            calls.push({ url, options, command: JSON.parse(options.body) });
            return Response.json({ result: ['3', '2', 'love'] });
        },
    });
    assert.equal(JSON.stringify(await storage.readOrUpdateReaction('log/part-2', 'reader', 'love')),
        JSON.stringify({ like: 3, love: 2, selected: 'love' }));
    await storage.readOrUpdateReaction('log/part-2', 'reader', null);
    await storage.readOrUpdateReaction('log/part-2', 'reader');
    assert.equal(calls[0].command[0], 'EVAL');
    assert.equal(calls[0].command[1], storage.UPDATE_REACTION_SCRIPT);
    assert.equal(calls[0].command[2], 3);
    assert.equal(calls[0].command.at(-1), 'love');
    assert.equal(calls[1].command.at(-1), '');
    assert.equal(calls[2].command[2], 2);
    assert.equal(calls[0].options.cache, 'no-store');
    assert.equal(calls[0].options.headers.Authorization, 'Bearer test-only-token');
    for (const key of calls[0].command.slice(3, 6)) assert.match(key, /\{log\/part-2\}/);
});

test('storage failures and invalid totals never become successful zero totals', async () => {
    for (const payload of [{ error: 'denied' }, { result: [-1, 0, ''] }, { result: ['bad', 0, ''] }]) {
        const storage = await loadModule('../lib/reactions.ts', {
            fetch: async () => Response.json(payload),
        });
        await assert.rejects(storage.readOrUpdateReaction('post', 'reader'));
    }
    const unavailable = await loadModule('../lib/reactions.ts', { process: { env: {} } });
    await assert.rejects(unavailable.readOrUpdateReaction('post', 'reader'), /not configured/);
    const limited = await loadModule('../lib/reactions.ts', {
        fetch: async () => Response.json({ result: ['limited'] }),
    });
    await assert.rejects(limited.readOrUpdateReaction('post', 'reader', 'like'), limited.ReactionRateLimitError);
});

async function routeFixture() {
    const calls = [];
    const storage = await loadModule('../lib/reactions.ts');
    let error;
    const route = await loadModule('../app/api/reactions/[...slug]/route.ts', {}, {
        '@/lib/blogs': {
            getBlogMetadata: key => key === 'published' ? { status: 'done' }
                : key === 'draft' ? { status: 'draft' } : undefined,
            isReadable: blog => blog.status === 'done',
        },
        '@/lib/reactions': {
            ...storage,
            readOrUpdateReaction: async (...args) => {
                if (error) throw error;
                calls.push(args);
                return { like: 1, love: 0, selected: args[2] || null };
            },
        },
    });
    return { route, calls, storage, fail: value => { error = value; } };
}

const context = (post = 'published') => ({ params: Promise.resolve({ slug: [post] }) });
const request = (method = 'GET', body, extraHeaders = {}) => new NextRequest('http://localhost/api/reactions/published', {
    method,
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    headers: { Origin: 'http://localhost', 'Content-Type': 'application/json', ...extraHeaders },
});

test('API shares counts and maintains the same HttpOnly identity across a switch and undo', async () => {
    const { route, calls } = await routeFixture();
    const first = await route.GET(request(), context());
    assert.equal(first.status, 200);
    assert.equal(first.headers.get('cache-control'), 'private, no-store');
    assert.match(first.headers.get('set-cookie'), /HttpOnly/i);
    const cookie = first.headers.get('set-cookie').split(';')[0];
    for (const reaction of ['like', 'love', null]) {
        const response = await route.PUT(request('PUT', { reaction }, { Cookie: cookie }), context());
        assert.equal(response.status, 200);
        assert.equal((await response.json()).selected, reaction);
    }
    assert.equal(new Set(calls.map(call => call[1])).size, 1);
    assert.equal(calls.length, 4);
});

test('API rejects cross-origin writes, malformed reactions and unpublished posts before storage', async () => {
    const { route, calls } = await routeFixture();
    assert.equal((await route.PUT(request('PUT', { reaction: 'like' }, { Origin: 'https://other.test' }), context())).status, 403);
    for (const body of [{ reaction: 'wow' }, {}, null]) {
        assert.equal((await route.PUT(request('PUT', body), context())).status, 400);
    }
    assert.equal((await route.PUT(request('PUT', { reaction: 'like' }, { 'Content-Type': 'text/plain' }), context())).status, 415);
    for (const key of ['missing', 'draft']) {
        assert.equal((await route.GET(request(), context(key))).status, 404);
    }
    assert.equal(calls.length, 0);
});

test('API exposes recoverable storage and rate-limit errors without leaking credentials', async () => {
    const { route, fail, storage } = await routeFixture();
    fail(new Error('private credentials'));
    const unavailable = await route.GET(request(), context());
    assert.equal(unavailable.status, 503);
    assert.doesNotMatch(await unavailable.text(), /private credentials/);
    fail(new storage.ReactionRateLimitError());
    const limited = await route.PUT(request('PUT', { reaction: 'like' }), context());
    assert.equal(limited.status, 429);
    assert.equal(limited.headers.get('retry-after'), '60');
});
