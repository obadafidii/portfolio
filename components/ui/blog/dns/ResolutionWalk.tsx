'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Figure } from '../Figure';

interface Hop {
    server: string;
    asks: string;
    replies: string;
    kind: 'referral' | 'answer';
    detail: string;
}

const HOPS: Hop[] = [
    {
        server: 'root (a.root-servers.net)',
        asks: 'A? www.example.com',
        replies: 'NS for com. → a.gtld-servers.net',
        kind: 'referral',
        detail: 'The root knows nothing about example.com. It knows who runs .com. Thirteen root server addresses are hardcoded into every resolver.',
    },
    {
        server: 'tld (a.gtld-servers.net)',
        asks: 'A? www.example.com',
        replies: 'NS for example.com. → ns1.example.com',
        kind: 'referral',
        detail: 'The .com servers do not hold example.com records either. They hold the delegation: which nameservers are authoritative for that zone.',
    },
    {
        server: 'authoritative (ns1.example.com)',
        asks: 'A? www.example.com',
        replies: 'A 93.184.216.34  (AA=1, TTL 86400)',
        kind: 'answer',
        detail: 'This server owns the zone, so it sets the AA bit. The walk stops here. The TTL says how long the resolver may reuse this without asking again.',
    },
];

export const ResolutionWalk = () => {
    const [step, setStep] = useState(-1);
    const [playing, setPlaying] = useState(false);
    const [cached, setCached] = useState(false);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const reset = useCallback(() => {
        setPlaying(false);
        setStep(-1);
        setCached(false);
    }, []);

    useEffect(() => {
        if (!playing) return;

        timer.current = setTimeout(() => {
            setStep(prev => {
                if (prev >= HOPS.length - 1) {
                    setPlaying(false);
                    return prev;
                }
                return prev + 1;
            });
        }, 1100);

        return () => {
            if (timer.current) clearTimeout(timer.current);
        };
    }, [playing, step]);

    return (
        <Figure
            caption="fig 2 — recursive resolution. each hop hands back a better-informed pointer, not an answer. only the last server sets AA."
            controls={
                <>
                    <Button
                        onClick={() => {
                            if (step >= HOPS.length - 1) reset();
                            setCached(false);
                            setStep(s => (s < 0 ? 0 : s));
                            setPlaying(true);
                        }}
                        active={playing}
                    >
                        resolve
                    </Button>
                    <Button
                        onClick={() => {
                            setPlaying(false);
                            setCached(true);
                            setStep(HOPS.length - 1);
                        }}
                        active={cached}
                    >
                        ask again (cached)
                    </Button>
                    <Button onClick={reset}>reset</Button>
                    <span
                        className="ml-auto text-[11px]"
                        style={{
                            fontFamily: 'var(--font-mono)',
                            color: 'var(--paper-faint)',
                        }}
                    >
                        {cached
                            ? '1 hop, ~0ms'
                            : step < 0
                              ? 'cold cache'
                              : `${step + 1} of ${HOPS.length} hops`}
                    </span>
                </>
            }
        >
            {cached && (
                <div
                    className="mb-3 rounded-[3px] border px-3 py-2 text-[12px]"
                    style={{
                        fontFamily: 'var(--font-mono)',
                        borderColor: 'var(--term-green)',
                        background:
                            'color-mix(in oklab, var(--term-green) 12%, transparent)',
                        color: 'var(--paper-bright)',
                    }}
                >
                    cache hit — answered locally, no packets sent. this is why
                    DNS survives at internet scale, and why a bad record lingers
                    for exactly its TTL.
                </div>
            )}

            <div className="space-y-2" style={{ opacity: cached ? 0.35 : 1 }}>
                {HOPS.map((hop, idx) => {
                    const reached = step >= idx;
                    const isCurrent = step === idx && !cached;

                    return (
                        <div
                            key={hop.server}
                            className="rounded-[3px] border p-3 transition-all duration-300"
                            style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '12px',
                                opacity: reached ? 1 : 0.3,
                                borderColor: isCurrent
                                    ? 'var(--term-green)'
                                    : reached && hop.kind === 'answer'
                                      ? 'var(--term-blue)'
                                      : 'var(--paper-line-strong)',
                                background: isCurrent
                                    ? 'color-mix(in oklab, var(--term-green) 10%, transparent)'
                                    : 'transparent',
                            }}
                        >
                            <div style={{ color: 'var(--paper-bright)' }}>
                                {hop.server}
                            </div>
                            <div
                                className="mt-1"
                                style={{ color: 'var(--paper-faint)' }}
                            >
                                → {hop.asks}
                            </div>
                            <div
                                style={{
                                    color:
                                        hop.kind === 'answer'
                                            ? 'var(--term-green)'
                                            : 'var(--term-blue)',
                                }}
                            >
                                ← {hop.replies}
                            </div>
                        </div>
                    );
                })}
            </div>

            <p
                className="mt-3 min-h-[3.2em] text-[12.5px]"
                style={{ color: 'var(--paper-muted)', lineHeight: 1.6 }}
            >
                {step < 0 || cached
                    ? 'Press resolve to walk the tree from the root.'
                    : HOPS[step].detail}
            </p>
        </Figure>
    );
};
