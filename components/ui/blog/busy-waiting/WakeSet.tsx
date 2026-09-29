'use client';

import { useState } from 'react';

import { Button, Figure } from '../Figure';

type WorkerState = 'waiting' | 'runnable';

const INITIAL: WorkerState[] = ['waiting', 'waiting', 'waiting'];

export const WakeSet = () => {
    const [workers, setWorkers] = useState<WorkerState[]>(INITIAL);

    const signal = () => {
        setWorkers(current => {
            const firstWaiting = current.indexOf('waiting');
            if (firstWaiting === -1) return current;
            return current.map((state, index) =>
                index === firstWaiting ? 'runnable' : state,
            );
        });
    };

    const broadcast = () =>
        setWorkers(current => current.map(() => 'runnable'));
    const reset = () => setWorkers(INITIAL);

    return (
        <Figure
            caption="fig 2 — signal makes at least one waiter runnable; broadcast makes every waiter runnable. each one must reacquire the mutex before it can inspect shared state."
            controls={
                <>
                    <Button onClick={signal}>signal one</Button>
                    <Button onClick={broadcast}>broadcast all</Button>
                    <Button onClick={reset}>put workers back to sleep</Button>
                </>
            }
        >
            <div className="grid gap-3 sm:grid-cols-3">
                {workers.map((state, index) => (
                    <div
                        key={index}
                        className="rounded-[4px] border p-3 transition-all duration-300"
                        style={{
                            borderColor:
                                state === 'runnable'
                                    ? 'var(--term-green)'
                                    : 'var(--paper-line-strong)',
                            background:
                                state === 'runnable'
                                    ? 'color-mix(in oklab, var(--term-green) 10%, transparent)'
                                    : 'transparent',
                            fontFamily: 'var(--font-mono)',
                        }}
                    >
                        <div
                            className="flex items-center justify-between text-[12px]"
                            style={{ color: 'var(--paper-bright)' }}
                        >
                            <span>worker {index + 1}</span>
                            <span
                                className={
                                    state === 'runnable'
                                        ? 'motion-safe:animate-pulse'
                                        : ''
                                }
                                style={{
                                    color:
                                        state === 'runnable'
                                            ? 'var(--term-green)'
                                            : 'var(--term-blue)',
                                }}
                                aria-hidden="true"
                            >
                                {state === 'runnable' ? '●' : '◌'}
                            </span>
                        </div>
                        <div
                            className="mt-3 text-[11px]"
                            style={{
                                color:
                                    state === 'runnable'
                                        ? 'var(--term-green)'
                                        : 'var(--paper-faint)',
                            }}
                        >
                            {state === 'runnable'
                                ? 'runnable → compete for mutex'
                                : 'parked → consumes no CPU'}
                        </div>
                    </div>
                ))}
            </div>

            <div
                className="mt-3 flex items-center justify-between rounded-[3px] border px-3 py-2 text-[12px]"
                style={{
                    borderColor: 'var(--paper-line-strong)',
                    color: 'var(--paper-muted)',
                    fontFamily: 'var(--font-mono)',
                }}
            >
                <span>shared mutex</span>
                <span style={{ color: 'var(--term-amber)' }}>
                    one owner at a time
                </span>
            </div>
        </Figure>
    );
};
