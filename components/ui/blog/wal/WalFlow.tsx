'use client';

import { useEffect, useRef, useState } from 'react';
import { Button, Figure } from '../Figure';

const STAGES = [
    { id: 'client', label: 'client', note: 'PUT user:1 = "ada"' },
    { id: 'wal', label: 'wal.Append', note: 'encode + buffer' },
    { id: 'fsync', label: 'fsync', note: 'force to platter' },
    { id: 'memtable', label: 'memtable', note: 'apply in memory' },
    { id: 'ack', label: 'ack', note: 'client is told OK' },
];

const STEP_MS = 900;

export const WalFlow = () => {
    const [step, setStep] = useState(-1);
    const [playing, setPlaying] = useState(false);
    const timer = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (!playing) return;

        timer.current = setInterval(() => {
            setStep(prev => (prev >= STAGES.length - 1 ? 0 : prev + 1));
        }, STEP_MS);

        return () => {
            if (timer.current) clearInterval(timer.current);
        };
    }, [playing]);

    const play = () => {
        setStep(0);
        setPlaying(true);
    };

    const reset = () => {
        setPlaying(false);
        setStep(-1);
    };

    return (
        <Figure
            caption="fig 1 — the write-ahead rule: the log is durable before the memtable changes, and long before the client hears yes."
            controls={
                <>
                    <Button
                        onClick={playing ? () => setPlaying(false) : play}
                        active={playing}
                    >
                        {playing ? 'pause' : 'play'}
                    </Button>
                    <Button onClick={reset}>reset</Button>
                    <Button
                        onClick={() =>
                            setStep(s => Math.min(s + 1, STAGES.length - 1))
                        }
                    >
                        step →
                    </Button>
                    <span
                        className="ml-auto text-[11px]"
                        style={{
                            color: 'var(--paper-faint)',
                            fontFamily: 'var(--font-mono)',
                        }}
                    >
                        {step < 0 ? 'idle' : STAGES[step].note}
                    </span>
                </>
            }
        >
            <div className="flex flex-col">
                {STAGES.map((stage, idx) => {
                    const done = step > idx;
                    const active = step === idx;

                    return (
                        <div key={stage.id}>
                            <div
                                className="rounded-[3px] border px-3 py-2 transition-all duration-300"
                                style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '13px',
                                    borderColor: active
                                        ? 'var(--term-green)'
                                        : done
                                          ? 'var(--term-blue)'
                                          : 'var(--paper-line-strong)',
                                    background: active
                                        ? 'color-mix(in oklab, var(--term-green) 12%, transparent)'
                                        : 'transparent',
                                    color: active
                                        ? 'var(--paper-bright)'
                                        : done
                                          ? 'var(--paper-ink)'
                                          : 'var(--paper-faint)',
                                    transform: active
                                        ? 'translateX(6px)'
                                        : 'translateX(0)',
                                }}
                            >
                                <span style={{ color: 'var(--paper-faint)' }}>
                                    {idx + 1}.{' '}
                                </span>
                                {stage.label}
                                {stage.id === 'fsync' && (
                                    <span
                                        className="ml-2 text-[11px]"
                                        style={{ color: 'var(--term-amber)' }}
                                    >
                                        ← the only line that survives power loss
                                    </span>
                                )}
                            </div>

                            {idx < STAGES.length - 1 && (
                                <div
                                    className="py-1 text-center text-[13px] transition-colors duration-300"
                                    style={{
                                        color: done
                                            ? 'var(--term-green)'
                                            : 'var(--paper-line-strong)',
                                    }}
                                >
                                    ↓
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </Figure>
    );
};
