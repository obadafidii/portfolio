import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';

export type Reaction = 'like' | 'love' | null;
export type ReactionState = { like: number; love: number; selected: Reaction };

export const READER_COOKIE = 'blog-reader';

function configuration() {
    const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
    if (!url || !token) throw new Error('Reactions storage is not configured');
    return { url, token, secret: process.env.REACTIONS_COOKIE_SECRET || token };
}

function signature(id: string) {
    return createHmac('sha256', configuration().secret).update(id).digest('hex');
}

export function readerIdentity(cookie?: string) {
    const [id = '', supplied = ''] = (cookie || '').split('.');
    if (/^[0-9a-f-]{36}$/.test(id) && /^[0-9a-f]{64}$/.test(supplied)) {
        const expected = signature(id);
        if (timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))) {
            return { id, cookie: `${id}.${expected}` };
        }
    }
    const nextId = randomUUID();
    return { id: nextId, cookie: `${nextId}.${signature(nextId)}` };
}

// Read selection and totals together. All keys share a Redis cluster hash tag.
const READ = `
return {redis.call('HGET', KEYS[1], 'like') or '0',
        redis.call('HGET', KEYS[1], 'love') or '0',
        redis.call('HGET', KEYS[2], ARGV[1]) or ''}
`;

// A desired state makes retries idempotent; the script prevents concurrent
// switches from incrementing a total twice or leaving the old total behind.
export const UPDATE_REACTION_SCRIPT = `
local attempts = redis.call('INCR', KEYS[3])
if attempts == 1 then redis.call('EXPIRE', KEYS[3], 60) end
if attempts > 60 then return {'limited'} end
local old = redis.call('HGET', KEYS[2], ARGV[1]) or ''
local next = ARGV[2]
if old ~= next then
    if old ~= '' then redis.call('HINCRBY', KEYS[1], old, -1) end
    if next == '' then
        redis.call('HDEL', KEYS[2], ARGV[1])
    else
        redis.call('HSET', KEYS[2], ARGV[1], next)
        redis.call('HINCRBY', KEYS[1], next, 1)
    end
end
return {redis.call('HGET', KEYS[1], 'like') or '0',
        redis.call('HGET', KEYS[1], 'love') or '0', next}
`;

export class ReactionRateLimitError extends Error {}

export async function readOrUpdateReaction(
    postKey: string,
    reader: string,
    reaction?: Reaction,
): Promise<ReactionState> {
    const { url, token } = configuration();
    const prefix = `blog:reactions:{${postKey}}`;
    const keys = [`${prefix}:counts`, `${prefix}:readers`];
    if (reaction !== undefined) keys.push(`${prefix}:limit:${reader}`);
    const response = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify([
            'EVAL', reaction === undefined ? READ : UPDATE_REACTION_SCRIPT,
            keys.length, ...keys, reader, ...(reaction === undefined ? [] : [reaction || '']),
        ]),
        cache: 'no-store',
        signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error('Reactions storage unavailable');
    const payload = await response.json();
    if (payload.error || !Array.isArray(payload.result)) {
        throw new Error('Invalid reactions storage response');
    }
    if (payload.result[0] === 'limited') throw new ReactionRateLimitError();
    const [likeValue, loveValue, selected] = payload.result;
    const like = Number(likeValue);
    const love = Number(loveValue);
    if (!Number.isSafeInteger(like) || like < 0 || !Number.isSafeInteger(love) || love < 0
        || !['', 'like', 'love'].includes(selected)) {
        throw new Error('Invalid reaction totals');
    }
    return { like, love, selected: selected || null };
}
