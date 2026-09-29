'use client';

import { useState } from 'react';
import { Button, Figure } from '../Figure';

type Mode = 'none' | 'write' | 'fsync' | 'group';

const MODES: {
    id: Mode;
    label: string;
    survives: string;
    cost: string;
    detail: string;
}[] = [
    {
        id: 'none',
        label: 'buffer only',
        survives: 'nothing',
        cost: '~0',
        detail: 'Bytes sit in your process. A panic loses them, never mind the machine. Fine for a cache, dishonest for a database.',
    },
    {
        id: 'write',
        label: 'write(2)',
        survives: 'process crash',
        cost: '~5µs',
        detail: 'Now the kernel has the bytes in page cache. Your process can die and the data still lands on disk. Pull the power and it is gone.',
    },
    {
        id: 'fsync',
        label: 'write + fsync',
        survives: 'power loss',
        cost: '~1–10ms',
        detail: 'The kernel is told to push page cache to stable storage and wait. This is the only option that honours a durability promise — and it costs three orders of magnitude more.',
    },
    {
        id: 'group',
        label: 'group commit',
        survives: 'power loss',
        cost: '~1–10ms / batch',
        detail: 'One fsync covering many waiting writers. Each writer still waits a full fsync, but throughput scales with batch size instead of collapsing to one commit per fsync.',
    },
];

const LAYERS = [
    {
        id: 'app',
        label: 'process buffer',
        reachedBy: ['none', 'write', 'fsync', 'group'],
    },
    {
        id: 'page',
        label: 'kernel page cache',
        reachedBy: ['write', 'fsync', 'group'],
    },
    { id: 'disk', label: 'stable storage', reachedBy: ['fsync', 'group'] },
];

export const DurabilityLadder = () => {
    const [mode, setMode] = useState<Mode>('fsync');
    const current = MODES.find(m => m.id === mode)!;

    return (
        <Figure
            caption="fig 4 — how far down the stack your bytes actually get. only the bottom rung survives losing power."
            controls={
                <>
                    {MODES.map(m => (
                        <Button
                            key={m.id}
                            onClick={() => setMode(m.id)}
                            active={mode === m.id}
                        >
                            {m.label}
                        </Button>
                    ))}
                </>
            }
        >
            <div className="space-y-2">
                {LAYERS.map(layer => {
                    const reached = layer.reachedBy.includes(mode);
                    return (
                        <div
                            key={layer.id}
                            className="flex items-center justify-between rounded-[3px] border px-3 py-2.5 transition-all duration-300"
                            style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '13px',
                                borderColor: reached
                                    ? 'var(--term-green)'
                                    : 'var(--paper-line-strong)',
                                background: reached
                                    ? 'color-mix(in oklab, var(--term-green) 10%, transparent)'
                                    : 'transparent',
                                color: reached
                                    ? 'var(--paper-bright)'
                                    : 'var(--paper-faint)',
                            }}
                        >
                            <span>{layer.label}</span>
                            <span
                                style={{
                                    color: reached
                                        ? 'var(--term-green)'
                                        : 'var(--paper-line-strong)',
                                }}
                            >
                                {reached ? '● reached' : '○ not reached'}
                            </span>
                        </div>
                    );
                })}
            </div>

            <div
                className="mt-4 grid gap-3 border-t pt-3 sm:grid-cols-2"
                style={{ borderColor: 'var(--paper-line)' }}
            >
                <div
                    style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}
                >
                    <div style={{ color: 'var(--paper-faint)' }}>survives</div>
                    <div style={{ color: 'var(--paper-bright)' }}>
                        {current.survives}
                    </div>
                </div>
                <div
                    style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}
                >
                    <div style={{ color: 'var(--paper-faint)' }}>
                        cost per commit
                    </div>
                    <div style={{ color: 'var(--term-amber)' }}>
                        {current.cost}
                    </div>
                </div>
            </div>

            <p
                className="mt-3 text-[12.5px]"
                style={{ color: 'var(--paper-muted)', lineHeight: 1.6 }}
            >
                {current.detail}
            </p>
        </Figure>
    );
};
