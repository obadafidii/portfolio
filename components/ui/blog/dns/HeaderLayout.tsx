'use client';

import { useState } from 'react';
import { Figure } from '../Figure';

/** The 16 bits of the DNS header's second word, per RFC 1035 §4.1.1. */
const BITS = [
    {
        name: 'QR',
        width: 1,
        color: 'var(--term-blue)',
        note: '0 = query, 1 = response. A resolver flips this bit and sends the same message back.',
    },
    {
        name: 'OPCODE',
        width: 4,
        color: 'var(--term-violet)',
        note: '0 for a standard query. 4 is NOTIFY, 5 is UPDATE (dynamic DNS). Almost everything you will see is 0.',
    },
    {
        name: 'AA',
        width: 1,
        color: 'var(--term-green)',
        note: 'Authoritative Answer. Set when the responder owns the zone rather than relaying a cached copy. This is how a resolver knows to stop walking.',
    },
    {
        name: 'TC',
        width: 1,
        color: 'var(--term-amber)',
        note: 'TrunCated. The answer did not fit in the UDP payload limit. The client is expected to retry over TCP.',
    },
    {
        name: 'RD',
        width: 1,
        color: 'var(--term-blue)',
        note: 'Recursion Desired. Set by stub resolvers asking a recursive server to do the walking for them.',
    },
    {
        name: 'RA',
        width: 1,
        color: 'var(--term-blue)',
        note: 'Recursion Available. The server telling you whether it is willing to recurse. Root and TLD servers set this to 0.',
    },
    {
        name: 'Z',
        width: 3,
        color: 'var(--paper-muted)',
        note: 'Reserved. Must be zero — though one bit was later reclaimed for DNSSEC as the AD (Authentic Data) flag.',
    },
    {
        name: 'RCODE',
        width: 4,
        color: 'var(--term-red)',
        note: '0 NOERROR, 1 FORMERR, 2 SERVFAIL, 3 NXDOMAIN (the name does not exist), 5 REFUSED.',
    },
];

export const HeaderLayout = () => {
    const [active, setActive] = useState<number | null>(null);

    return (
        <Figure caption="fig 1 — the flags word: sixteen bits carrying most of DNS's control logic. hover or tap a field.">
            <div className="flex w-full overflow-hidden rounded-[3px]">
                {BITS.map((bit, idx) => (
                    <button
                        key={bit.name}
                        type="button"
                        onMouseEnter={() => setActive(idx)}
                        onFocus={() => setActive(idx)}
                        onClick={() => setActive(idx)}
                        aria-label={`${bit.name}, ${bit.width} bit${bit.width > 1 ? 's' : ''}`}
                        className="cursor-pointer border-y border-r px-1 py-3 text-center transition-all duration-200 first:border-l"
                        style={{
                            flex: `${bit.width} 1 0`,
                            minWidth: 0,
                            fontFamily: 'var(--font-mono)',
                            fontSize: '11px',
                            borderColor: 'var(--paper-line-strong)',
                            background:
                                active === idx
                                    ? `color-mix(in oklab, ${bit.color} 24%, transparent)`
                                    : `color-mix(in oklab, ${bit.color} 8%, transparent)`,
                            color:
                                active === idx
                                    ? 'var(--paper-bright)'
                                    : 'var(--paper-muted)',
                        }}
                    >
                        <span className="block truncate">{bit.name}</span>
                        <span
                            className="block"
                            style={{ color: 'var(--paper-faint)' }}
                        >
                            {bit.width}
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
                <span>bit 0</span>
                <span>16 bits · offset 2 in the header</span>
                <span>bit 15</span>
            </div>

            <p
                className="mt-3 min-h-[3.2em] text-[12.5px]"
                style={{ color: 'var(--paper-muted)', lineHeight: 1.6 }}
            >
                {active === null
                    ? 'Pick a field to see what it controls.'
                    : BITS[active].note}
            </p>
        </Figure>
    );
};
