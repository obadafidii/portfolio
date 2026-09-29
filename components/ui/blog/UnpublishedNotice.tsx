'use client';

import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';

import { TerminalWindow } from '@/components/layout/TerminalWindow';
import { CommandLine, Prompt } from '@/components/ui/shell/CommandLine';
import type { BlogMetadata, BlogStatus } from '@/types/blog.type';

const SPINNER = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

const COPY: Record<
    Exclude<BlogStatus, 'done'>,
    { label: string; colour: string; stall: string; blurb: string }
> = {
    'in-progress': {
        label: 'in progress',
        colour: 'var(--term-amber)',
        stall: 'awaiting author',
        blurb: 'This one is being written. The structure is there and the words are getting there. It will show up in the listing as published when it is done.',
    },
    draft: {
        label: 'draft',
        colour: 'var(--paper-faint)',
        stall: 'blocked on first draft',
        blurb: 'Not much here yet beyond an outline and some notes to myself. Published posts are the ones marked with a green check in the listing.',
    },
};

interface Step {
    label: string;
    detail?: string;
}

export const UnpublishedNotice = ({
    blog,
    file,
    others,
    children,
}: {
    blog: BlogMetadata;
    file: string;
    others: BlogMetadata[];
    children?: ReactNode;
}) => {
    const status = blog.status === 'done' ? COPY.draft : COPY[blog.status];

    const steps: Step[] = [
        { label: `resolving ${file}`, detail: 'found' },
        { label: 'reading frontmatter', detail: `status=${blog.status}` },
        { label: 'parsing markdown', detail: `${blog.tags.length} tags` },
    ];

    const [done, setDone] = useState(0);
    const [frame, setFrame] = useState(0);
    const [reduced, setReduced] = useState(false);

    useEffect(() => {
        const quiet = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        ).matches;
        setReduced(quiet);

        if (quiet) {
            setDone(steps.length);
            return;
        }

        const timers = steps.map((_, idx) =>
            setTimeout(() => setDone(idx + 1), 260 * (idx + 1)),
        );
        return () => timers.forEach(clearTimeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [file]);

    useEffect(() => {
        if (reduced) return;
        const tick = setInterval(
            () => setFrame(f => (f + 1) % SPINNER.length),
            90,
        );
        return () => clearInterval(tick);
    }, [reduced]);

    const stalled = done >= steps.length;

    return (
        <TerminalWindow
            currentPage="blog"
            path={`~/writing/${file}`}
            status={
                <>
                    <span style={{ color: status.colour }}>{status.label}</span>
                    <Link href="/blog" style={{ color: 'var(--term-blue)' }}>
                        q · back to ~/writing
                    </Link>
                </>
            }
        >
            {children}
            <CommandLine cwd="~/writing">
                <div>
                    <div className="flex flex-wrap items-baseline gap-x-2">
                        <Prompt cwd="~/writing" />
                        <span className="term-cmd">cat {file}</span>
                    </div>

                    <div className="mt-3 space-y-0.5">
                        {steps.map((step, idx) => (
                            <div
                                key={step.label}
                                className="flex flex-wrap items-baseline gap-x-3 transition-opacity duration-200"
                                style={{ opacity: done > idx ? 1 : 0 }}
                            >
                                <span style={{ color: 'var(--term-green)' }}>
                                    [ ok ]
                                </span>
                                <span className="ink-muted">{step.label}</span>
                                {step.detail && (
                                    <span className="ink-faint text-[11px]">
                                        {step.detail}
                                    </span>
                                )}
                            </div>
                        ))}

                        <div
                            className="flex flex-wrap items-baseline gap-x-3 transition-opacity duration-200"
                            style={{ opacity: stalled ? 1 : 0 }}
                        >
                            <span style={{ color: status.colour }}>
                                [{reduced ? ' .. ' : ` ${SPINNER[frame]}  `}]
                            </span>
                            <span style={{ color: 'var(--paper-bright)' }}>
                                {status.stall}
                            </span>
                            <span className="ink-faint text-[11px]">
                                no eta
                            </span>
                        </div>

                        <div
                            className="flex flex-wrap items-baseline gap-x-3 transition-opacity duration-200"
                            style={{ opacity: stalled ? 1 : 0 }}
                        >
                            <span className="ink-faint">[skip]</span>
                            <span className="ink-faint">render</span>
                        </div>
                    </div>

                    {stalled && (
                        <div className="mt-6">
                            <p style={{ color: 'var(--paper-bright)' }}>
                                {blog.title}
                                <span style={{ color: status.colour }}>
                                    {' '}
                                    — {status.label}
                                </span>
                            </p>
                            <p className="ink-muted measure mt-2">
                                {status.blurb}
                            </p>

                            {blog.summary && (
                                <p
                                    className="ink-faint measure mt-3 border-l-2 pl-3 text-[12.5px]"
                                    style={{
                                        borderColor: 'var(--paper-line-strong)',
                                    }}
                                >
                                    {blog.summary}
                                </p>
                            )}

                            <div className="mt-8">
                                <div className="flex flex-wrap items-baseline gap-x-2">
                                    <Prompt cwd="~/writing" />
                                    <span className="term-cmd">
                                        ls --published
                                    </span>
                                </div>

                                {others.length > 0 ? (
                                    <div className="mt-1 space-y-0.5">
                                        {others.map(post => (
                                            <Link
                                                key={post.slug}
                                                href={`/blog/${post.slug}`}
                                                className="term-row group"
                                            >
                                                <span className="ink-faint w-[11ch] shrink-0">
                                                    {new Date(post.publishedOn)
                                                        .toISOString()
                                                        .slice(0, 10)}
                                                </span>
                                                <span
                                                    className="group-hover:underline"
                                                    style={{
                                                        color: 'var(--term-blue)',
                                                    }}
                                                >
                                                    {post.title}
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="ink-faint mt-1">
                                        nothing published yet — everything here
                                        is still cooking
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </CommandLine>
        </TerminalWindow>
    );
};
