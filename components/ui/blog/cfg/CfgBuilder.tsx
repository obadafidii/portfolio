'use client';

import { useEffect, useMemo, useState } from 'react';
import { CodePanel } from './CodePanel';
import { Controls } from './Controls';
import { GraphPanel } from './GraphPanel';
import { PROGRAMS, SCENARIO_LABELS, simulate, type Scenario } from './simulate';

export type { Scenario } from './simulate';

/** The widget fills the article width; the graph is capped so nodes stay a sensible size. */
const DIMS = { graph: 380, font: 12 };

const ALL: Scenario[] = ['happy', 'fallthrough', 'fixed'];

/*
 * Layout:
 *   ┌───────────────────────────────┐
 *   │ ┌────────┬──────────────────┐ │
 *   │ │  code  │      graph       │ │
 *   │ └────────┴──────────────────┘ │
 *   │ ┌───────────────────────────┐ │
 *   │ │ controls                  │ │
 *   │ └───────────────────────────┘ │
 *   └───────────────────────────────┘
 */
export const CfgBuilder = ({
    scenario: initial = 'happy',
    scenarios,
}: {
    scenario?: Scenario;
    /**
     * Tabs to offer. Defaults to the happy path alone when the widget opens on
     * it, and to all three scenarios otherwise.
     */
    scenarios?: Scenario[];
}) => {
    const tabs = scenarios ?? (initial === 'happy' ? ['happy'] : ALL);
    const dims = DIMS;
    const [scenario, setScenario] = useState<Scenario>(initial);
    const program = PROGRAMS[scenario];
    const steps = useMemo(
        () => simulate(program, scenario === 'fixed'),
        [program, scenario],
    );
    const [index, setIndex] = useState(0);
    const [playing, setPlaying] = useState(false);
    const last = steps.length - 1;
    const atEnd = index >= last;

    useEffect(() => {
        if (!playing) return;
        if (index >= last) {
            setPlaying(false);
            return;
        }
        const t = setTimeout(() => setIndex(v => v + 1), 1150);
        return () => clearTimeout(t);
    }, [playing, index, last]);

    const step = steps[Math.min(index, last)];

    return (
        <figure className="not-prose my-8 w-full">
            <div
                className="space-y-3 rounded-[6px] border p-3"
                style={{
                    borderColor: 'var(--paper-line-strong)',
                    background: 'var(--paper-soft)',
                }}
            >
                {/* code | graph. A 1px gap over a line-coloured background draws
                    the divider, and it moves from vertical to horizontal when the
                    panes wrap on narrow screens. */}
                <div
                    className="flex flex-wrap gap-px overflow-hidden rounded-[4px] border"
                    style={{
                        borderColor: 'var(--paper-line-strong)',
                        background: 'var(--paper-line-strong)',
                    }}
                >
                    <div
                        className="min-w-0"
                        style={{
                            flex: '2 1 230px',
                            background: 'var(--paper)',
                        }}
                    >
                        <CodePanel
                            program={program}
                            step={step}
                            fontSize={dims.font}
                        />
                    </div>
                    <div
                        className="min-w-0"
                        style={{
                            flex: '3 1 260px',
                            background: 'var(--paper)',
                        }}
                    >
                        <GraphPanel
                            step={step}
                            index={index}
                            maxWidth={dims.graph}
                        />
                    </div>
                </div>

                <Controls
                    playing={playing}
                    atEnd={atEnd}
                    index={index}
                    total={steps.length}
                    scenario={scenario}
                    scenarios={tabs}
                    onPlay={() => {
                        if (atEnd) setIndex(0);
                        setPlaying(p => !p || atEnd);
                    }}
                    onBack={() => {
                        setPlaying(false);
                        setIndex(v => Math.max(0, v - 1));
                    }}
                    onNext={() => {
                        setPlaying(false);
                        setIndex(v => Math.min(last, v + 1));
                    }}
                    onScenario={next => {
                        setScenario(next);
                        setIndex(0);
                        setPlaying(false);
                    }}
                />
            </div>
            <figcaption
                className="mt-2 text-[12px]"
                style={{
                    color: 'var(--paper-faint)',
                    fontFamily: 'var(--font-mono)',
                }}
            >
                fig — build() replayed on {SCENARIO_LABELS[scenario]}: the BRIL
                program and its cursor, and the graph as the algorithm fills it
                in.
            </figcaption>
        </figure>
    );
};
