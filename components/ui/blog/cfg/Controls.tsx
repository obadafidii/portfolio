'use client';

import { useState, type ReactNode } from 'react';
import type { Scenario } from './simulate';

const SHORT_LABELS: Record<Scenario, string> = {
    happy: 'happy path',
    fallthrough: 'fall-through',
    fixed: 'fixed',
};

/** Terminal-style button: green while held, and green while it is the active choice. */
const ControlButton = ({
    children,
    onClick,
    active = false,
    label,
}: {
    children: ReactNode;
    onClick: () => void;
    active?: boolean;
    label?: string;
}) => {
    const [pressed, setPressed] = useState(false);
    const green = active || pressed;
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={label}
            aria-pressed={active}
            onPointerDown={() => setPressed(true)}
            onPointerUp={() => setPressed(false)}
            onPointerLeave={() => setPressed(false)}
            onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') setPressed(true);
            }}
            onKeyUp={() => setPressed(false)}
            className="cursor-pointer rounded-[4px] border px-3 py-1.5 text-[12px] transition-colors duration-150"
            style={{
                fontFamily: 'var(--font-mono)',
                borderColor: green
                    ? 'var(--term-green)'
                    : 'var(--paper-line-strong)',
                color: green ? 'var(--term-green)' : 'var(--paper-muted)',
                background: pressed
                    ? 'color-mix(in oklab, var(--term-green) 18%, transparent)'
                    : active
                      ? 'color-mix(in oklab, var(--term-green) 10%, transparent)'
                      : 'transparent',
            }}
        >
            {children}
        </button>
    );
};

interface ControlsProps {
    playing: boolean;
    atEnd: boolean;
    index: number;
    total: number;
    scenario: Scenario;
    /** Scenario tabs to show; hidden entirely when there is only one. */
    scenarios: Scenario[];
    onPlay: () => void;
    onBack: () => void;
    onNext: () => void;
    onScenario: (next: Scenario) => void;
}

/** Bottom bar: playback first, then the scenario picker and the step counter. */
export const Controls = ({
    playing,
    atEnd,
    index,
    total,
    scenario,
    scenarios,
    onPlay,
    onBack,
    onNext,
    onScenario,
}: ControlsProps) => (
    <div
        className="flex flex-wrap items-center gap-2 rounded-[4px] border px-3 py-2.5"
        style={{
            borderColor: 'var(--paper-line-strong)',
            background: 'var(--paper)',
        }}
    >
        <ControlButton onClick={onPlay} active={playing}>
            {playing ? '❚❚ pause' : atEnd ? '↺ replay' : '▶ play'}
        </ControlButton>
        <ControlButton onClick={onBack} label="previous step">
            ← prev
        </ControlButton>
        <ControlButton onClick={onNext} label="next step">
            next →
        </ControlButton>
        <span
            className="text-[11px]"
            style={{
                fontFamily: 'var(--font-mono)',
                color: 'var(--paper-faint)',
            }}
        >
            {index + 1} / {total}
        </span>

        {scenarios.length > 1 && (
            <div className="flex flex-wrap gap-2 sm:ml-auto">
                {scenarios.map(key => (
                    <ControlButton
                        key={key}
                        onClick={() => onScenario(key)}
                        active={scenario === key}
                    >
                        {SHORT_LABELS[key]}
                    </ControlButton>
                ))}
            </div>
        )}
    </div>
);
