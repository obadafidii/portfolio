'use client';

import { useMemo, useState } from 'react';

import info from '@/misc/info';
import { TerminalWindow } from '@/components/layout/TerminalWindow';
import { CommandLine, Prompt } from '@/components/ui/shell/CommandLine';

type Work = (typeof info.works)[number];

const GROUPS = [
    { kind: 'product' as const, label: 'in production', perm: 'drwxr-xr-x' },
    { kind: 'build' as const, label: 'built to learn', perm: '-rw-r--r--' },
];

const Row = ({ work, perm }: { work: Work; perm: string }) => (
    <a
        href={work.url}
        target="_blank"
        rel="noopener noreferrer"
        className="term-row group"
    >
        <span className="ink-faint w-[11ch] shrink-0">{perm}</span>
        <span
            className="w-[16ch] shrink-0 group-hover:underline"
            style={{ color: 'var(--term-blue)' }}
        >
            {work.file}
            {work.kind === 'product' ? '/' : ''}
        </span>
        <span className="ink-muted min-w-0 flex-1 text-[12px]">
            {work.description}
        </span>
    </a>
);

const WorksPage = () => {
    const [tag, setTag] = useState<string | null>(null);

    const tags = useMemo(() => {
        const counts: Record<string, number> = {};
        info.works.forEach(work => {
            work.tags.forEach(item => {
                counts[item] = (counts[item] ?? 0) + 1;
            });
        });
        return Object.entries(counts).sort(
            (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
        );
    }, []);

    const filtered = useMemo(
        () =>
            tag
                ? info.works.filter(work => work.tags.includes(tag))
                : info.works,
        [tag],
    );

    return (
        <TerminalWindow
            currentPage="works"
            path="~/works"
            status={
                <span>
                    {filtered.length} of {info.works.length} shown
                </span>
            }
        >
            <CommandLine cwd="~/works">
                <div className="page-enter">
                    <div className="flex flex-wrap items-baseline gap-x-2">
                        <Prompt cwd="~/works" />
                        <span className="term-cmd">
                            ls -la{tag ? ` --tag=${tag}` : ''}
                        </span>
                    </div>

                    <div className="ink-faint mt-1">
                        total {filtered.length}
                        {tag && (
                            <>
                                {' · '}
                                <button
                                    type="button"
                                    onClick={() => setTag(null)}
                                    className="cursor-pointer underline"
                                    style={{ color: 'var(--term-blue)' }}
                                >
                                    clear filter
                                </button>
                            </>
                        )}
                    </div>

                    <div className="mt-5 space-y-6">
                        {GROUPS.map(group => {
                            const rows = filtered.filter(
                                work => work.kind === group.kind,
                            );
                            if (rows.length === 0) return null;

                            return (
                                <section key={group.kind}>
                                    <p className="ink-faint mb-1 text-[11px]">
                                        # {group.label}
                                    </p>
                                    <div className="space-y-0.5">
                                        {rows.map(work => (
                                            <Row
                                                key={work.file}
                                                work={work}
                                                perm={group.perm}
                                            />
                                        ))}
                                    </div>
                                </section>
                            );
                        })}

                        {filtered.length === 0 && (
                            <p className="term-err">
                                ls: no matches for --tag={tag}
                            </p>
                        )}
                    </div>

                    <div className="mt-9">
                        <div className="flex flex-wrap items-baseline gap-x-2">
                            <Prompt cwd="~/works" />
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
                    </div>
                </div>
            </CommandLine>
        </TerminalWindow>
    );
};

export default WorksPage;
