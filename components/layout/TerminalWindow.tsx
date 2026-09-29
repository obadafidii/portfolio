'use client';

import dynamic from 'next/dynamic';
import {
    useState,
    type CSSProperties,
    type KeyboardEvent,
    type PointerEvent,
    type ReactNode,
} from 'react';

import info from '@/misc/info';
import { NavLink } from '@/components/ui/NavLink';
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher';
import { MobileNavBar } from '@/components/ui/MobileNavBar';
import { PaneShellSessionProvider } from '@/components/ui/shell/session';
import type { NavLinkType } from '@/types/types.navigation';
import {
    MAX_PANES,
    PANE_NAV_ROUTES,
    PANE_ROUTES,
    useEmbeddedPane,
    useSplitWorkspace,
    type PaneTheme,
} from './split-state';

const SplitPaneContent = dynamic(
    () => import('./SplitPaneContent').then(module => module.SplitPaneContent),
    { loading: () => <p className="ink-faint">loading pane…</p> },
);

interface TerminalWindowProps {
    currentPage: NavLinkType;
    path: string;
    status?: ReactNode;
    children: ReactNode;
}

const PANE_THEMES: { value: PaneTheme; label: string }[] = [
    { value: 'dark', label: 'dark' },
    { value: 'blue', label: 'blue' },
    { value: 'paper', label: 'paperkit' },
    { value: 'transparent', label: 'clear' },
];

const pathLabel = (path: string) =>
    PANE_ROUTES.find(route => route.href === path)?.label ?? path;

const SplitButton = ({
    count,
    onClick,
}: {
    count: number;
    onClick: () => void;
}) => {
    const full = count >= MAX_PANES;

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={full}
            className="term-split-button"
            aria-label={
                full ? 'Maximum of four panes reached' : 'Add split pane'
            }
            data-active={count > 1}
            title={
                full ? 'Four-pane maximum reached' : 'Add pane · Ctrl/Cmd + \\'
            }
        >
            <span aria-hidden="true">⊞</span>
            <span className="hidden lg:inline">split {count}/4</span>
        </button>
    );
};

const clampRatio = (value: number) => Math.min(75, Math.max(25, value));

