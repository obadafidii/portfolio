'use client';

import { motion } from 'framer-motion';
import { useEffect, type CSSProperties } from 'react';

import info from '@/misc/info';
import { TerminalWindow } from '@/components/layout/TerminalWindow';
import { CommandLine, Prompt } from '@/components/ui/shell/CommandLine';
import { setResumeSections } from '@/components/ui/shell/registry';
import type { Block, Inline, Resume, ResumeSection } from '@/lib/resume';

const CROSS_REF: Record<string, string> = {
    works: '/works',
    writing: '/blog',
    blog: '/blog',
    resume: '/resume',
    contact: '/contact',
};

const isInternal = (href: string) => href.startsWith('/') || href.startsWith('#');

const styleFor = (segment: Inline): CSSProperties => ({
    color: segment.bold ? 'var(--paper-bright)' : undefined,
    fontStyle: segment.italic ? 'italic' : undefined,
});

/* ---------------------------------------------------------------- inline */

const Segments = ({ content }: { content: Inline[] }) => (
    <>
        {content.map((segment, idx) => {
            if (segment.type === 'link') {
                const external = !isInternal(segment.href);
                return (
                    <a
                        key={idx}
                        href={segment.href}
                        target={
                            external && !segment.href.startsWith('mailto:') ? '_blank' : undefined
                        }
                        rel={external ? 'noopener noreferrer' : undefined}
                        data-href={segment.href}
                        className="resume-link underline decoration-dotted underline-offset-[3px] hover:decoration-solid"
                        style={{ ...styleFor(segment), color: 'var(--term-blue)' }}
                    >
                        {segment.label}
                    </a>
                );
            }

            if (segment.code) {
                return (
                    <code
                        key={idx}
                        className="rounded-[3px] px-1 text-[0.94em]"
                        style={{ background: 'var(--paper-accent-soft)' }}
                    >
                        {segment.value}
                    </code>
                );
            }

            return (
                <span key={idx} style={styleFor(segment)}>
                    {segment.value}
                </span>
            );
        })}
    </>
);

/** "works(1)" in SEE ALSO becomes a link to /works. */
const CrossRefs = ({ content }: { content: Inline[] }) => (
    <>
        {content.map((segment, idx) => {
            if (segment.type === 'link') return <Segments key={idx} content={[segment]} />;

            return (
                <span key={idx}>
                    {segment.value.split(/(\b[a-z]+\(\d\))/g).map((part, partIdx) => {
                        const match = part.match(/^([a-z]+)\((\d)\)$/);
                        const href = match ? CROSS_REF[match[1]] : undefined;
                        if (!href) return <span key={partIdx}>{part}</span>;
                        return (
                            <a
                                key={partIdx}
                                href={href}
                                className="hover:underline"
                                style={{ color: 'var(--term-blue)' }}
                            >
                                {part}
                            </a>
                        );
                    })}
                </span>
            );
        })}
    </>
);

/* ----------------------------------------------------------------- blocks */

const Leader = () => (
    <span
        aria-hidden="true"
        className="mx-2 hidden min-w-[3ch] flex-1 self-center border-b border-dotted sm:block"
        style={{ borderColor: 'var(--paper-line-strong)' }}
    />
);

const MARKERS = ['·', '–', '·', '–'];

