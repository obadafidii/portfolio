'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState, type MouseEvent } from 'react';

import { PostView } from '@/components/ui/blog/PostView';
import { ManPageContent } from '@/components/ui/resume/ManPage';
import { CommandLine, Prompt } from '@/components/ui/shell/CommandLine';
import { getBlogMetadata, getBlogSeries, getPostKey } from '@/lib/blogs';
import type { Resume } from '@/lib/resume';
import { EmbeddedPaneProvider, PaneNavigationProvider } from './split-state';

const PaneLoading = () => <p className="ink-faint">loading pane…</p>;

const Home = dynamic(() => import('@/app/page'), { loading: PaneLoading });
const Blog = dynamic(() => import('@/app/blog/page'), { loading: PaneLoading });
const OpenSource = dynamic(() => import('@/app/open-source/page'), {
    loading: PaneLoading,
});
const Contact = dynamic(() => import('@/app/contact/page'), {
    loading: PaneLoading,
});
const Works = dynamic(() => import('@/app/works/page'), {
    loading: PaneLoading,
});

const MissingPane = ({ path }: { path: string }) => (
    <CommandLine cwd="~">
        <div>
            <div className="flex flex-wrap items-baseline gap-x-2">
                <Prompt cwd="~" />
                <span className="term-cmd">open {path}</span>
            </div>
            <p className="term-err mt-2">split: view is not registered</p>
            <a
                href={path}
                className="mt-2 inline-block underline"
                style={{ color: 'var(--term-blue)' }}
            >
                open it in the main pane →
            </a>
        </div>
    </CommandLine>
);

const ResumePane = () => {
    const [resume, setResume] = useState<Resume | null>(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        const controller = new AbortController();

        fetch('/api/resume', { signal: controller.signal })
            .then(response => {
                if (!response.ok) throw new Error('resume request failed');
                return response.json() as Promise<Resume>;
            })
            .then(setResume)
            .catch(error => {
                if (
                    error instanceof DOMException &&
                    error.name === 'AbortError'
                )
                    return;
                setFailed(true);
            });

        return () => controller.abort();
    }, []);

    if (failed) return <p className="term-err">resume: failed to load</p>;
    if (!resume) return <PaneLoading />;
    return <ManPageContent resume={resume} />;
};

const resolveContent = (path: string) => {
    if (path === '/') return <Home />;
    if (path === '/works') return <Works />;
    if (path === '/blog') return <Blog />;
    if (path === '/open-source') return <OpenSource />;
    if (path === '/resume') return <ResumePane />;
    if (path === '/contact') return <Contact />;
    const postKey = getPostKey(path);
    if (postKey && getBlogSeries(postKey)) return <Blog />;
    if (postKey && getBlogMetadata(postKey))
        return <PostView key={postKey} postKey={postKey} />;

    return <MissingPane path={path} />;
};

export const SplitPaneContent = ({
    path,
    navigate,
}: {
    path: string;
    navigate: (path: string) => void;
}) => {
    const interceptInternalLinks = (event: MouseEvent<HTMLDivElement>) => {
        if (
            event.defaultPrevented ||
            event.button !== 0 ||
            event.metaKey ||
            event.ctrlKey
        )
            return;

        const anchor = (event.target as HTMLElement).closest<HTMLAnchorElement>(
            'a[href]',
        );
        if (
            !anchor ||
            anchor.target === '_blank' ||
            anchor.hasAttribute('download')
        )
            return;

        const url = new URL(anchor.href, window.location.origin);
        if (url.origin !== window.location.origin || url.hash) return;

        event.preventDefault();
        navigate(url.pathname);
    };

    return (
        <PaneNavigationProvider navigate={navigate}>
            <EmbeddedPaneProvider>
                <div onClickCapture={interceptInternalLinks}>
                    {resolveContent(path)}
                </div>
            </EmbeddedPaneProvider>
        </PaneNavigationProvider>
    );
};
