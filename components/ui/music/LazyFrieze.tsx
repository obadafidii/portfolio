'use client';

import dynamic from 'next/dynamic';
import { useEffect } from 'react';

import { useMusic } from './MusicProvider';

/*
 * The frieze scenes are a large share of the JavaScript on every page, but
 * they only draw while music plays. Keep them out of the first load: fetch
 * the chunk once the browser is idle, and mount the wall only after a
 * visitor has pressed play. Until then the real Frieze would render nothing
 * anyway, so what visitors see does not change.
 */
const loadFrieze = () => import('./Frieze').then(module => module.Frieze);

const Frieze = dynamic(loadFrieze, { ssr: false });

export function LazyFrieze() {
    const { status } = useMusic();

    useEffect(() => {
        const preload = () => void loadFrieze();
        // Safari has no requestIdleCallback; a short timeout stands in.
        if (typeof window.requestIdleCallback === 'function') {
            const id = window.requestIdleCallback(preload, { timeout: 4000 });
            return () => window.cancelIdleCallback(id);
        }
        const id = setTimeout(preload, 2000);
        return () => clearTimeout(id);
    }, []);

    return status === 'idle' ? null : <Frieze />;
}
