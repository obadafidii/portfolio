'use client';

import type { ReactNode } from 'react';

interface FigureProps {
    caption: string;
    children: ReactNode;
    controls?: ReactNode;
}

/** Shared frame for the animated diagrams so they read as one family. */
export const Figure = ({ caption, children, controls }: FigureProps) => (
    <figure className="not-prose my-8">
        <div
            className="rounded-[4px] border p-4"
            style={{
                borderColor: 'var(--paper-line-strong)',
                background: 'var(--paper-soft)',
            }}
        >
            {children}
            {controls && (
                <div
                    className="mt-4 flex flex-wrap items-center gap-2 border-t pt-3"
                    style={{ borderColor: 'var(--paper-line)' }}
                >
                    {controls}
                </div>
            )}
        </div>
        <figcaption
            className="mt-2 text-[12px]"
            style={{
                color: 'var(--paper-faint)',
                fontFamily: 'var(--font-mono)',
            }}
        >
            {caption}
        </figcaption>
    </figure>
);

export const Button = ({
    children,
    onClick,
    active = false,
}: {
    children: ReactNode;
    onClick: () => void;
    active?: boolean;
}) => (
    <button
        type="button"
        onClick={onClick}
        className="cursor-pointer rounded-[4px] border px-3 py-1.5 text-[12px] transition-colors"
        style={{
            fontFamily: 'var(--font-mono)',
            borderColor: active
                ? 'var(--term-blue)'
                : 'var(--paper-line-strong)',
            color: active ? 'var(--term-blue)' : 'var(--paper-muted)',
            background: 'transparent',
        }}
    >
        {children}
    </button>
);
