'use client';

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';

import { TerminalWindow } from '@/components/layout/TerminalWindow';
import { CommandLine, Prompt } from '@/components/ui/shell/CommandLine';
import { contributionNotes, type Contribution } from '@/content/contributions';

const monthName = (month: string) =>
    new Date(`2000-${month}-01T00:00:00Z`).toLocaleString('en', {
        month: 'long',
        timeZone: 'UTC',
    });

export default function OpenSourcePage() {
    const [items, setItems] = useState<Contribution[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [year, setYear] = useState('');
    const [selectedUrl, setSelectedUrl] = useState('');
    const rowRefs = useRef<Record<string, HTMLButtonElement | null>>({});
    const closeRef = useRef<HTMLButtonElement>(null);
    const dialogRef = useRef<HTMLDivElement>(null);
    const titleId = useId();
    const descriptionId = useId();

    useEffect(() => {
        const controller = new AbortController();
        fetch('/api/contributions', { signal: controller.signal })
            .then(async response => {
                const data = (await response.json()) as {
                    items: Contribution[];
                    error?: string;
                    notice?: string;
                };
                if (!response.ok) throw new Error(data.error ?? 'Unable to load contributions.');
                setItems(data.items);
                setNotice(data.notice ?? '');
            })
            .catch(cause => {
                if (cause instanceof DOMException && cause.name === 'AbortError') return;
                setError(cause instanceof Error ? cause.message : 'Unable to load contributions.');
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });
        return () => controller.abort();
    }, []);

    const years = useMemo(() => [...new Set(items.map(item => item.date.slice(0, 4)))], [items]);
    const activeYear = year || years[0] || new Date().getFullYear().toString();
    const visible = useMemo(
        () => items.filter(item => item.date.startsWith(activeYear)),
        [items, activeYear],
    );
    const groups = useMemo(() => {
        const byMonth = new Map<string, Contribution[]>();
        visible.forEach(item => {
            const month = item.date.slice(5, 7);
            byMonth.set(month, [...(byMonth.get(month) ?? []), item]);
        });
        return [...byMonth.entries()];
    }, [visible]);
    const selected = items.find(item => item.url === selectedUrl);
    const note = selected ? contributionNotes[selected.url] : undefined;

    useEffect(() => {
        if (!selected) return;

        const previousOverflow = document.body.style.overflow;
        const trigger = rowRefs.current[selected.url];
        document.body.style.overflow = 'hidden';
        closeRef.current?.focus();

        const onKeyDown = (event: globalThis.KeyboardEvent) => {
            if (event.key === 'Escape') {
                setSelectedUrl('');
                return;
            }
            if (event.key !== 'Tab' || !dialogRef.current) return;

            const focusable = Array.from(
                dialogRef.current.querySelectorAll<HTMLElement>('a[href], button'),
            );
            const first = focusable[0];
            const last = focusable.at(-1);
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last?.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first?.focus();
            }
        };

        window.addEventListener('keydown', onKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', onKeyDown);
            trigger?.focus();
        };
    }, [selected]);

    const onRowsKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
        const rows = [
            ...event.currentTarget.querySelectorAll<HTMLButtonElement>('[data-contribution-row]'),
        ];
        const index = rows.indexOf(document.activeElement as HTMLButtonElement);
        if (index < 0) return;
        event.preventDefault();
        rows[
            Math.min(
                rows.length - 1,
                Math.max(0, index + (event.key === 'ArrowDown' ? 1 : -1)),
            )
        ]?.focus();
    };

    return (
        <TerminalWindow
            currentPage="open-source"
            path="~/open-source"
            status={<span>{items.length} public PRs</span>}
        >
            <CommandLine cwd="~/open-source">
                <div className="flex flex-wrap items-baseline gap-x-2">
                    <Prompt cwd="~/open-source" />
                    <span className="term-cmd">open archive</span>
                </div>

                <div className="contribution-heading">
                    <div>
                        <h1>Open source</h1>
                        <p>Work I have contributed to beyond my own repositories.</p>
                    </div>
                    {years.length > 0 ? (
                        <label className="contribution-year-select">
                            <span>year</span>
                            <select
                                value={activeYear}
                                onChange={event => {
                                    setYear(event.target.value);
                                    setSelectedUrl('');
                                }}
                                aria-label="Contribution year"
                            >
                                {years.map(value => (
                                    <option key={value} value={value}>
                                        {value} ·{' '}
                                        {items.filter(item => item.date.startsWith(value)).length}
                                    </option>
                                ))}
                            </select>
                        </label>
                    ) : null}
                </div>

                {loading ? <p className="ink-faint mt-8">loading contributions…</p> : null}
                {error ? <p className="term-err mt-8">{error}</p> : null}
                {notice ? <p className="ink-faint mt-4 text-xs">{notice}</p> : null}
                {!loading && !error && items.length === 0 ? (
                    <p className="ink-faint mt-8">No public pull requests found yet.</p>
                ) : null}

                {visible.length > 0 ? (
                    <div className="contribution-archive" onKeyDown={onRowsKeyDown}>
                        {groups.map(([month, monthItems]) => (
                            <section key={month} className="contribution-month">
                                <div className="contribution-month__heading">
                                    <h2>{monthName(month)}</h2>
                                    <span>{monthItems.length}</span>
                                </div>
                                <div className="contribution-list">
                                    {monthItems.map(item => (
                                        <button
                                            key={item.url}
                                            ref={element => {
                                                rowRefs.current[item.url] = element;
                                            }}
                                            type="button"
                                            data-contribution-row
                                            onClick={() => setSelectedUrl(item.url)}
                                            className="contribution-row"
                                            aria-haspopup="dialog"
                                        >
                                            <span className="contribution-row__date">
                                                {item.date.slice(8)}
                                            </span>
                                            <span className="contribution-row__body">
                                                <span className="contribution-row__title">
                                                    {item.title}
                                                </span>
                                                <span className="contribution-row__repo">
                                                    {item.repository}
                                                </span>
                                            </span>
                                            <span
                                                className={`contribution-status contribution-status--${item.status}`}
                                            >
                                                {item.status}
                                            </span>
                                            <span className="contribution-row__arrow" aria-hidden="true">
                                                →
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                ) : null}
            </CommandLine>

            {selected ? (
                <div
                    className="contribution-modal__backdrop"
                    onMouseDown={event => {
                        if (event.currentTarget === event.target) setSelectedUrl('');
                    }}
                >
                    <div
                        ref={dialogRef}
                        className="contribution-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={titleId}
                        aria-describedby={descriptionId}
                    >
                        <div className="contribution-modal__head">
                            <div>
                                <p className="contribution-modal__eyebrow">
                                    {selected.repository} · {selected.date}
                                </p>
                                <h2 id={titleId}>{selected.title}</h2>
                            </div>
                            <button
                                ref={closeRef}
                                type="button"
                                className="contribution-modal__close"
                                onClick={() => setSelectedUrl('')}
                                aria-label="Close contribution details"
                            >
                                ×
                            </button>
                        </div>

                        <div id={descriptionId} className="contribution-modal__body">
                            {note ? (
                                <>
                                    <section>
                                        <h3>What changed</h3>
                                        <p>{note.changed}</p>
                                    </section>
                                    <section>
                                        <h3>Why it matters</h3>
                                        <p>{note.why}</p>
                                    </section>
                                    {note.learned ? (
                                        <section>
                                            <h3>What I learned</h3>
                                            <p>{note.learned}</p>
                                        </section>
                                    ) : null}
                                </>
                            ) : selected.description ? (
                                <section>
                                    <h3>About this contribution</h3>
                                    <p>{selected.description}</p>
                                </section>
                            ) : (
                                <p className="ink-faint">
                                    The pull request contains the implementation and discussion.
                                </p>
                            )}
                        </div>

                        <div className="contribution-modal__footer">
                            {note?.article ? (
                                <a href={note.article}>Read the full writeup</a>
                            ) : null}
                            <a href={selected.url} target="_blank" rel="noopener noreferrer">
                                View on GitHub ↗
                            </a>
                        </div>
                    </div>
                </div>
            ) : null}
        </TerminalWindow>
    );
}