export const TerminalWindow = ({
    currentPage,
    path,
    status,
    children,
}: TerminalWindowProps) => {
    const embedded = useEmbeddedPane();
    const workspace = useSplitWorkspace();
    const [dragging, setDragging] = useState<'column' | 'row' | null>(null);

    if (embedded) return <>{children}</>;

    const activePane =
        workspace.panes.find(pane => pane.id === workspace.activePane) ??
        workspace.panes[0];
    const activePaneIndex = workspace.panes.findIndex(
        pane => pane.id === activePane.id,
    );

    const resizeColumn = (clientX: number, target: HTMLElement) => {
        const bounds = target.parentElement?.getBoundingClientRect();
        if (!bounds) return;
        workspace.setColumnRatio(
            clampRatio(((clientX - bounds.left) / bounds.width) * 100),
        );
    };

    const resizeRow = (clientY: number, target: HTMLElement) => {
        const bounds = target.parentElement?.getBoundingClientRect();
        if (!bounds) return;
        workspace.setRowRatio(
            clampRatio(((clientY - bounds.top) / bounds.height) * 100),
        );
    };

    const onDividerKeyDown = (
        axis: 'column' | 'row',
        event: KeyboardEvent<HTMLDivElement>,
    ) => {
        const previous =
            axis === 'column' ? workspace.columnRatio : workspace.rowRatio;
        const negativeKey = axis === 'column' ? 'ArrowLeft' : 'ArrowUp';
        const positiveKey = axis === 'column' ? 'ArrowRight' : 'ArrowDown';
        if (event.key !== negativeKey && event.key !== positiveKey) return;

        event.preventDefault();
        const next = clampRatio(
            previous + (event.key === negativeKey ? -2 : 2),
        );
        if (axis === 'column') workspace.setColumnRatio(next);
        else workspace.setRowRatio(next);
    };

    const onDividerPointerDown = (
        axis: 'column' | 'row',
        event: PointerEvent<HTMLDivElement>,
    ) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        setDragging(axis);
        if (axis === 'column') resizeColumn(event.clientX, event.currentTarget);
        else resizeRow(event.clientY, event.currentTarget);
    };

    const onDividerPointerMove = (event: PointerEvent<HTMLDivElement>) => {
        if (dragging === 'column')
            resizeColumn(event.clientX, event.currentTarget);
        if (dragging === 'row') resizeRow(event.clientY, event.currentTarget);
    };

    const finishResize = (event: PointerEvent<HTMLDivElement>) => {
        setDragging(null);
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }
    };

    return (
        <div
            className={`term-page ${workspace.splitOpen ? 'term-page--split' : ''}`}
        >
            <header className="term-titlebar">
                <div className="hidden shrink-0 items-center gap-2 sm:flex">
                    <span className="term-dot" />
                    <span className="term-dot" />
                    <span className="term-dot" />
                </div>

                <span className="ink-faint hidden min-w-0 truncate text-[11px] lg:block">
                    david@obadafidi —{' '}
                    {workspace.splitOpen
                        ? `${workspace.panes.length} panes`
                        : path}
                </span>

                <nav className="ml-auto hidden items-center gap-1 sm:flex">
                    {!workspace.splitOpen &&
                        info.navLinks.map(link => (
                            <NavLink
                                key={link.href}
                                href={link.href}
                                title={link.title}
                                selected={currentPage}
                            />
                        ))}
                    {!workspace.splitOpen && (
                        <span
                            className="mx-1 h-4 w-px"
                            style={{ background: 'var(--paper-line-strong)' }}
                        />
                    )}
                    <SplitButton
                        count={workspace.panes.length}
                        onClick={workspace.addPane}
                    />
                    <ThemeSwitcher />
                </nav>

                <div className="ml-auto flex items-center gap-1 sm:hidden">
                    <SplitButton
                        count={workspace.panes.length}
                        onClick={workspace.addPane}
                    />
                    {!workspace.splitOpen && (
                        <MobileNavBar active={currentPage} />
                    )}
                </div>
            </header>

            {workspace.splitOpen ? (
                <div className="term-split-workspace">
                    <div
                        className="term-split-tabs"
                        role="tablist"
                        aria-label="Portfolio panes"
                        style={
                            {
                                '--pane-count': workspace.panes.length,
                            } as CSSProperties
                        }
                    >
                        {workspace.panes.map((pane, index) => (
                            <button
                                key={pane.id}
                                type="button"
                                role="tab"
                                aria-selected={workspace.activePane === pane.id}
                                onClick={() => workspace.setActivePane(pane.id)}
                            >
                                {index + 1} · {pathLabel(pane.path)}
                            </button>
                        ))}
                    </div>

                    <div
                        className={`term-split-grid term-split-grid--${workspace.panes.length}`}
                        style={
                            {
                                '--split-column': `${workspace.columnRatio}%`,
                                '--split-row': `${workspace.rowRatio}%`,
                            } as CSSProperties
                        }
                    >
                        {workspace.panes.map((pane, index) => (
                            <section
                                key={pane.id}
                                className={`term-pane term-pane--slot-${index + 1} ${workspace.activePane === pane.id ? 'term-pane--active' : ''}`}
                                data-pane-theme={pane.theme}
                                data-mobile-visible={
                                    workspace.activePane === pane.id
                                }
                                onPointerDown={() =>
                                    workspace.setActivePane(pane.id)
                                }
                            >
                                <div className="term-pane-head">
                                    <span
                                        className="term-pane-focus"
                                        aria-hidden="true"
                                    />
                                    <span className="min-w-0 truncate">
                                        {pathLabel(pane.path)}
                                    </span>
                                    <label
                                        className="sr-only"
                                        htmlFor={`pane-theme-${pane.id}`}
                                    >
                                        Pane {index + 1} background
                                    </label>
                                    <select
                                        id={`pane-theme-${pane.id}`}
                                        value={pane.theme}
                                        onChange={event =>
                                            workspace.setPaneTheme(
                                                pane.id,
                                                event.target.value as PaneTheme,
                                            )
                                        }
                                        className="term-pane-theme-select"
                                        title="Pane background"
                                    >
                                        {PANE_THEMES.map(theme => (
                                            <option
                                                key={theme.value}
                                                value={theme.value}
                                            >
                                                {theme.label}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            workspace.closePane(pane.id)
                                        }
                                        className="term-pane-close"
                                        aria-label={`Close pane ${index + 1}`}
                                        title="Close pane"
                                    >
                                        ×
                                    </button>
                                </div>

                                <nav
                                    className="term-pane-nav"
                                    aria-label={`Pane ${index + 1} navigation`}
                                >
                                    {PANE_NAV_ROUTES.map(route => (
                                        <button
                                            key={route.href}
                                            type="button"
                                            aria-current={
                                                pane.path === route.href
                                                    ? 'page'
                                                    : undefined
                                            }
                                            onClick={() =>
                                                workspace.setPanePath(
                                                    pane.id,
                                                    route.href,
                                                )
                                            }
                                        >
                                            {route.navLabel}
                                        </button>
                                    ))}
                                </nav>

                                <div className="term-content term-pane-scroll">
                                    <PaneShellSessionProvider>
                                        <SplitPaneContent
                                            path={pane.path}
                                            navigate={nextPath =>
                                                workspace.setPanePath(
                                                    pane.id,
                                                    nextPath,
                                                )
                                            }
                                        />
                                    </PaneShellSessionProvider>
                                </div>
                            </section>
                        ))}

                        <div
                            className={`term-split-divider term-split-divider--vertical ${dragging === 'column' ? 'term-split-divider--dragging' : ''}`}
                            role="separator"
                            aria-label="Resize pane columns"
                            aria-orientation="vertical"
                            aria-valuemin={25}
                            aria-valuemax={75}
                            aria-valuenow={Math.round(workspace.columnRatio)}
                            tabIndex={0}
                            onDoubleClick={() => workspace.setColumnRatio(50)}
                            onKeyDown={event =>
                                onDividerKeyDown('column', event)
                            }
                            onPointerDown={event =>
                                onDividerPointerDown('column', event)
                            }
                            onPointerMove={onDividerPointerMove}
                            onPointerUp={finishResize}
                            onPointerCancel={finishResize}
                        />

                        {workspace.panes.length >= 3 && (
                            <div
                                className={`term-split-divider term-split-divider--horizontal ${dragging === 'row' ? 'term-split-divider--dragging' : ''}`}
                                role="separator"
                                aria-label="Resize pane rows"
                                aria-orientation="horizontal"
                                aria-valuemin={25}
                                aria-valuemax={75}
                                aria-valuenow={Math.round(workspace.rowRatio)}
                                tabIndex={0}
                                onDoubleClick={() => workspace.setRowRatio(50)}
                                onKeyDown={event =>
                                    onDividerKeyDown('row', event)
                                }
                                onPointerDown={event =>
                                    onDividerPointerDown('row', event)
                                }
                                onPointerMove={onDividerPointerMove}
                                onPointerUp={finishResize}
                                onPointerCancel={finishResize}
                            />
                        )}
                    </div>
                </div>
            ) : (
                <main className="term-content">{children}</main>
            )}

            <footer className="term-statusbar">
                <span className="truncate">
                    {workspace.splitOpen ? pathLabel(activePane.path) : path}
                </span>
                <span className="hidden sm:inline">zsh</span>
                <span className="hidden sm:inline">utf-8</span>
                {workspace.splitOpen && (
                    <span className="hidden md:inline">
                        pane {activePaneIndex + 1} of {workspace.panes.length} ·{' '}
                        {activePane.theme}
                    </span>
                )}
                <span className="ml-auto flex items-center gap-4">
                    {!workspace.splitOpen ? status : null}
                </span>
            </footer>
        </div>
    );
};
