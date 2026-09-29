'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Figure } from '../Figure';

interface Op {
    lsn: number;
    op: string;
    key: string;
    value: string;
    /** Written to the log but never fsynced — lost on power loss. */
    unflushed?: boolean;
}

const OPS: Op[] = [
    { lsn: 1, op: 'SET', key: 'user:1', value: 'ada' },
    { lsn: 2, op: 'SET', key: 'user:2', value: 'grace' },
    { lsn: 3, op: 'DEL', key: 'user:1', value: '' },
    { lsn: 4, op: 'SET', key: 'user:3', value: 'alan' },
    { lsn: 5, op: 'SET', key: 'user:2', value: 'hopper', unflushed: true },
];

type Phase = 'writing' | 'crashed' | 'replaying' | 'recovered';

const applyTo = (state: Record<string, string>, op: Op) => {
    const next = { ...state };
    if (op.op === 'DEL') delete next[op.key];
    else next[op.key] = op.value;
    return next;
};

export const CrashReplay = () => {
    const [phase, setPhase] = useState<Phase>('writing');
    const [cursor, setCursor] = useState(0);
    const [memory, setMemory] = useState<Record<string, string>>({});
    const [playing, setPlaying] = useState(false);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const durable = OPS.filter(op => !op.unflushed);

    const reset = useCallback(() => {
        setPlaying(false);
        setPhase('writing');
        setCursor(0);
        setMemory({});
    }, []);

    const crash = useCallback(() => {
        setPlaying(false);
        setPhase('crashed');
        setMemory({});
    }, []);

    const replay = useCallback(() => {
        setPhase('replaying');
        setCursor(0);
        setMemory({});
        setPlaying(true);
    }, []);

    useEffect(() => {
        if (!playing) return;

        timer.current = setTimeout(() => {
            if (phase === 'writing') {
                if (cursor >= OPS.length) {
                    setPlaying(false);
                    return;
                }
                setMemory(prev => applyTo(prev, OPS[cursor]));
                setCursor(cursor + 1);
                return;
            }

            if (phase === 'replaying') {
                if (cursor >= durable.length) {
                    setPhase('recovered');
                    setPlaying(false);
                    return;
                }
                setMemory(prev => applyTo(prev, durable[cursor]));
                setCursor(cursor + 1);
            }
        }, 700);

        return () => {
            if (timer.current) clearTimeout(timer.current);
        };
    }, [playing, cursor, phase, durable]);

    const visibleLog =
        phase === 'crashed' || phase === 'replaying' || phase === 'recovered'
            ? durable
            : OPS.slice(0, cursor);

    const highlight =
        phase === 'replaying'
            ? cursor - 1
            : phase === 'writing'
              ? cursor - 1
              : -1;

    return (
        <Figure
            caption="fig 2 — a crash wipes memory, not the log. replay rebuilds state from record 1. the unflushed record 5 is simply gone, and that is correct: the client was never told it succeeded."
            controls={
                <>
                    <Button
                        onClick={() => {
                            if (phase !== 'writing') reset();
                            setPlaying(p => !p);
                        }}
                        active={playing && phase === 'writing'}
                    >
                        {playing && phase === 'writing' ? 'pause' : 'write'}
                    </Button>
                    <Button onClick={crash} active={phase === 'crashed'}>
                        crash
                    </Button>
                    <Button onClick={replay} active={phase === 'replaying'}>
                        replay
                    </Button>
                    <Button onClick={reset}>reset</Button>
                    <span
                        className="ml-auto text-[11px]"
                        style={{
                            fontFamily: 'var(--font-mono)',
                            color:
                                phase === 'crashed'
                                    ? 'var(--term-red)'
                                    : phase === 'recovered'
                                      ? 'var(--term-green)'
                                      : 'var(--paper-faint)',
                        }}
                    >
                        {phase}
                    </span>
                </>
            }
        >
            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <p
                        className="mb-2 text-[11px] uppercase tracking-[0.14em]"
                        style={{
                            color: 'var(--paper-faint)',
                            fontFamily: 'var(--font-mono)',
                        }}
                    >
                        wal segment (on disk)
                    </p>
                    <div className="space-y-1">
                        {OPS.map((op, idx) => {
                            const written = visibleLog.some(
                                v => v.lsn === op.lsn,
                            );
                            const lost = op.unflushed && phase !== 'writing';
                            const isCurrent =
                                idx === highlight && phase === 'replaying';

                            return (
                                <div
                                    key={op.lsn}
                                    className="rounded-[3px] border px-2 py-1 transition-all duration-300"
                                    style={{
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: '12px',
                                        opacity: written || lost ? 1 : 0.25,
                                        borderColor: isCurrent
                                            ? 'var(--term-green)'
                                            : lost
                                              ? 'var(--term-red)'
                                              : 'var(--paper-line-strong)',
                                        background: isCurrent
                                            ? 'color-mix(in oklab, var(--term-green) 14%, transparent)'
                                            : 'transparent',
                                        textDecoration: lost
                                            ? 'line-through'
                                            : 'none',
                                        color: lost
                                            ? 'var(--term-red)'
                                            : written
                                              ? 'var(--paper-ink)'
                                              : 'var(--paper-faint)',
                                    }}
                                >
                                    <span
                                        style={{ color: 'var(--paper-faint)' }}
                                    >
                                        lsn=
                                        {String(op.lsn).padStart(2, '0')}{' '}
                                    </span>
                                    {op.op} {op.key}
                                    {op.value && ` = "${op.value}"`}
                                    {op.unflushed && (
                                        <span
                                            className="ml-2"
                                            style={{
                                                color: 'var(--term-amber)',
                                            }}
                                        >
                                            (buffered, not fsynced)
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div>
                    <p
                        className="mb-2 text-[11px] uppercase tracking-[0.14em]"
                        style={{
                            color: 'var(--paper-faint)',
                            fontFamily: 'var(--font-mono)',
                        }}
                    >
                        memtable (in memory)
                    </p>
                    <div
                        className="rounded-[3px] border p-3 transition-colors duration-300"
                        style={{
                            minHeight: '132px',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '12px',
                            borderColor:
                                phase === 'crashed'
                                    ? 'var(--term-red)'
                                    : 'var(--paper-line-strong)',
                        }}
                    >
                        {phase === 'crashed' ? (
                            <span style={{ color: 'var(--term-red)' }}>
                                — power lost, memory gone —
                            </span>
                        ) : Object.keys(memory).length === 0 ? (
                            <span style={{ color: 'var(--paper-faint)' }}>
                                empty
                            </span>
                        ) : (
                            Object.entries(memory).map(([key, value]) => (
                                <div
                                    key={key}
                                    style={{ color: 'var(--paper-ink)' }}
                                >
                                    {key}{' '}
                                    <span
                                        style={{ color: 'var(--paper-faint)' }}
                                    >
                                        =
                                    </span>{' '}
                                    <span style={{ color: 'var(--term-blue)' }}>
                                        &quot;{value}&quot;
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </Figure>
    );
};
