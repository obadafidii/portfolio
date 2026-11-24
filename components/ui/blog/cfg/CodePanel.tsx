'use client';

import { BLOCK_TINT, type Line, type Step } from './simulate';

/** Left pane: the BRIL program, the cursor and the current group. */
export const CodePanel = ({
    program,
    step: s,
    fontSize,
}: {
    program: Line[];
    step: Step;
    fontSize: number;
}) => {
    const blockOfLine = new Map<number, number>();
    s.blocks.forEach((b, bi) => b.lines.forEach(l => blockOfLine.set(l, bi)));

    return (
        <div
            className="h-full overflow-x-auto py-3"
            style={{
                fontFamily: 'var(--font-mono)',
                fontSize,
            }}
        >
            {program.map((line, i) => {
                const isCursor = s.cursor === i && s.phase !== 'done';
                const inGroup = s.group.includes(i);
                const bi = blockOfLine.get(i);
                const isDropped = s.dropped.includes(i);
                const tint = isDropped
                    ? 'var(--term-red)'
                    : inGroup
                      ? 'var(--term-amber)'
                      : bi !== undefined
                        ? BLOCK_TINT[bi % 3]
                        : undefined;
                return (
                    <div
                        key={i}
                        className="flex w-max min-w-full items-center whitespace-pre pr-3 transition-colors duration-300"
                        style={{
                            background: isCursor
                                ? 'color-mix(in oklab, var(--term-blue) 16%, transparent)'
                                : tint
                                  ? `color-mix(in oklab, ${tint} 9%, transparent)`
                                  : 'transparent',
                            borderLeft: `3px solid ${isCursor ? 'var(--term-blue)' : (tint ?? 'transparent')}`,
                        }}
                    >
                        <span
                            className="w-7 shrink-0 select-none text-right"
                            style={{
                                color: 'var(--paper-faint)',
                                opacity: 0.6,
                            }}
                        >
                            {i + 1}
                        </span>
                        <span
                            className="pl-3"
                            style={{
                                color:
                                    line.kind === 'label' || line.kind === 'fn'
                                        ? 'var(--term-violet)'
                                        : isDropped
                                          ? 'var(--term-red)'
                                          : 'var(--paper-ink)',
                                textDecoration: isDropped
                                    ? 'line-through'
                                    : 'none',
                            }}
                        >
                            {line.text}
                        </span>
                        {bi !== undefined && !inGroup && (
                            <span
                                className="ml-auto pl-3 text-[10px]"
                                style={{ color: BLOCK_TINT[bi % 3] }}
                            >
                                {s.blocks[bi].name}
                            </span>
                        )}
                    </div>
                );
            })}
            <div
                className="mx-2 mt-2 rounded-[3px] border px-2 py-1.5 text-[11px]"
                style={{
                    borderColor: 'var(--paper-line)',
                    color: 'var(--paper-muted)',
                }}
            >
                <span style={{ color: 'var(--term-amber)' }}>group</span> = [
                {s.group.length === 0 ? (
                    <span style={{ color: 'var(--paper-faint)' }}> </span>
                ) : (
                    s.group.map((l, k) => {
                        const line = program[l];
                        return (
                            <span key={l} style={{ color: 'var(--paper-ink)' }}>
                                {k ? ', ' : ''}
                                {line.kind === 'instr' ? line.op : ''}
                            </span>
                        );
                    })
                )}
                ]{' '}
                <span style={{ color: 'var(--paper-faint)' }}>
                    · label = &quot;{s.current}&quot;
                </span>
            </div>
        </div>
    );
};
