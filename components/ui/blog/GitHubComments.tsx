'use client';

import { useTheme } from 'next-themes';
import { useEffect, useRef } from 'react';

import styles from './GitHubComments.module.css';

const REPOSITORY = 'obadafidii/portfolio';
const REPOSITORY_ID = 'R_kgDOOxqf3g';
const CATEGORY = process.env.NEXT_PUBLIC_GISCUS_CATEGORY ?? 'General';
const CATEGORY_ID = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID || 'DIC_kwDOOxqf3s4DGGuO';

export function GitHubComments({ postKey }: { postKey: string }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const { resolvedTheme } = useTheme();

    useEffect(() => {
        const container = containerRef.current;
        if (!container || !resolvedTheme) return;

        const script = document.createElement('script');
        script.src = 'https://giscus.app/client.js';
        script.async = true;
        script.crossOrigin = 'anonymous';
        script.dataset.repo = REPOSITORY;
        script.dataset.repoId = REPOSITORY_ID;
        script.dataset.category = CATEGORY;
        script.dataset.categoryId = CATEGORY_ID;
        script.dataset.mapping = 'specific';
        script.dataset.term = `blog:${postKey}`;
        script.dataset.strict = '1';
        script.dataset.reactionsEnabled = '1';
        script.dataset.emitMetadata = '0';
        script.dataset.inputPosition = 'top';
        const themeFile = resolvedTheme === 'light' ? 'giscus-light.css' : 'giscus-dark.css';
        script.dataset.theme = window.location.protocol === 'https:'
            ? new URL(`/${themeFile}`, window.location.origin).href
            : resolvedTheme === 'light' ? 'light' : 'transparent_dark';
        script.dataset.lang = 'en';
        container.replaceChildren(script);

        return () => container.replaceChildren();
    }, [postKey, resolvedTheme]);

    return (
        <section className={styles.comments} aria-labelledby={`comments-${postKey}`}>
            <header className={styles.header}>
                <div>
                    <h2 id={`comments-${postKey}`}>Comments</h2>
                    <p>Sign in with GitHub to comment or react.</p>
                </div>
                <span>github/discussions</span>
            </header>

            <div ref={containerRef} className={styles.embed} />
        </section>
    );
}
