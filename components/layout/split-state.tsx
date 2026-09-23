'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { getAllBlogs } from '@/lib/blogs';

export type PaneTheme = 'dark' | 'blue' | 'paper' | 'transparent';

export interface PaneState {
    id: number;
    path: string;
    theme: PaneTheme;
}

export const MAX_PANES = 4;

export const PANE_ROUTES = [
    { href: '/', label: '~ / home', navLabel: '/home' },
    { href: '/works', label: '~/works', navLabel: '/works' },
    { href: '/blog', label: '~/writing', navLabel: '/blog' },
    { href: '/open-source', label: '~/open-source', navLabel: '/oss' },
    { href: '/resume', label: '~/resume', navLabel: '/resume' },
    { href: '/contact', label: '~/contact', navLabel: '/contact' },
    ...getAllBlogs().map(post => ({
        href: `/blog/${post.slug}`,
        label: `~/writing/${post.slug}.md`,
        navLabel: `/${post.slug}`,
    })),
] as const;

export const PANE_NAV_ROUTES = PANE_ROUTES.slice(0, 6);

interface SplitWorkspaceValue {
    splitOpen: boolean;
    panes: PaneState[];
    activePane: number;
    setActivePane: (paneId: number) => void;
    addPane: () => void;
    closePane: (paneId: number) => void;
    setPanePath: (paneId: number, path: string) => void;
    setPaneTheme: (paneId: number, theme: PaneTheme) => void;
    columnRatio: number;
    setColumnRatio: (ratio: number) => void;
    rowRatio: number;
    setRowRatio: (ratio: number) => void;
}

export const SplitWorkspaceContext = createContext<SplitWorkspaceValue | null>(null);

export const useSplitWorkspace = () => {
    const value = useContext(SplitWorkspaceContext);
    if (!value) throw new Error('useSplitWorkspace must be used inside SplitWorkspaceProvider');
    return value;
};

const EmbeddedPaneContext = createContext(false);

export const EmbeddedPaneProvider = ({ children }: { children: ReactNode }) => (
    <EmbeddedPaneContext.Provider value>{children}</EmbeddedPaneContext.Provider>
);

export const useEmbeddedPane = () => useContext(EmbeddedPaneContext);

type PaneNavigate = ((href: string) => void) | null;

const PaneNavigationContext = createContext<PaneNavigate>(null);

export const PaneNavigationProvider = ({
    navigate,
    children,
}: {
    navigate: (href: string) => void;
    children: ReactNode;
}) => <PaneNavigationContext.Provider value={navigate}>{children}</PaneNavigationContext.Provider>;

export const usePaneNavigation = () => useContext(PaneNavigationContext);