const BlockView = ({ block, sectionName }: { block: Block; sectionName: string }) => {
    switch (block.type) {
        case 'entry': {
            const isSub = block.level > 3;
            return (
                <div className={isSub ? 'mt-2' : 'mt-3'}>
                    <div
                        className="flex flex-wrap items-baseline"
                        style={{ paddingLeft: isSub ? 'var(--indent-2)' : 'var(--indent)' }}
                    >
                        <span
                            style={{
                                color: isSub ? 'var(--paper-ink)' : 'var(--paper-bright)',
                            }}
                        >
                            <Segments content={block.title} />
                        </span>
                        {block.meta && (
                            <>
                                <Leader />
                                <span className="ink-muted ml-auto sm:ml-0">
                                    <Segments content={block.meta} />
                                </span>
                            </>
                        )}
                    </div>
                    {block.subtitle && (
                        <div
                            className="ink-muted text-[12.5px] italic"
                            style={{ paddingLeft: isSub ? 'var(--indent-2)' : 'var(--indent)' }}
                        >
                            <Segments content={block.subtitle} />
                        </div>
                    )}
                </div>
            );
        }

        case 'bullet':
            return (
                <div
                    className="ink-muted measure flex gap-2"
                    style={{
                        paddingLeft: `calc(var(--indent-2) + ${block.depth * 2}ch)`,
                    }}
                >
                    <span className="ink-faint shrink-0">
                        {block.ordered ? block.marker : MARKERS[block.depth % MARKERS.length]}
                    </span>
                    <span>
                        <Segments content={block.content} />
                    </span>
                </div>
            );

        case 'row':
            return (
                <div className="indent flex flex-wrap gap-x-3">
                    <span className="ink-faint w-[13ch] shrink-0">{block.key}</span>
                    <span style={{ color: 'var(--paper-ink)' }}>
                        <Segments content={block.value} />
                    </span>
                </div>
            );

        case 'table':
            return (
                <div className="indent mt-2 overflow-x-auto">
                    <table className="resume-table w-full text-left">
                        <thead>
                            <tr>
                                {block.headers.map((cell, idx) => (
                                    <th
                                        key={idx}
                                        className="ink-faint border-b pr-6 pb-1 font-normal"
                                        style={{ borderColor: 'var(--paper-line-strong)' }}
                                    >
                                        <Segments content={cell} />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {block.rows.map((row, rowIdx) => (
                                <tr key={rowIdx}>
                                    {row.map((cell, cellIdx) => (
                                        <td
                                            key={cellIdx}
                                            className="ink-muted pr-6 align-top"
                                            style={{
                                                color:
                                                    cellIdx === 0 ? 'var(--paper-ink)' : undefined,
                                            }}
                                        >
                                            <Segments content={cell} />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );

        case 'quote':
            return (
                <div
                    className="ink-muted measure indent-2 border-l-2 pl-3 italic"
                    style={{ borderColor: 'var(--paper-line-strong)' }}
                >
                    <Segments content={block.content} />
                </div>
            );

        case 'rule':
            return <hr className="indent my-3" style={{ borderColor: 'var(--paper-line)' }} />;

        default:
            return (
                <p className="ink-muted measure indent">
                    {sectionName === 'SEE ALSO' ? (
                        <CrossRefs content={block.content} />
                    ) : (
                        <Segments content={block.content} />
                    )}
                </p>
            );
    }
};

const Section = ({ section }: { section: ResumeSection }) => (
    <section className="mt-6">
        {section.name && (
            <h2 className="ink-muted text-[12.5px] tracking-[0.08em]">{section.name}</h2>
        )}
        <div className="mt-1">
            {section.blocks.map((block, idx) => (
                <BlockView key={idx} block={block} sectionName={section.name} />
            ))}
        </div>
    </section>
);

const RunningLine = ({ left, middle, right }: { left: string; middle: string; right: string }) => (
    <div className="ink-faint flex flex-wrap gap-x-4 text-[11px]">
        <span>{left}</span>
        <span className="mx-auto hidden sm:inline">{middle}</span>
        <span className="ml-auto">{right}</span>
    </div>
);

/* ------------------------------------------------------------------- page */

export const ManPageContent = ({ resume }: { resume: Resume }) => {
    useEffect(() => {
        setResumeSections(resume.sections.map(section => section.name).filter(Boolean));
    }, [resume]);

    const short = resume.name.split(' ')[0] || 'david';
    const title = `${short.toUpperCase()}(1)`;
    const updated = resume.syncedOn
        ? new Date(resume.syncedOn).toLocaleDateString('en-GB', {
              month: 'long',
              year: 'numeric',
          })
        : 'unreleased';

    return (
        <CommandLine cwd="~/resume">
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="flex flex-wrap items-baseline gap-x-2">
                    <Prompt cwd="~/resume" />
                    <span className="term-cmd">man david</span>
                </div>

                <article className="manpage mt-4">
                    <div className="border-b pb-2" style={{ borderColor: 'var(--paper-line)' }}>
                        <RunningLine left={title} middle="User Commands" right={title} />
                    </div>

                    <section className="mt-5">
                        <h2 className="ink-muted text-[12.5px] tracking-[0.08em]">NAME</h2>
                        <p className="indent mt-1" style={{ color: 'var(--paper-bright)' }}>
                            {short.toLowerCase()}
                            {resume.tagline.length > 0 && (
                                <span className="ink-muted">
                                    {' — '}
                                    <Segments content={resume.tagline} />
                                </span>
                            )}
                        </p>
                    </section>

                    {resume.sections.map((section, idx) => (
                        <Section key={`${section.name}-${idx}`} section={section} />
                    ))}

                    <div
                        className="mt-8 border-t pt-2"
                        style={{ borderColor: 'var(--paper-line)' }}
                    >
                        <RunningLine
                            left={new URL(info.url).hostname}
                            middle={updated}
                            right={title}
                        />
                    </div>
                </article>

                <p className="ink-faint mt-6 text-[11px]">
                    open --resume for the pdf · ⌘P prints a plain copy with URLs expanded
                </p>
            </motion.div>
        </CommandLine>
    );
};

export const ManPage = ({ resume }: { resume: Resume }) => (
    <TerminalWindow
        currentPage="resume"
        path="~/resume"
        status={
            <>
                <a href="/resume.pdf" style={{ color: 'var(--term-blue)' }}>
                    pdf
                </a>
                <span className="hidden sm:inline">{resume.sections.length} sections</span>
            </>
        }
    >
        <ManPageContent resume={resume} />
    </TerminalWindow>
);
