import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/* ------------------------------------------------------------------ inline */

export interface InlineText {
    type: 'text';
    value: string;
    bold?: boolean;
    italic?: boolean;
    code?: boolean;
}

export interface InlineLink {
    type: 'link';
    label: string;
    href: string;
    bold?: boolean;
    italic?: boolean;
    code?: boolean;
}

export type Inline = InlineText | InlineLink;

/* ------------------------------------------------------------------ blocks */

export interface ParagraphBlock {
    type: 'para';
    content: Inline[];
}

/** A "### Role | 2024–now" heading. The pipe half is right-aligned. */
export interface EntryBlock {
    type: 'entry';
    level: 3 | 4 | 5 | 6;
    title: Inline[];
    meta?: Inline[];
    /** The italic line under a role, e.g. "Satsio · United Kingdom (Remote)". */
    subtitle?: Inline[];
}

export interface BulletBlock {
    type: 'bullet';
    depth: number;
    ordered: boolean;
    marker?: string;
    content: Inline[];
}

/** A "- key: value" bullet, rendered as two aligned columns. */
export interface RowBlock {
    type: 'row';
    key: string;
    value: Inline[];
}

export interface TableBlock {
    type: 'table';
    headers: Inline[][];
    rows: Inline[][][];
}

export interface QuoteBlock {
    type: 'quote';
    content: Inline[];
}

export interface RuleBlock {
    type: 'rule';
}

export type Block =
    | ParagraphBlock
    | EntryBlock
    | BulletBlock
    | RowBlock
    | TableBlock
    | QuoteBlock
    | RuleBlock;

export interface ResumeSection {
    name: string;
    blocks: Block[];
}

export interface Resume {
    name: string;
    tagline: Inline[];
    sections: ResumeSection[];
    syncedOn?: string;
}

/* ----------------------------------------------------------------- helpers */

const SYNCED = /<!--\s*synced from google docs on (\d{4}-\d{2}-\d{2})\s*-->/;

/**
 * Google Docs rewrites every hyperlink on export as a redirect:
 *   https://www.google.com/url?q=https%3A%2F%2Freal.com&sa=D&source=editors&ust=...
 * Unwrap it so the real destination survives.
 */
const unwrapHref = (href: string): string => {
    const trimmed = href.trim();
    const match = trimmed.match(
        /^https?:\/\/(?:www\.)?google\.com\/url\?(.*)$/,
    );
    if (!match) return trimmed;

    const q = new URLSearchParams(match[1]).get('q');
    if (!q) return trimmed;

    try {
        return decodeURIComponent(q);
    } catch {
        return q;
    }
};

