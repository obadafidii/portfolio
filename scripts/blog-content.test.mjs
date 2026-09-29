import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';
import {
    readCatalog,
    readPostMetadata,
    generateBlogContent,
} from './blog-content.mjs';

const base = {
    title: 'Test',
    summary: 'A test article.',
    publishedOn: '2026-09-03T00:00:00Z',
    tags: ['logs'],
    status: 'draft',
};

async function fixture(t, statuses = ['draft', 'done', 'in-progress']) {
    const root = await mkdtemp(path.join(tmpdir(), 'portfolio-blog-'));
    t.after(() => rm(root, { recursive: true, force: true }));
    const directory = path.join(root, 'content/blog/log');
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, 'series.json'), JSON.stringify(base));
    for (const [index, status] of statuses.entries()) {
        const post = { ...base, status, part: index + 1 };
        delete post.tags;
        // Reverse filenames to ensure ordering comes from part numbers.
        await writeFile(
            path.join(directory, `${statuses.length - index}-part.mdx`),
            `export const post = ${JSON.stringify(post)};\n\n# Body ${index + 1}\n`,
        );
    }
    return root;
}

function loadHelpers(catalog, source) {
    const scope = {
        exports: {},
        URLSearchParams,
        require: () => ({
            blogMetadata: catalog.posts,
            blogSeries: catalog.series,
        }),
    };
    vm.runInNewContext(
        ts.transpileModule(source, {
            compilerOptions: { module: ts.ModuleKind.CommonJS },
        }).outputText,
        scope,
    );
    return scope.exports;
}

test('lists parts in reverse order while preserving the reading sequence', async t => {
    const root = await fixture(t);
    const catalog = await readCatalog(path.join(root, 'content/blog'));
    assert.deepEqual(catalog.series.log.parts, [
        'log/3-part',
        'log/2-part',
        'log/1-part',
    ]);
    assert.equal(catalog.series.log.publishedParts, 1);
    assert.equal(catalog.series.log.status, 'in-progress');
    assert.deepEqual(catalog.posts['log/3-part'].tags, ['logs']);
    const helpers = loadHelpers(
        catalog,
        await readFile(new URL('../lib/blogs.ts', import.meta.url), 'utf8'),
    );
    assert.equal(helpers.getAllBlogs().length, 3);
    assert.equal(
        helpers
            .getAllBlogs()
            .map(post => post.slug)
            .join(','),
        'log/1-part,log/2-part,log/3-part',
    );
    assert.equal(
        helpers
            .getSeriesParts('log')
            .map(post => post.part)
            .join(','),
        '1,2,3',
    );
    assert.equal(helpers.getBlogMetadata('log'), undefined);
    assert.equal(helpers.getAllPosts().length, 3);
    assert.equal(helpers.getReadablePosts().length, 1);
    assert.equal(helpers.getReadableBlogs()[0].slug, 'log/2-part');
    assert.equal(helpers.getPostKey('/blog/log/2-part/'), 'log/2-part');
    assert.equal(helpers.getPostKey('/blog/post/log/2-part/'), 'log/2-part');
    assert.equal(helpers.getBlogMetadata('missing'), undefined);
    assert.equal(helpers.getBlogMetadata('constructor'), undefined);
    const metadata = helpers.buildPostMetadata('log/3-part', {
        me: 'Author',
        icon: '/icon.svg',
    });
    assert.equal(metadata.alternates.canonical, '/blog/log/3-part');
    assert.equal(metadata.robots.index, false);
    assert.equal(
        helpers.buildPostMetadata('log/2-part', { me: 'Author' }).robots,
        undefined,
    );
    assert.equal(
        helpers.buildPostMetadata('log', { me: 'Author' }).alternates.canonical,
        '/blog',
    );
});

test('only published article bodies enter the generated loader; newly added parts are discovered', async t => {
    const root = await fixture(t);
    await generateBlogContent(root);
    const loader = await readFile(
        path.join(root, 'components/ui/blog/PostContent.generated.tsx'),
        'utf8',
    );
    assert.match(loader, /log\/2-part.mdx/);
    assert.doesNotMatch(loader, /log\/[13]-part.mdx/);
    await writeFile(
        path.join(root, 'content/blog/log/new-part.mdx'),
        `export const post = ${JSON.stringify({ ...base, part: 4, status: 'done' })};\n\n# New\n`,
    );
    const catalog = await generateBlogContent(root);
    assert.equal(catalog.series.log.partCount, 4);
    assert.equal(catalog.series.log.publishedParts, 2);
    assert.match(
        await readFile(
            path.join(root, 'components/ui/blog/PostContent.generated.tsx'),
            'utf8',
        ),
        /log\/new-part.mdx/,
    );
});

test('series status and indexing follow the publication status of its parts', async t => {
    for (const status of ['draft', 'done']) {
        const root = await fixture(t, [status, status]);
        const catalog = await readCatalog(path.join(root, 'content/blog'));
        assert.equal(catalog.series.log.status, status);
        const helpers = loadHelpers(
            catalog,
            await readFile(new URL('../lib/blogs.ts', import.meta.url), 'utf8'),
        );
        assert.equal(
            helpers.getReadableBlogs().length,
            status === 'done' ? 2 : 0,
        );
        assert.equal(
            helpers.buildPostMetadata('log/1-part', { me: 'Author' }).robots
                ?.index,
            status === 'done' ? undefined : false,
        );
    }
});

test('invalid statuses and duplicate part numbers stop generation with a useful error', async t => {
    const root = await fixture(t, ['published']);
    await assert.rejects(
        readCatalog(path.join(root, 'content/blog')),
        /status must be/,
    );
    const duplicateRoot = await fixture(t, ['draft']);
    await writeFile(
        path.join(duplicateRoot, 'content/blog/log/duplicate.mdx'),
        `export const post = ${JSON.stringify({ ...base, part: 1 })};\n\n# Duplicate\n`,
    );
    await assert.rejects(
        readCatalog(path.join(duplicateRoot, 'content/blog')),
        /duplicate part numbers/,
    );
});

test('metadata is parsed as literal data, never evaluated', () => {
    assert.throws(
        () => readPostMetadata('export const post = makePost();\n', 'test.mdx'),
        /literal values/,
    );
    assert.throws(
        () => readPostMetadata('# No metadata\n', 'test.mdx'),
        /missing export const post/,
    );
});
