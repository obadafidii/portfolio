#!/usr/bin/env node
/**
 * Pulls the resume from Google Docs as Markdown and writes content/resume.md.
 *
 *   RESUME_DOC_ID=<doc id> npm run resume:sync
 *
 * The doc must be shared as "anyone with the link can view". The doc id is the
 * long string in the doc URL:
 *   https://docs.google.com/document/d/<THIS_PART>/edit
 *
 * The written file is meant to be committed, so the build never depends on
 * Google being reachable and every resume change shows up as a diff.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(HERE, '../content/resume.md');

const docId = process.env.RESUME_DOC_ID;

if (!docId) {
    console.error(
        [
            'RESUME_DOC_ID is not set.',
            '',
            'Find the id in your Google Doc URL:',
            '  https://docs.google.com/document/d/<THIS_PART>/edit',
            '',
            'Then run:',
            '  RESUME_DOC_ID=<id> npm run resume:sync',
            '',
            'Or add it to .env.local so you do not have to retype it.',
        ].join('\n'),
    );
    process.exit(1);
}

const url = `https://docs.google.com/document/d/${docId}/export?format=md`;

/** Google Docs emits smart quotes, escaped punctuation and stray NBSPs. */
const normalise = markdown =>
    markdown
        .replace(/\r\n/g, '\n')
        .replace(/ /g, ' ')
        .replace(/\\([-_*.#|[\]])/g, '$1')
        .replace(/[‘’]/g, "'")
        .replace(/[“”]/g, '"')
        .replace(/\n{3,}/g, '\n\n')
        .split('\n')
        .map(line => line.replace(/[ \t]+$/, ''))
        .join('\n')
        .trim();

try {
    const response = await fetch(url, { redirect: 'follow' });

    if (!response.ok) {
        throw new Error(
            `${response.status} ${response.statusText}. ` +
                'Check the doc id, and that link sharing is set to "anyone with the link can view".',
        );
    }

    const body = await response.text();

    if (body.trimStart().startsWith('<')) {
        throw new Error(
            'Google returned HTML instead of Markdown — the doc is probably not shared publicly.',
        );
    }

    const markdown = normalise(body);

    if (markdown.length < 40) {
        throw new Error('The exported document looks empty.');
    }

    await mkdir(dirname(OUT), { recursive: true });
    await writeFile(
        OUT,
        `${markdown}\n\n<!-- synced from google docs on ${new Date().toISOString().slice(0, 10)} -->\n`,
        'utf8',
    );

    const sections = (markdown.match(/^##\s+/gm) ?? []).length;
    console.log(
        `Wrote content/resume.md — ${markdown.length} chars, ${sections} sections.`,
    );
    console.log('Review the diff, then commit it.');
} catch (error) {
    console.error(`Resume sync failed: ${error.message}`);
    process.exit(1);
}
