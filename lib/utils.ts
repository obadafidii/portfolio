import { clsx, type ClassValue } from 'clsx';

/*
 * Join class names. This used to run the result through tailwind-merge, but
 * no caller passes conflicting Tailwind classes, so the output is the same
 * and every page ships about 8 kB (gzip) less JavaScript.
 */
export function cn(...inputs: ClassValue[]) {
    return clsx(inputs);
}
