import { NextRequest, NextResponse } from 'next/server';
import { getBlogMetadata, isReadable } from '@/lib/blogs';
import {
    READER_COOKIE, readerIdentity, readOrUpdateReaction, ReactionRateLimitError,
    type Reaction,
} from '@/lib/reactions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Context = { params: Promise<{ slug: string[] }> };
const headers = { 'Cache-Control': 'private, no-store' };

async function handle(request: NextRequest, context: Context, write: boolean) {
    const { slug } = await context.params;
    const postKey = slug.join('/');
    const blog = getBlogMetadata(postKey);
    if (!blog || !isReadable(blog)) {
        return NextResponse.json({ error: 'Article not found.' }, { status: 404, headers });
    }

    let reaction: Reaction | undefined;
    if (write) {
        if (request.headers.get('origin') !== request.nextUrl.origin) {
            return NextResponse.json({ error: 'Request not allowed.' }, { status: 403, headers });
        }
        if (!request.headers.get('content-type')?.startsWith('application/json')) {
            return NextResponse.json({ error: 'Expected JSON.' }, { status: 415, headers });
        }
        try {
            const text = await request.text();
            if (text.length > 128) throw new Error('Body too large');
            const body = JSON.parse(text);
            if (!body || !Object.hasOwn(body, 'reaction')
                || ![null, 'like', 'love'].includes(body.reaction)) {
                throw new Error('Invalid reaction');
            }
            reaction = body.reaction;
        } catch {
            return NextResponse.json({ error: 'Choose like, love, or no reaction.' }, { status: 400, headers });
        }
    }

    try {
        const reader = readerIdentity(request.cookies.get(READER_COOKIE)?.value);
        const state = await readOrUpdateReaction(postKey, reader.id, reaction);
        const response = NextResponse.json(state, { headers });
        response.cookies.set(READER_COOKIE, reader.cookie, {
            httpOnly: true,
            sameSite: 'lax',
            secure: request.nextUrl.protocol === 'https:',
            path: '/',
            maxAge: 60 * 60 * 24 * 365,
        });
        return response;
    } catch (error) {
        if (error instanceof ReactionRateLimitError) {
            return NextResponse.json({ error: 'Please wait a minute before reacting again.' }, {
                status: 429, headers: { ...headers, 'Retry-After': '60' },
            });
        }
        return NextResponse.json({ error: 'Reactions are temporarily unavailable. Please try again later.' }, {
            status: 503, headers,
        });
    }
}

export const GET = (request: NextRequest, context: Context) => handle(request, context, false);
export const PUT = (request: NextRequest, context: Context) => handle(request, context, true);
