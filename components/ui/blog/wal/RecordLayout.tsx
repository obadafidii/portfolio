'use client';

import { useState } from 'react';
import { Figure } from '../Figure';

const FIELDS = [
    {
        name: 'crc',
        bytes: 4,
        color: 'var(--term-red)',
        note: 'castagnoli checksum over everything after it. this is how replay tells a complete record from a torn one.',
    },
    {
        name: 'length',
        bytes: 4,
        color: 'var(--term-amber)',
        note: 'payload length. read this, then read exactly this many bytes. no delimiter scanning.',
    },
    {
        name: 'type',
        bytes: 1,
        color: 'var(--term-violet)',
        note: 'full, first, middle or last — so a record larger than the remaining block can be split across blocks.',
    },
    {
        name: 'lsn',
        bytes: 8,
        color: 'var(--term-blue)',
        note: 'monotonic log sequence number. lets recovery skip records already folded into a checkpoint.',
    },
    {
        name: 'payload',
        bytes: 12,
        color: 'var(--term-green)',
        note: 'the encoded mutation itself: op, key, value. the WAL does not care what is in here.',
    },
];

const TOTAL = FIELDS.reduce((sum, f) => sum + f.bytes, 0);

export const RecordLayout = () => {
    const [active, setActive] = useState<number | null>(null);

    return (
        <Figure caption="fig 3 — one record on disk. hover or tap a field. the header is 17 bytes before a single byte of your data.">
            <div className="flex w-full overflow-hidden rounded-[3px]">
                {FIELDS.map((field, idx) => (
                    <button
                        key={field.name}
                        type="button"
                        onMouseEnter={() => setActive(idx)}
                        onFocus={() => setActive(idx)}
                        onClick={() => setActive(idx)}
                        aria-label={`${field.name}, ${field.bytes} bytes`}
                        className="cursor-pointer border-y border-r px-1 py-3 text-center transition-all duration-200 first:border-l"
                        style={{
                            flex: `${field.bytes} 1 0`,
                            minWidth: 0,
                            fontFamily: 'var(--font-mono)',
                            fontSize: '11px',
                            borderColor: 'var(--paper-line-strong)',
                            background:
                                active === idx
                                    ? `color-mix(in oklab, ${field.color} 22%, transparent)`
                                    : `color-mix(in oklab, ${field.color} 8%, transparent)`,
                            color:
                                active === idx
                                    ? 'var(--paper-bright)'
                                    : 'var(--paper-muted)',
                        }}
                    >
                        <span className="block truncate">{field.name}</span>
                        <span
                            className="block"
                            style={{ color: 'var(--paper-faint)' }}
                        >
                            {field.bytes}b
                        </span>
                    </button>
                ))}
            </div>

            <div
                className="mt-3 flex items-baseline justify-between text-[11px]"
                style={{
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--paper-faint)',
                }}
            >
                <span>offset 0</span>
                <span>header = 17 bytes</span>
                <span>{TOTAL} bytes total</span>
            </div>

            <p
                className="mt-3 min-h-[3em] text-[12.5px]"
                style={{ color: 'var(--paper-muted)', lineHeight: 1.6 }}
            >
                {active === null
                    ? 'Pick a field to see what it is for.'
                    : FIELDS[active].note}
            </p>
        </Figure>
    );
};