const normaliseHref = (href: string): string => {
    const value = unwrapHref(href);
    if (/^(https?:|mailto:|tel:|\/|#)/i.test(value)) return value;
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return `mailto:${value}`;
    if (/^www\./i.test(value)) return `https://${value}`;
    return value;
};

const LINK = /\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/;
const AUTOLINK = /<((?:https?:\/\/|mailto:)[^>\s]+)>/;
const BARE_URL = /(?<![("\w])((?:https?:\/\/|www\.)[^\s<>()[\]",]+)/;
const BARE_EMAIL =
    /(?<![("\w])([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/;
const BOLD = /\*\*([^*]+)\*\*|__([^_]+)__/;
const ITALIC = /(?<![*\w])\*([^*\n]+)\*(?!\*)|(?<![_\w])_([^_\n]+)_(?![_\w])/;
const CODE = /`([^`]+)`/;

type Style = { bold?: boolean; italic?: boolean; code?: boolean };

/** Recursive-descent inline tokeniser. Order matters: code, links, then emphasis. */
export const parseInline = (input: string, style: Style = {}): Inline[] => {
    if (!input) return [];

    const push = (out: Inline[], segments: Inline[]) => {
        for (const segment of segments) {
            const last = out[out.length - 1];
            if (
                last &&
                last.type === 'text' &&
                segment.type === 'text' &&
                !!last.bold === !!segment.bold &&
                !!last.italic === !!segment.italic &&
                !!last.code === !!segment.code
            ) {
                last.value += segment.value;
            } else {
                out.push(segment);
            }
        }
        return out;
    };

    const split = (
        pattern: RegExp,
        build: (match: RegExpMatchArray) => Inline[],
    ): Inline[] | null => {
        const match = input.match(pattern);
        if (!match || match.index === undefined) return null;

        const before = input.slice(0, match.index);
        const after = input.slice(match.index + match[0].length);

        const out: Inline[] = [];
        push(out, parseInline(before, style));
        push(out, build(match));
        push(out, parseInline(after, style));
        return out;
    };

    return (
        split(CODE, m => parseInline(m[1], { ...style, code: true })) ??
        split(LINK, m => [
            {
                type: 'link',
                label: m[1] || normaliseHref(m[2]),
                href: normaliseHref(m[2]),
                ...style,
            },
        ]) ??
        split(AUTOLINK, m => [
            {
                type: 'link',
                label: unwrapHref(m[1]),
                href: normaliseHref(m[1]),
                ...style,
            },
        ]) ??
        split(BOLD, m => parseInline(m[1] ?? m[2], { ...style, bold: true })) ??
        split(ITALIC, m =>
            parseInline(m[1] ?? m[2], { ...style, italic: true }),
        ) ??
        split(BARE_URL, m => [
            { type: 'link', label: m[1], href: normaliseHref(m[1]), ...style },
        ]) ??
        split(BARE_EMAIL, m => [
            { type: 'link', label: m[1], href: `mailto:${m[1]}`, ...style },
        ]) ?? [{ type: 'text', value: input, ...style }]
    );
};

export const inlineToText = (segments: Inline[]): string =>
    segments.map(s => (s.type === 'link' ? s.label : s.value)).join('');

/* ------------------------------------------------------------------ tables */

const splitRow = (line: string): string[] =>
    line
        .replace(/^\s*\|/, '')
        .replace(/\|\s*$/, '')
        .split('|')
        .map(cell => cell.trim());

const isDivider = (line: string) =>
    /^\s*\|?[\s:|-]*-[\s:|-]*\|?\s*$/.test(line) && line.includes('-');

/* ------------------------------------------------------------------ parser */

const ROW_KEY = /^([A-Za-z][A-Za-z0-9 /&+.#-]{0,22}):\s+(.+)$/;

/* ------------------------------------------------- google docs adaptation */

const MONTHS = 'Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec';

/** "Backend Engineer (Blockchain)Mar 2026 – Present" → title + date. */
const GLUED_DATE = new RegExp(
    `^(.*?[a-z)\\.])((?:${MONTHS})[a-z]*\\.?\\s*\\d{4}\\b.*)$`,
);

/** "B.Sc. Computer ScienceLagos, Nigeria" → qualification + place. */
const GLUED_PLACE = /^(.*?[a-z])([A-Z][a-z]+,\s*[A-Z][a-z]+)$/;

const splitGlued = (text: string): { title: string; meta?: string } => {
    const date = text.match(GLUED_DATE);
    if (date) return { title: date[1].trim(), meta: date[2].trim() };

    const place = text.match(GLUED_PLACE);
    if (place) return { title: place[1].trim(), meta: place[2].trim() };

    return { title: text.trim() };
};

const isSectionHeading = (text: string) => {
    const letters = text.replace(/[^A-Za-z]/g, '');
    if (letters.length < 3 || letters.length > 40) return false;
    return letters === letters.toUpperCase();
};

const isTableLine = (line: string) => line.trim().startsWith('|');

/**
 * Google Docs exports resumes as bold paragraphs and layout tables rather than
 * markdown headings. This rewrites the export into the heading structure the
 * parser below expects, without asking anyone to restructure their document.
 */
export const adaptGoogleDoc = (markdown: string): string => {
    const src = markdown
        .replace(/\\([-_*.#|[\]()+&~^$!?])/g, '$1')
        .replace(/\r\n/g, '\n')
        .split('\n');

    const out: string[] = [];
    let hasTitle = /^#\s+/m.test(markdown);
    let sawSection = /^##\s+/m.test(markdown);
    let emittedSummary = false;

    for (let i = 0; i < src.length; i++) {
        const line = src[i].trim();

        if (!line) {
            out.push('');
            continue;
        }

        /* header block: the layout table holding name and contact details --- */

        if (
            !hasTitle &&
            isTableLine(line) &&
            /@|\bRemote\b|\d{7,}/.test(line)
        ) {
            const cells: string[] = [];
            while (i < src.length && isTableLine(src[i].trim())) {
                const row = src[i].trim();
                if (!isDivider(row)) cells.push(...splitRow(row));
                i++;
            }
            i--;

            const contact: string[] = [];
            const tagline: string[] = [];
            let name = '';

            for (const cell of cells) {
                if (!cell) continue;

                if (!name) {
                    const caps = cell.match(
                        /^((?:[A-Z][A-Z'’-]+\s+){1,3})(.*)$/,
                    );
                    if (caps) {
                        name = caps[1].trim();
                        if (caps[2].trim()) tagline.push(caps[2].trim());
                        continue;
                    }
                }

                let rest = cell;

                const links = [...rest.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)];
                for (const link of links) {
                    const label = link[1];
                    const key = /linkedin/i.test(label)
                        ? 'linkedin'
                        : /github/i.test(label)
                          ? 'github'
                          : /twitter|x\.com/i.test(label)
                            ? 'x'
                            : 'site';
                    contact.push(`- ${key}: [${label}](${link[2]})`);
                    rest = rest.replace(link[0], ' ');
                }

                const email = rest.match(
                    /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/,
                );
                if (email) {
                    contact.push(`- email: ${email[0]}`);
                    rest = rest.replace(email[0], ' ');
                }

                /*
                 * Phone numbers stay out of the public page. They remain in the
                 * source document and in resume.pdf for anyone who downloads it.
                 */
                const phone = rest.match(/(\+?\d[\d\s()-]{6,}\d)/);
                if (phone) rest = rest.replace(phone[0], ' ');

                rest = rest.replace(/\s{2,}/g, ' ').trim();
                if (!rest) continue;

                if (/remote|relocat|based in|open to/i.test(rest))
                    contact.push(`- location: ${rest}`);
                else tagline.push(rest);
            }

            out.push(`# ${name || 'Resume'}`);
            out.push('');
            if (tagline.length) {
                out.push(tagline.join(' — '));
                out.push('');
            }
            if (contact.length) {
                out.push('## CONTACT');
                out.push('');
                out.push(...contact);
                out.push('');
            }
            hasTitle = true;
            continue;
        }

        /* bold paragraph: either a section heading or an entry ------------- */

        const wholeBold = line.match(/^\*\*(.+?)\*\*$/);
        if (wholeBold) {
            const text = wholeBold[1].trim();

            if (isSectionHeading(text)) {
                out.push(`## ${text.toUpperCase()}`);
                sawSection = true;
                continue;
            }

            const { title, meta } = splitGlued(text);
            out.push(`### ${title}${meta ? ` | ${meta}` : ''}`);

            continue;
        }

        /* "**Name**  *(meta)*" or "**Place,** qualification" -------------- */

        const leadBold = line.match(/^\*\*(.+?)\*\*\s*(.*)$/);
        if (leadBold && leadBold[2]) {
            const head = leadBold[1].trim();
            const trail = leadBold[2].trim();

            const italic = trail.match(/^\*(.+)\*$/);
            if (italic) {
                out.push(`### ${head} | ${italic[1].trim()}`);
                continue;
            }

            const { title, meta } = splitGlued(`${head} ${trail}`);
            out.push(`### ${title}${meta ? ` | ${meta}` : ''}`);

            continue;
        }

        /* first prose paragraph before any real section becomes the summary */

        if (
            hasTitle &&
            !sawSection &&
            !emittedSummary &&
            !isTableLine(line) &&
            !line.startsWith('-') &&
            line.length > 80
        ) {
            out.push('## SUMMARY');
            out.push('');
            out.push(line);
            emittedSummary = true;

            continue;
        }

        out.push(src[i]);
    }

    return out.join('\n');
};

