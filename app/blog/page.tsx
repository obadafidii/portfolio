'use client';

import Link from 'next/link';
import {
    useEffect,
    useMemo,
    useRef,
    useState,
    type KeyboardEvent,
} from 'react';

import { TerminalWindow } from '@/components/layout/TerminalWindow';
import { CommandLine, Prompt } from '@/components/ui/shell/CommandLine';
import { getAllBlogs, isReadable } from '@/lib/blogs';
import type { BlogMetadata, BlogStatus } from '@/types/blog.type';

const STATUS_MARK: Record<
    BlogStatus,
    { mark: string; color: string; label: string }
> = {
    done: { mark: '✓', color: 'var(--term-green)', label: 'published' },
    'in-progress': {
        mark: '~',
        color: 'var(--term-amber)',
        label: 'in progress',
    },
    draft: { mark: '·', color: 'var(--paper-faint)', label: 'draft' },
};

const formatDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '----------';
    return date.toISOString().slice(0, 10);
};

const Row = ({ post }: { post: BlogMetadata }) => {
    const status = STATUS_MARK[post.status];
    const readable = isReadable(post);

    const content = (
        <>
            <span className="ink-faint w-[11ch] shrink-0">
                {formatDate(post.publishedOn)}
            </span>
            <span
                className="w-[2ch] shrink-0"
                style={{ color: status.color }}
                title={status.label}
                aria-label={status.label}
            >
                {status.mark}
            </span>
            <span
                className="min-w-0 flex-1"
                style={{
                    color: readable ? 'var(--term-blue)' : 'var(--paper-faint)',
                }}
            >
                {post.part ? (
                    <span
                        style={{
                            color: readable
                                ? 'var(--term-blue)'
                                : 'var(--paper-faint)',
                        }}
                    >
                        Part {post.part} ·{' '}
                    </span>
                ) : null}
                {post.title}
            </span>
            <span className="ink-faint hidden text-[11px] sm:inline">
                {post.tags.join(' · ')}
            </span>
        </>
    );

    /*
     * Unpublished entries still link out — the destination is the "not
     * finished yet" notice, not the post. Better than a dead row that looks
     * broken, and it is where the explanation lives.
     */
    return (
        <Link
            href={`/blog/${post.slug}`}
            data-blog-row
            className="term-row group"
            title={readable ? undefined : `${status.label} — not published yet`}
        >
            {content}
        </Link>
    );
};

const BlogsPage = () => {
    const posts = useMemo(() => getAllBlogs(), []);
    const [query, setQuery] = useState('');
    const [tag, setTag] = useState<string | null>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const onKeyDown = (event: globalThis.KeyboardEvent) => {
            const target = event.target as HTMLElement;
            if (
                event.key === '/' &&
                !target.matches(
                    'input,textarea,select,[contenteditable="true"]',
                ) &&
                !event.metaKey &&
                !event.ctrlKey
            ) {
                event.preventDefault();
                searchRef.current?.focus();
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);

    const onRowsKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
        const rows = [
            ...event.currentTarget.querySelectorAll<HTMLAnchorElement>(
                '[data-blog-row]',
            ),
        ];
        const index = rows.indexOf(document.activeElement as HTMLAnchorElement);
        if (index < 0) return;
        event.preventDefault();
        rows[
            Math.min(
                rows.length - 1,
                Math.max(0, index + (event.key === 'ArrowDown' ? 1 : -1)),
            )
        ]?.focus();
    };

    const tags = useMemo(() => {
        const counts: Record<string, number> = {};
        posts.forEach(post => {
            post.tags.forEach(item => {
                counts[item] = (counts[item] ?? 0) + 1;
            });
        });
        return Object.entries(counts).sort(
            (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
        );
    }, [posts]);

    const filtered = useMemo(() => {
        const needle = query.trim().toLowerCase();
        return posts.filter(post => {
            const matchesTag = !tag || post.tags.includes(tag);
            const haystack =
                `${post.title} ${post.summary} ${post.tags.join(' ')}`.toLowerCase();
            return matchesTag && (needle === '' || haystack.includes(needle));
        });
    }, [posts, query, tag]);

    const byYear = useMemo(() => {
        const grouped: Record<string, BlogMetadata[]> = {};
        filtered.forEach(post => {
            (grouped[post.year] ??= []).push(post);
        });
        return Object.entries(grouped).sort(
            (a, b) => Number(b[0]) - Number(a[0]),
        );
    }, [filtered]);

    const flags = [
        tag ? `--tag=${tag}` : '',
        query.trim() ? `| grep ${query.trim()}` : '',
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <TerminalWindow
            currentPage="blog"
            path="~/writing"
            status={
                <span>
                    {filtered.length} of {posts.length} entries
                </span>
            }
        >
            <CommandLine cwd="~/writing">
                <div className="page-enter">
                    <div className="flex flex-wrap items-baseline gap-x-2">
                        <Prompt cwd="~/writing" />
                        <span className="term-cmd">ls -t {flags}</span>
                    </div>

                    <label className="mt-3 flex items-baseline gap-2">
                        <span className="ink-faint shrink-0">grep</span>
                        <input
                            ref={searchRef}
                            type="search"
                            value={query}
                            onChange={event => setQuery(event.target.value)}
                            onKeyDown={event => {
                                if (event.key === 'Escape') {
                                    setQuery('');
                                    searchRef.current?.blur();
                                }
                            }}
                            placeholder="search titles, summaries, tags"
                            aria-label="Search posts"
                            className="term-cmd min-w-0 flex-1 bg-transparent outline-none placeholder:text-[var(--paper-faint)]"
                        />
                    </label>

                    <p className="ink-faint mt-2 text-[11px]">
                        / search · ↑↓ move through posts · Enter read · Esc
                        clear search
                    </p>

                    <div className="mt-6 space-y-6" onKeyDown={onRowsKeyDown}>
                        {byYear.map(([year, entries]) => (
                            <section key={year}>
                                <p className="ink-faint mb-1 text-[11px]">
                                    # {year}
                                </p>
                                <div className="space-y-0.5">
                                    {entries.map(post => (
                                        <Row
                                            key={post.slug || post.title}
                                            post={post}
                                        />
                                    ))}
                                </div>
                            </section>
                        ))}

                        {filtered.length === 0 && (
                            <p className="term-err">ls: no entries matched</p>
                        )}
                    </div>

                    <div className="mt-9">
                        <div className="flex flex-wrap items-baseline gap-x-2">
                            <Prompt cwd="~/writing" />
                            <span className="term-cmd">ls --tags</span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                            {tags.map(([name, count]) => (
                                <button
                                    key={name}
                                    type="button"
                                    onClick={() =>
                                        setTag(prev =>
                                            prev === name ? null : name,
                                        )
                                    }
                                    className="cursor-pointer text-[12px] transition-colors"
                                    style={{
                                        color:
                                            tag === name
                                                ? 'var(--term-green)'
                                                : 'var(--paper-muted)',
                                    }}
                                >
                                    {name}
                                    <span className="ink-faint">
                                        {' '}
                                        ({count})
                                    </span>
                                </button>
                            ))}
                        </div>
                        <p className="ink-faint mt-4 text-[11px]">
                            <span style={{ color: 'var(--term-green)' }}>
                                ✓
                            </span>{' '}
                            published{' '}
                            <span style={{ color: 'var(--term-amber)' }}>
                                ~
                            </span>{' '}
                            in progress <span>·</span> draft — only published
                            posts are readable
                        </p>
                    </div>
                </div>
            </CommandLine>
        </TerminalWindow>
    );
};

export default BlogsPage;
