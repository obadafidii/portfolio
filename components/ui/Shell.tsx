'use client';

import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';

import info from '@/misc/info';

import { CommandLine, Prompt } from '@/components/ui/shell/CommandLine';
import { ROUTES } from '@/components/ui/shell/registry';

const BOOT_COMMAND = 'whoami';
const TYPE_MS = 55;

const Listing = () => (
    <div className="mt-1 space-y-0.5">
        {ROUTES.map(route => (
            <Link key={route.href} href={route.href} className="term-row group">
                <span className="ink-faint hidden w-[11ch] shrink-0 sm:inline">
                    drwxr-xr-x
                </span>
                <span
                    className="w-[14ch] shrink-0 group-hover:underline"
                    style={{ color: 'var(--term-blue)' }}
                >
                    {route.name}/
                </span>
                <span className="ink-muted min-w-0 flex-1 text-[11px]">
                    {route.note}
                </span>
            </Link>
        ))}
    </div>
);

/**
 * The first screen a visitor sees. Every line here should be a fact they can
 * check on the resume or the blog, so keep it in sync with content/resume.md.
 */
const FACTS: { key: string; value: ReactNode }[] = [
    {
        key: 'now',
        value: (
            <>
                Senior Golang Engineer at Satsio, building exchange and
                matching-engine tooling
            </>
        ),
    },
    {
        key: 'shipped',
        value: (
            <>
                cut end-to-end processing latency 70% on Terrace&apos;s Solana
                trading pipeline
            </>
        ),
    },
    {
        key: 'built',
        value: (
            <>
                <a
                    href="https://github.com/obadafidii/minired"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="term-link"
                >
                    minired
                </a>
                , a Redis-compatible cache server in Go, and a sharded key-value
                store with a WAL
            </>
        ),
    },
    {
        key: 'upstream',
        value: (
            <>
                merged into LLVM libc,{' '}
                <Link
                    href="/blog/llvm-first-contribution"
                    className="term-link"
                >
                    read how it went
                </Link>
            </>
        ),
    },
    { key: 'open to', value: <>remote backend and systems roles</> },
];

const Whoami = () => (
    <div className="mt-1">
        <div className="text-[15px]" style={{ color: 'var(--paper-bright)' }}>
            David Dada
        </div>
        <p className="ink-muted max-w-[68ch]">
            Backend and systems engineer. I build compilers and distributed
            systems (databases and caches) in Go and Zig.
        </p>

        <dl className="mt-3 space-y-1">
            {FACTS.map(fact => (
                <div key={fact.key} className="flex gap-x-4">
                    <dt className="ink-faint w-[9ch] shrink-0">{fact.key}</dt>
                    <dd
                        className="min-w-0 flex-1"
                        style={{ color: 'var(--paper-ink)' }}
                    >
                        {fact.value}
                    </dd>
                </div>
            ))}
        </dl>

        <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/resume" className="term-action term-action-primary">
                man david <span aria-hidden>→</span> resume
            </Link>
            <a href={`mailto:${info.email}`} className="term-action">
                mail david <span aria-hidden>→</span> email
            </a>
        </div>
    </div>
);

export const Shell = () => {
    const [typed, setTyped] = useState('');
    const [booted, setBooted] = useState(false);

    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            setTyped(BOOT_COMMAND);
            setBooted(true);
            return;
        }

        const timers: ReturnType<typeof setTimeout>[] = [];
        BOOT_COMMAND.split('').forEach((_, idx) => {
            timers.push(
                setTimeout(
                    () => setTyped(BOOT_COMMAND.slice(0, idx + 1)),
                    TYPE_MS * (idx + 1),
                ),
            );
        });
        timers.push(
            setTimeout(
                () => setBooted(true),
                TYPE_MS * (BOOT_COMMAND.length + 5),
            ),
        );

        return () => timers.forEach(clearTimeout);
    }, []);

    const intro = (
        <div>
            <div className="flex flex-wrap items-baseline gap-x-2">
                <Prompt cwd="~" />
                <span className={booted ? 'term-cmd' : 'term-cmd caret'}>
                    {typed}
                </span>
            </div>

            {booted && (
                <>
                    <Whoami />
                    <div className="ink-faint mt-5">
                        type{' '}
                        <span style={{ color: 'var(--term-blue)' }}>help</span>{' '}
                        for commands, or click a directory below.
                    </div>
                    <div className="mt-3 flex flex-wrap items-baseline gap-x-2">
                        <Prompt cwd="~" />
                        <span className="term-cmd">ls</span>
                    </div>
                    <Listing />
                </>
            )}
        </div>
    );

    if (!booted) return <div className="min-h-full">{intro}</div>;

    return (
        <CommandLine cwd="~" autoFocus>
            {intro}
        </CommandLine>
    );
};
