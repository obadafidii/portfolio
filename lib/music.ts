import { readdirSync } from 'node:fs';
import { join } from 'node:path';

export interface Track {
    title: string;
    src: string;
}

const AUDIO = /\.(mp3|ogg|oga|opus|m4a|aac|wav|webm)$/i;

/** "02-desert_mystic.mp3" → "Desert Mystic". */
const titleFromFile = (file: string) =>
    file
        .replace(AUDIO, '')
        .replace(/^\d+[\s._-]+/, '')
        .replace(/[\s._-]+/g, ' ')
        .trim()
        .replace(/\b\w/g, letter => letter.toUpperCase());

/**
 * Every audio file in public/music becomes a track, in filename order. Prefix
 * names with numbers (01-, 02-) to choose the order. Runs on the server.
 */
export const getTracks = (): Track[] => {
    try {
        return readdirSync(join(process.cwd(), 'public', 'music'))
            .filter(file => AUDIO.test(file))
            .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
            .map(file => ({
                title: titleFromFile(file),
                src: `/music/${encodeURIComponent(file)}`,
            }));
    } catch {
        return [];
    }
};
