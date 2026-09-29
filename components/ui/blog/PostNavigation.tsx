'use client';

import Link from 'next/link';
import {
    getBlogMetadata,
    getBlogSeries,
    getReadableBlogs,
    getSeriesParts,
} from '@/lib/blogs';
import type { BlogMetadata } from '@/types/blog.type';

const hrefFor = (post: BlogMetadata) => `/blog/${post.slug}`;

export function PostNavigation({ currentKey }: { currentKey: string }) {
    const current = getBlogMetadata(currentKey);
    if (!current) return null;

    const publishedPosts = getReadableBlogs();
    const publishedIndex = publishedPosts.findIndex(
        post => post.slug === currentKey,
    );
    const olderPost =
        publishedIndex >= 0 ? publishedPosts[publishedIndex + 1] : undefined;
    const newerPost =
        publishedIndex > 0 ? publishedPosts[publishedIndex - 1] : undefined;

    let previous = olderPost;
    let next = newerPost;

    if (current.series && getBlogSeries(current.series)) {
        const parts = getSeriesParts(current.series);
        const seriesIndex = parts.findIndex(part => part.slug === currentKey);
        previous = seriesIndex > 0 ? parts[seriesIndex - 1] : olderPost;
        next =
            seriesIndex >= 0 && seriesIndex < parts.length - 1
                ? parts[seriesIndex + 1]
                : newerPost;
    }

    return (
        <nav
            aria-label="Blog navigation"
            className="my-2 grid grid-cols-2 items-start gap-4 border-y py-3 text-[12px] leading-relaxed"
            style={{ borderColor: 'var(--paper-line)' }}
        >
            <div className="min-w-0">
                <Link
                    href={previous ? hrefFor(previous) : '/blog'}
                    className="underline"
                    style={{ color: 'var(--term-blue)' }}
                    rel="prev"
                >
                    ← Previous: {previous?.title ?? 'All blog posts'}
                </Link>
            </div>
            <div className="min-w-0 text-right">
                <Link
                    href={next ? hrefFor(next) : '/blog'}
                    className="underline"
                    style={{ color: 'var(--term-blue)' }}
                    rel="next"
                >
                    Next: {next?.title ?? 'All blog posts'} →
                </Link>
            </div>
        </nav>
    );
}
