'use client';

import { useEffect, useState, type RefObject } from 'react';

interface Heading {
    id: string;
    label: string;
    level: 2 | 3;
}

const slugify = (value: string) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');

export function TableOfContents({
    contentRef,
}: {
    contentRef: RefObject<HTMLDivElement | null>;
}) {
    const [headings, setHeadings] = useState<Heading[]>([]);
    const [activeId, setActiveId] = useState('');

    useEffect(() => {
        const content = contentRef.current;
        if (!content) return;

        let headingObserver: IntersectionObserver | undefined;
        let observed: HTMLHeadingElement[] = [];
        let signature = '';
        let frame = 0;

        const collectHeadings = () => {
            frame = 0;
            const elements = Array.from(
                content.querySelectorAll<HTMLHeadingElement>('h2, h3'),
            );
            /*
             * The interactive figures in a post change the DOM many times a
             * second. Only rebuild the outline when the headings themselves
             * changed, instead of on every one of those mutations.
             */
            const nextSignature = elements
                .map(heading => `${heading.tagName}:${heading.textContent}`)
                .join('\n');
            if (
                nextSignature === signature &&
                elements.length === observed.length &&
                elements.every((heading, index) => heading === observed[index])
            )
                return;
            signature = nextSignature;
            observed = elements;

            const usedIds = new Set<string>();
            const nextHeadings = elements.map((heading, index) => {
                const baseId =
                    heading.id ||
                    slugify(heading.textContent || '') ||
                    `section-${index + 1}`;
                let id = baseId;
                let suffix = 2;

                while (usedIds.has(id)) {
                    id = `${baseId}-${suffix}`;
                    suffix += 1;
                }

                usedIds.add(id);
                heading.id = id;
                return {
                    id,
                    label:
                        heading.textContent?.trim() || `Section ${index + 1}`,
                    level: heading.tagName === 'H3' ? 3 : 2,
                } as Heading;
            });

            setHeadings(nextHeadings);
            setActiveId(current => current || nextHeadings[0]?.id || '');

            headingObserver?.disconnect();
            headingObserver = new IntersectionObserver(
                entries => {
                    const visible = entries.find(entry => entry.isIntersecting);
                    if (visible?.target.id) setActiveId(visible.target.id);
                },
                { rootMargin: '-80px 0px -65% 0px', threshold: 0 },
            );
            elements.forEach(heading => headingObserver?.observe(heading));
        };

        collectHeadings();
        // Coalesce bursts of mutations into one check per frame.
        const contentObserver = new MutationObserver(() => {
            if (!frame) frame = requestAnimationFrame(collectHeadings);
        });
        contentObserver.observe(content, { childList: true, subtree: true });

        return () => {
            contentObserver.disconnect();
            if (frame) cancelAnimationFrame(frame);
            headingObserver?.disconnect();
        };
    }, [contentRef]);

    if (headings.length === 0) return null;

    const jumpTo = (id: string) => {
        const heading = document.getElementById(id);
        if (!heading) return;
        const reduceMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        ).matches;
        heading.scrollIntoView({
            behavior: reduceMotion ? 'auto' : 'smooth',
            block: 'start',
        });
        window.history.replaceState(null, '', `#${id}`);
        setActiveId(id);
    };

    return (
        <aside className="blog-toc" aria-label="Article contents">
            <div className="blog-toc__titlebar">
                <span className="blog-toc__light" aria-hidden="true" />
                <span>david@writing:~$ contents</span>
            </div>
            <div className="blog-toc__command" aria-hidden="true">
                <span className="term-host">$</span> cat outline.txt
            </div>
            <nav className="blog-toc__links">
                {headings.map((heading, index) => {
                    const active = heading.id === activeId;
                    return (
                        <a
                            key={heading.id}
                            href={`#${heading.id}`}
                            className="blog-toc__link"
                            data-active={active}
                            data-level={heading.level}
                            aria-current={active ? 'location' : undefined}
                            onClick={event => {
                                event.preventDefault();
                                jumpTo(heading.id);
                            }}
                        >
                            <span className="blog-toc__index">
                                {String(index + 1).padStart(2, '0')}
                            </span>
                            <span className="blog-toc__label">
                                ./{slugify(heading.label)}
                            </span>
                            <span
                                className="blog-toc__arrow"
                                aria-hidden="true"
                            >
                                {active ? '▸' : '›'}
                            </span>
                        </a>
                    );
                })}
            </nav>
        </aside>
    );
}
