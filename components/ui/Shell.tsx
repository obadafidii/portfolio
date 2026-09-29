'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { CommandLine, Prompt } from '@/components/ui/shell/CommandLine';
import { ROUTES } from '@/components/ui/shell/registry';

const BOOT_COMMAND = 'whoami';
const TYPE_MS = 55;

const Listing = () => (
    <div className="mt-1 space-y-0.5">
        {ROUTES.map(route => (
            <Link key={route.href} href={route.href} className="term-row group">
                <span className="ink-faint w-[11ch] shrink-0">drwxr-xr-x</span>
                <span
                    className="group-hover:underline"
                    style={{ color: 'var(--term-blue)' }}
                >
                    {route.name}/
                </span>
                <span className="ink-muted ml-auto text-[11px]">
                    {route.note}
                </span>
            </Link>
        ))}
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
                    <div style={{ color: 'var(--paper-ink)' }}>
                        David Dada — backend + infrastructure engineer
                    </div>
                    <div className="ink-faint mt-3">
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
