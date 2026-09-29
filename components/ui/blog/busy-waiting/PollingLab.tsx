'use client';

import { useEffect, useState } from 'react';

import { Button, Figure } from '../Figure';

type Mode = 'busy' | 'parked';

const MODE_COPY: Record<Mode, { label: string; idle: string; cpu: string }> = {
    busy: {
        label: 'busy-wait',
        idle: 'checking the predicate again…',
        cpu: '≈ 100%',
    },
    parked: {
        label: 'condition variable',
        idle: 'asleep in the wait set',
        cpu: '≈ 0%',
    },
};

export const PollingLab = () => {
    const [mode, setMode] = useState<Mode>('busy');
    const [running, setRunning] = useState(false);
    const [ready, setReady] = useState(false);
    const [polls, setPolls] = useState(0);

    useEffect(() => {
        if (!running || ready || mode !== 'busy') return;

        const timer = window.setInterval(
            () => setPolls(value => value + 1),
            90,
        );
        return () => window.clearInterval(timer);
    }, [mode, ready, running]);

    const chooseMode = (next: Mode) => {
        setMode(next);
        setRunning(false);
        setReady(false);
        setPolls(0);
    };

    const reset = () => {
        setRunning(false);
        setReady(false);
        setPolls(0);
    };

    const status = ready
        ? 'predicate is true → work can continue'
        : running
          ? MODE_COPY[mode].idle
          : 'press start to make the worker wait';

    return (
        <Figure
            caption="fig 1 — the same wait, paid for differently. busy-waiting spends CPU on repeated checks; a condition variable parks the worker until a signal arrives."
            controls={
                <>
                    <Button
                        onClick={() => chooseMode('busy')}
                        active={mode === 'busy'}
                    >
                        busy-wait
                    </Button>
                    <Button
                        onClick={() => chooseMode('parked')}
                        active={mode === 'parked'}
                    >
                        condition variable
                    </Button>
                    <Button
                        onClick={() => setRunning(true)}
                        active={running && !ready}
                    >
                        start
                    </Button>
                    <Button
                        onClick={() => {
                            setReady(true);
                            setRunning(false);
                        }}
                    >
                        change state + signal
                    </Button>
                    <Button onClick={reset}>reset</Button>
                </>
            }
        >
            <div className="grid gap-3 sm:grid-cols-[1fr_1.25fr]">
                <div
                    className="flex min-h-40 flex-col items-center justify-center rounded-[4px] border p-4 text-center"
                    style={{ borderColor: 'var(--paper-line-strong)' }}
                >
                    <div
                        className={
                            running && !ready && mode === 'busy'
                                ? 'motion-safe:animate-spin'
                                : ''
                        }
                        style={{
                            width: 62,
                            height: 62,
                            border: '4px solid var(--paper-line-strong)',
                            borderTopColor: ready
                                ? 'var(--term-green)'
                                : running && mode === 'busy'
                                  ? 'var(--term-red)'
                                  : 'var(--term-blue)',
                            borderRadius: '999px',
                        }}
                        aria-hidden="true"
                    />
                    <span
                        className="mt-3 text-[12px]"
                        style={{
                            color: 'var(--paper-faint)',
                            fontFamily: 'var(--font-mono)',
                        }}
                    >
                        worker thread
                    </span>
                </div>

                <div className="grid content-center gap-2">
                    <Metric label="strategy" value={MODE_COPY[mode].label} />
                    <Metric
                        label="predicate checks"
                        value={
                            mode === 'busy'
                                ? polls.toLocaleString()
                                : ready
                                  ? '1 after wake'
                                  : running
                                    ? '0 (parked)'
                                    : '0'
                        }
                    />
                    <Metric
                        label="CPU while waiting"
                        value={running && !ready ? MODE_COPY[mode].cpu : 'idle'}
                        warning={running && !ready && mode === 'busy'}
                    />
                    <div
                        className="mt-1 min-h-10 rounded-[3px] border px-3 py-2 text-[12px]"
                        style={{
                            borderColor: ready
                                ? 'var(--term-green)'
                                : 'var(--paper-line-strong)',
                            color: ready
                                ? 'var(--term-green)'
                                : 'var(--paper-muted)',
                            fontFamily: 'var(--font-mono)',
                        }}
                        aria-live="polite"
                    >
                        {status}
                    </div>
                </div>
            </div>
        </Figure>
    );
};

const Metric = ({
    label,
    value,
    warning = false,
}: {
    label: string;
    value: string;
    warning?: boolean;
}) => (
    <div
        className="flex items-baseline justify-between gap-4 border-b py-1.5 text-[12px]"
        style={{
            borderColor: 'var(--paper-line)',
            fontFamily: 'var(--font-mono)',
        }}
    >
        <span style={{ color: 'var(--paper-faint)' }}>{label}</span>
        <span
            style={{
                color: warning ? 'var(--term-red)' : 'var(--paper-bright)',
            }}
        >
            {value}
        </span>
    </div>
);
