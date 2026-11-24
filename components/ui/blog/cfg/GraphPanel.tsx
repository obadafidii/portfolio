'use client';

import { useId } from 'react';
import { BLOCK_TINT, fmt, type Step } from './simulate';

const W = 360;
const H = 300;
const NODE_W = 172;
const POS: Record<string, { x: number; y: number }> = {
    main: { x: 180, y: 42 },
    label: { x: 100, y: 150 },
    label2: { x: 230, y: 258 },
};
const NODE_H = 62;

function edgePath(from: string, to: string) {
    const a = POS[from];
    const b = POS[to];
    const startY = a.y + NODE_H / 2;
    const endY = b.y - NODE_H / 2 - 4;
    const sx = a.x + (b.x > a.x ? 30 : b.x < a.x ? -30 : 0);
    const ex = b.x + (b.x > a.x ? -20 : b.x < a.x ? 20 : 0);
    if (from === 'main' && to === 'label2') {
        // route around the right of "label"
        return `M ${a.x + 70} ${startY} C ${a.x + 130} ${startY + 70}, ${b.x + 60} ${endY - 60}, ${b.x + 40} ${endY}`;
    }
    const my = (startY + endY) / 2;
    return `M ${sx} ${startY} C ${sx} ${my}, ${ex} ${my}, ${ex} ${endY}`;
}

/** Right pane: the graph as build() fills it in, plus a line on what just happened. */
export const GraphPanel = ({
    step: s,
    index,
    maxWidth,
}: {
    step: Step;
    index: number;
    /** Caps the drawing so nodes never balloon on wide screens. */
    maxWidth: number;
}) => {
    const id = useId().replace(/:/g, '');
    const edges = s.blocks.flatMap((b, bi) =>
        (b.dest ?? []).map(to => ({
            from: b.node,
            to,
            tint: bi % BLOCK_TINT.length,
            key: `${b.name}-${to}`,
        })),
    );

    return (
        <div className="flex h-full flex-col p-3">
            <svg
                viewBox={`0 0 ${W} ${H}`}
                className="mx-auto h-auto w-full"
                role="img"
                aria-label={`Control flow graph after step ${index + 1}: ${s.note}`}
                style={{ fontFamily: 'var(--font-mono)', maxWidth }}
            >
                <defs>
                    {BLOCK_TINT.map((c, i) => (
                        <marker
                            key={i}
                            id={`${id}-arrow-${i}`}
                            viewBox="0 0 10 10"
                            refX="8"
                            refY="5"
                            markerWidth="7"
                            markerHeight="7"
                            orient="auto-start-reverse"
                        >
                            <path d="M 0 0 L 10 5 L 0 10 z" fill={c} />
                        </marker>
                    ))}
                </defs>

                {edges.map(e => (
                    <path
                        key={e.key}
                        d={edgePath(e.from, e.to)}
                        fill="none"
                        stroke={BLOCK_TINT[e.tint]}
                        strokeWidth={1.6}
                        markerEnd={`url(#${id}-arrow-${e.tint})`}
                    />
                ))}

                {Object.keys(POS).map(name => {
                    const exists = s.nodes.includes(name);
                    const p = POS[name];
                    const owned = s.blocks.filter(b => b.node === name);
                    const active = s.phase === 'blocks' && s.current === name;
                    const emptyAtEnd = s.phase === 'done' && owned.length === 0;
                    const stroke = emptyAtEnd
                        ? 'var(--term-red)'
                        : active
                          ? 'var(--term-amber)'
                          : 'var(--paper-line-strong)';
                    return (
                        <g
                            key={name}
                            style={{
                                opacity: exists ? 1 : 0.12,
                                transition: 'opacity 300ms',
                            }}
                        >
                            <rect
                                x={p.x - NODE_W / 2}
                                y={p.y - NODE_H / 2}
                                width={NODE_W}
                                height={NODE_H}
                                rx={4}
                                fill="var(--paper)"
                                stroke={stroke}
                                strokeWidth={active || emptyAtEnd ? 1.8 : 1}
                                strokeDasharray={exists ? undefined : '4 4'}
                            />
                            <text
                                x={p.x - NODE_W / 2 + 10}
                                y={p.y - NODE_H / 2 + 18}
                                fontSize={12}
                                fill="var(--term-violet)"
                            >
                                &quot;{name}&quot;
                            </text>
                            {owned.length === 0 ? (
                                <text
                                    x={p.x - NODE_W / 2 + 10}
                                    y={p.y + 14}
                                    fontSize={11}
                                    fill={
                                        emptyAtEnd
                                            ? 'var(--term-red)'
                                            : 'var(--paper-faint)'
                                    }
                                >
                                    {emptyAtEnd ? '[ ]  empty' : '[ ]'}
                                </text>
                            ) : (
                                owned.map((b, k) => {
                                    const bi = s.blocks.indexOf(b);
                                    const y = p.y - NODE_H / 2 + 26 + k * 32;
                                    return (
                                        <g key={b.name}>
                                            <rect
                                                x={p.x - NODE_W / 2 + 8}
                                                y={y}
                                                width={NODE_W - 16}
                                                height={28}
                                                rx={3}
                                                fill={`color-mix(in oklab, ${BLOCK_TINT[bi % 3]} 14%, transparent)`}
                                                stroke={BLOCK_TINT[bi % 3]}
                                                strokeWidth={1}
                                            />
                                            <text
                                                x={p.x - NODE_W / 2 + 14}
                                                y={y + 12}
                                                fontSize={10.5}
                                                fill="var(--paper-bright)"
                                            >
                                                {b.name} · {b.lines.length}{' '}
                                                instr
                                                {b.lines.length === 1
                                                    ? ''
                                                    : 's'}
                                            </text>
                                            <text
                                                x={p.x - NODE_W / 2 + 14}
                                                y={y + 23}
                                                fontSize={9.5}
                                                fill="var(--paper-muted)"
                                            >
                                                dest {fmt(b.dest)}
                                            </text>
                                        </g>
                                    );
                                })
                            )}
                        </g>
                    );
                })}
            </svg>
            <p
                className="mt-2 min-h-[3.2em] text-[12.5px]"
                style={{
                    color: /thrown away|empty/.test(s.note)
                        ? 'var(--term-red)'
                        : s.phase === 'done'
                          ? 'var(--term-green)'
                          : 'var(--paper-muted)',
                    lineHeight: 1.6,
                }}
                aria-live="polite"
            >
                {s.note}
            </p>
        </div>
    );
};