export const parseResume = (input: string): Resume => {
    const syncedOn = input.match(SYNCED)?.[1];
    const markdown = adaptGoogleDoc(input.replace(SYNCED, ''));
    const lines = markdown.split('\n');

    const resume: Resume = { name: '', tagline: [], sections: [], syncedOn };

    let section: ResumeSection | null = null;
    let sawTagline = false;

    const openSection = (name: string) => {
        section = { name, blocks: [] };
        resume.sections.push(section);
        return section;
    };

    const current = () => section ?? openSection('');

    const sectionHasEntries = () =>
        current().blocks.some(block => block.type === 'entry');

    for (let i = 0; i < lines.length; i++) {
        const raw = lines[i];
        const line = raw.trim();

        if (!line) continue;
        if (line.startsWith('<!--')) continue;

        /* headings ---------------------------------------------------- */

        if (/^#\s+/.test(line)) {
            resume.name = inlineToText(parseInline(line.replace(/^#\s+/, '')));
            continue;
        }

        if (/^##\s+/.test(line)) {
            openSection(
                inlineToText(
                    parseInline(line.replace(/^##\s+/, '')),
                ).toUpperCase(),
            );
            continue;
        }

        const heading = line.match(/^(#{3,6})\s+(.*)$/);
        if (heading) {
            const level = heading[1].length as 3 | 4 | 5 | 6;
            const [titlePart, ...metaParts] = heading[2].split('|');
            const meta = metaParts.join('|').trim();
            current().blocks.push({
                type: 'entry',
                level,
                title: parseInline(titlePart.trim()),
                meta: meta ? parseInline(meta) : undefined,
            });
            continue;
        }

        /* rules -------------------------------------------------------- */

        if (/^([-*_])\1{2,}$/.test(line.replace(/\s/g, ''))) {
            current().blocks.push({ type: 'rule' });
            continue;
        }

        /* tables ------------------------------------------------------- */

        if (line.startsWith('|') && lines[i + 1] && isDivider(lines[i + 1])) {
            const first = splitRow(line);
            const cells: string[][] = [];
            i += 2;
            while (i < lines.length && lines[i].trim().startsWith('|')) {
                cells.push(splitRow(lines[i].trim()));
                i++;
            }
            i--;

            /*
             * Google Docs puts the first data row where markdown expects a
             * header, so a two-column layout table is really a list of
             * key/value pairs. Render it as aligned rows, not a table.
             */
            const isKeyValue =
                first.length === 2 &&
                cells.every(row => row.length === 2) &&
                [first, ...cells].every(
                    row => row[0].replace(/\*/g, '').length <= 26,
                );

            if (isKeyValue) {
                for (const [key, value] of [first, ...cells]) {
                    if (!key && !value) continue;
                    current().blocks.push({
                        type: 'row',
                        key: key.replace(/\*/g, '').trim(),
                        value: parseInline(value),
                    });
                }
                continue;
            }

            current().blocks.push({
                type: 'table',
                headers: first.map(cell => parseInline(cell)),
                rows: cells.map(row => row.map(cell => parseInline(cell))),
            });
            continue;
        }

        /* quotes ------------------------------------------------------- */

        if (line.startsWith('>')) {
            current().blocks.push({
                type: 'quote',
                content: parseInline(line.replace(/^>\s?/, '')),
            });
            continue;
        }

        /* bullets ------------------------------------------------------ */

        const bullet = raw.match(/^(\s*)([-*+]|\d+[.)])\s+(.*)$/);
        if (bullet) {
            const indent = bullet[1].replace(/\t/g, '  ').length;
            const depth = Math.min(Math.floor(indent / 2), 4);
            const ordered = /\d/.test(bullet[2]);
            const text = bullet[3].trim();

            const pair =
                depth === 0 && !ordered && !sectionHasEntries()
                    ? text.match(ROW_KEY)
                    : null;

            if (pair && !pair[2].startsWith('//')) {
                current().blocks.push({
                    type: 'row',
                    key: pair[1].trim(),
                    value: parseInline(pair[2].trim()),
                });
            } else {
                current().blocks.push({
                    type: 'bullet',
                    depth,
                    ordered,
                    marker: ordered ? bullet[2] : undefined,
                    content: parseInline(text),
                });
            }
            continue;
        }

        /* paragraphs --------------------------------------------------- */

        if (!section && !sawTagline && resume.name) {
            resume.tagline = parseInline(line);
            sawTagline = true;
            continue;
        }

        /* an italic-only line straight after a role is its company and place */
        const italicOnly = line.match(/^\*([^*]+)\*$|^_([^_]+)_$/);
        if (italicOnly) {
            const blocks = current().blocks;
            const previous = blocks[blocks.length - 1];
            if (previous?.type === 'entry' && !previous.subtitle) {
                previous.subtitle = parseInline(
                    (italicOnly[1] ?? italicOnly[2]).trim(),
                );
                continue;
            }
        }

        current().blocks.push({ type: 'para', content: parseInline(line) });
    }

    return resume;
};

export const getResume = (): Resume => {
    const path = join(process.cwd(), 'content', 'resume.md');
    return parseResume(readFileSync(path, 'utf8'));
};
