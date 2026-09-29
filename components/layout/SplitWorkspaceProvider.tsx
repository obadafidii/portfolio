'use client';

import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';

import {
    MAX_PANES,
    SplitWorkspaceContext,
    type PaneState,
    type PaneTheme,
} from './split-state';

const DEFAULT_PATHS = ['/works', '/resume', '/contact', '/'] as const;
const DEFAULT_THEMES: PaneTheme[] = ['dark', 'blue', 'paper', 'transparent'];

export const SplitWorkspaceProvider = ({
    children,
}: {
    children: ReactNode;
}) => {
    const pathname = usePathname();
    const router = useRouter();
    const nextPaneId = useRef(1);
    const [panes, setPanes] = useState<PaneState[]>([
        { id: 0, path: pathname, theme: DEFAULT_THEMES[0] },
    ]);
    const [activePane, setActivePane] = useState(0);
    const [columnRatio, setColumnRatio] = useState(50);
    const [rowRatio, setRowRatio] = useState(50);

    const splitOpen = panes.length > 1;

    useEffect(() => {
        setPanes(current => {
            if (current.length !== 1 || current[0].path === pathname)
                return current;
            return [{ ...current[0], path: pathname }];
        });
    }, [pathname]);

    const addPane = useCallback(() => {
        if (panes.length >= MAX_PANES) return;

        const usedPaths = new Set(panes.map(pane => pane.path));
        const path =
            DEFAULT_PATHS.find(candidate => !usedPaths.has(candidate)) ?? '/';
        const pane: PaneState = {
            id: nextPaneId.current++,
            path,
            theme: DEFAULT_THEMES[panes.length],
        };

        setPanes(current => [...current, pane]);
        setActivePane(pane.id);
    }, [panes]);

    const closePane = useCallback(
        (paneId: number) => {
            if (panes.length <= 1) return;

            const index = panes.findIndex(pane => pane.id === paneId);
            const next = panes.filter(pane => pane.id !== paneId);
            const nextActive =
                next[Math.min(Math.max(index, 0), next.length - 1)];

            setPanes(next);
            if (activePane === paneId) setActivePane(nextActive.id);
            if (next.length === 1) router.push(next[0].path);
        },
        [activePane, panes, router],
    );

    const setPanePath = useCallback((paneId: number, path: string) => {
        setPanes(current =>
            current.map(pane =>
                pane.id === paneId ? { ...pane, path } : pane,
            ),
        );
    }, []);

    const setPaneTheme = useCallback((paneId: number, theme: PaneTheme) => {
        setPanes(current =>
            current.map(pane =>
                pane.id === paneId ? { ...pane, theme } : pane,
            ),
        );
    }, []);

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key === '\\') {
                event.preventDefault();
                addPane();
            }
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [addPane]);

    const value = useMemo(
        () => ({
            splitOpen,
            panes,
            activePane,
            setActivePane,
            addPane,
            closePane,
            setPanePath,
            setPaneTheme,
            columnRatio,
            setColumnRatio,
            rowRatio,
            setRowRatio,
        }),
        [
            activePane,
            addPane,
            closePane,
            columnRatio,
            panes,
            rowRatio,
            setPanePath,
            setPaneTheme,
            splitOpen,
        ],
    );

    return (
        <SplitWorkspaceContext.Provider value={value}>
            {children}
        </SplitWorkspaceContext.Provider>
    );
};
