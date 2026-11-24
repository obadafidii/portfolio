/*
 * Step-by-step replay of the CFG builder from the post. The steps are not
 * hand-written: `simulate` runs the same two passes as `build()` over a tiny
 * BRIL program and records a snapshot after every decision it makes.
 */

export type Line =
    | { kind: 'fn'; text: string; name: string }
    | { kind: 'label'; text: string; name: string }
    | { kind: 'instr'; text: string; op: string; labels: string[] }
    | { kind: 'close'; text: string };

export type Block = {
    node: string;
    name: string;
    lines: number[];
    dest: string[] | null;
};

export type Step = {
    cursor: number;
    phase: 'nodes' | 'blocks' | 'done';
    nodes: string[];
    current: string;
    group: number[];
    blocks: Block[];
    dropped: number[];
    note: string;
};

export type Scenario = 'happy' | 'fallthrough' | 'fixed';

const CONTROL = new Set(['jmp', 'br', 'cbr', 'call', 'ret']);

const fn = (name: string): Line => ({ kind: 'fn', text: `@${name} {`, name });
const label = (name: string): Line => ({
    kind: 'label',
    text: `.${name}:`,
    name,
});
const instr = (text: string, op: string, labels: string[] = []): Line => ({
    kind: 'instr',
    text: `  ${text};`,
    op,
    labels,
});
const close: Line = { kind: 'close', text: '}' };

const HAPPY: Line[] = [
    fn('main'),
    instr('v0: int = const 1', 'const'),
    instr('v1: int = const 2', 'const'),
    instr('br cond .label .label2', 'br', ['label', 'label2']),
    label('label'),
    instr('v2: int = add v0 v1', 'add'),
    instr('print v2', 'print'),
    instr('jmp .label2', 'jmp', ['label2']),
    label('label2'),
    instr('print v3', 'print'),
    close,
];

const FALLTHROUGH: Line[] = [
    fn('main'),
    instr('v0: int = const 1', 'const'),
    instr('v1: int = const 2', 'const'),
    instr('br cond .label', 'br', ['label']),
    label('label'),
    instr('v2: int = add v0 v1', 'add'),
    instr('print v2', 'print'),
    label('label2'),
    instr('print v3', 'print'),
    close,
];

export const PROGRAMS: Record<Scenario, Line[]> = {
    happy: HAPPY,
    fallthrough: FALLTHROUGH,
    fixed: FALLTHROUGH,
};

export const fmt = (labels: string[] | null) =>
    labels === null ? 'None' : `[${labels.join(', ')}]`;

export function simulate(program: Line[], fixed: boolean): Step[] {
    const steps: Step[] = [];
    const nodes: string[] = [];
    const blocks: Block[] = [];
    const dropped: number[] = [];
    let group: number[] = [];
    let current = 'main';
    let count = 0;

    const snap = (cursor: number, phase: Step['phase'], note: string) =>
        steps.push({
            cursor,
            phase,
            nodes: [...nodes],
            current,
            group: [...group],
            blocks: blocks.map(b => ({ ...b, lines: [...b.lines] })),
            dropped: [...dropped],
            note,
        });

    const emit = (cursor: number, dest: string[] | null, why: string) => {
        const name = `blk-${count++}`;
        blocks.push({ node: current, name, lines: group, dest });
        const lines = group.length;
        group = [];
        snap(
            cursor,
            'blocks',
            `${why} → ${name} (${lines} instr${lines === 1 ? '' : 's'}) goes into "${current}", dest ${fmt(dest)}.`,
        );
    };

    // Pass 1: one graph node per label.
    nodes.push('main');
    snap(
        0,
        'nodes',
        'Pass 1: the entry function gets a node of its own, "main".',
    );
    program.forEach((line, i) => {
        if (line.kind !== 'label') return;
        nodes.push(line.name);
        snap(
            i,
            'nodes',
            `Pass 1: found label .${line.name} → add node "${line.name}".`,
        );
    });

    // Pass 2: group instructions and cut blocks.
    current = 'main';
    snap(
        0,
        'blocks',
        'Pass 2: walk the program again, starting in "main" with an empty group.',
    );
    program.forEach((line, i) => {
        if (line.kind === 'instr') {
            group.push(i);
            if (CONTROL.has(line.op)) {
                emit(i, [...line.labels], `"${line.op}" passes control`);
            } else {
                snap(
                    i,
                    'blocks',
                    `"${line.op}" does not pass control → keep grouping.`,
                );
            }
        } else if (line.kind === 'label') {
            if (group.length && fixed) {
                // the block falls through into the label we just reached
                emit(
                    i,
                    [line.name],
                    `new label .${line.name} while the group is not empty (fix): the block falls through into it`,
                );
            } else if (group.length) {
                dropped.push(...group);
                const lost = group.length;
                group = [];
                snap(
                    i,
                    'blocks',
                    `Label .${line.name} clears the group → ${lost} instructions from "${current}" are thrown away. No block, no error.`,
                );
            }
            current = line.name;
            snap(
                i,
                'blocks',
                `Label .${line.name} → switch to node "${line.name}".`,
            );
        }
    });

    // After the loop: whatever is left becomes the last block.
    emit(program.length - 1, null, 'End of program, insert the last block');
    const empty = nodes.filter(n => !blocks.some(b => b.node === n));
    snap(
        program.length - 1,
        'done',
        empty.length
            ? `Done, but node "${empty.join('", "')}" is empty. Its instructions silently vanished.`
            : 'Done. Every label owns a block and every instruction landed somewhere.',
    );
    return steps;
}

/** One colour per emitted block, reused by the code and graph panels. */
export const BLOCK_TINT = [
    'var(--term-blue)',
    'var(--term-violet)',
    'var(--term-green)',
];

export const SCENARIO_LABELS: Record<Scenario, string> = {
    happy: 'happy path',
    fallthrough: 'fall-through (bug)',
    fixed: 'fall-through (fixed)',
};
