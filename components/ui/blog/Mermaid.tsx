'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { useTheme } from 'next-themes';

const readVar = (name: string, fallback: string) => {
    if (typeof window === 'undefined') return fallback;
    const value = getComputedStyle(document.documentElement).getPropertyValue(name);
    return value.trim() || fallback;
};

export default function Mermaid({ chart }: { chart: string }) {
    const { resolvedTheme } = useTheme();
    const containerRef = useRef<HTMLDivElement>(null);
    const id = useId().replace(/:/g, '');
    const [nearViewport, setNearViewport] = useState(false);

    useEffect(() => {
        const container = containerRef.current;
        if (!container || nearViewport) return;
        if (!('IntersectionObserver' in window)) {
            setNearViewport(true);
            return;
        }

        const observer = new IntersectionObserver(
            entries => {
                if (!entries.some(entry => entry.isIntersecting)) return;
                setNearViewport(true);
                observer.disconnect();
            },
            { rootMargin: '500px 0px' },
        );
        observer.observe(container);
        return () => observer.disconnect();
    }, [nearViewport]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container || !nearViewport) return;

        const ink = readVar('--paper-ink', '#d5dde8');
        const muted = readVar('--paper-muted', '#7b8798');
        const line = readVar('--paper-line-strong', '#2b333f');
        const surface = readVar('--paper-soft', '#10141b');

        let cancelled = false;
        void import('mermaid')
            .then(({ default: mermaid }) => {
                mermaid.initialize({
                    startOnLoad: false,
                    securityLevel: 'strict',
                    fontFamily: 'var(--font-mono), ui-monospace, monospace',
                    fontSize: 12,
                    theme: 'base',
                    themeVariables: {
                        background: 'transparent',
                        primaryColor: surface,
                        primaryTextColor: ink,
                        primaryBorderColor: line,
                        secondaryColor: surface,
                        secondaryTextColor: ink,
                        secondaryBorderColor: line,
                        tertiaryColor: surface,
                        tertiaryTextColor: ink,
                        tertiaryBorderColor: line,
                        lineColor: muted,
                        textColor: ink,
                        mainBkg: surface,
                        nodeBorder: line,
                        clusterBkg: 'transparent',
                        clusterBorder: line,
                        edgeLabelBackground: surface,
                        noteBkgColor: surface,
                        noteTextColor: muted,
                        noteBorderColor: line,
                    },
                    flowchart: { curve: 'linear', useMaxWidth: true },
                    sequence: { useMaxWidth: true },
                });
                return mermaid.render(`mermaid-${id}`, chart);
            })
            .then(({ svg }) => {
                if (!cancelled && container) container.innerHTML = svg;
            })
            .catch(() => {
                if (!cancelled && container) {
                    container.innerHTML = '';
                    container.textContent = chart;
                }
            });

        return () => {
            cancelled = true;
        };
    }, [chart, id, nearViewport, resolvedTheme]);

    return <div ref={containerRef} className="mermaid-frame" />;
}
