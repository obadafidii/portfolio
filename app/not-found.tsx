'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { CommandLine, Prompt } from '@/components/ui/shell/CommandLine';
import { ROUTES } from '@/components/ui/shell/registry';

const closestRoute = (attempted: string) => {
    const needle = attempted.replace(/^\/+/, '').toLowerCase();
    if (!needle) return ROUTES[0];

    const scored = ROUTES.map(route => {
        let score = 0;
        for (const char of new Set(needle)) {
            if (route.name.includes(char)) score += 1;
        }
        if (route.name.startsWith(needle.slice(0, 2))) score += 3;
        return { route, score };
    }).sort((a, b) => b.score - a.score);

    return scored[0].route;
};

const NotFoundPage = () => {
    const pathname = usePathname();
    const suggestion = closestRoute(pathname ?? '');

    return (
        <div className="term-page">
            <header className="term-titlebar">
                <div className="hidden shrink-0 items-center gap-2 sm:flex">
                    <span className="term-dot" />
                    <span className="term-dot" />
                    <span className="term-dot" />
                </div>
                <span className="ink-faint text-[11px]">
                    david@obadafidi — zsh
                </span>
            </header>

            <main className="term-content">
                <CommandLine cwd="~">
                    <div className="flex flex-wrap items-baseline gap-x-2">
                        <Prompt cwd="~" />
                        <span className="term-cmd">cd {pathname}</span>
                    </div>

                    <p className="term-err mt-1">
                        cd: no such file or directory: {pathname}
                    </p>

                    <p className="ink-faint mt-1">
                        did you mean{' '}
                        <Link
                            href={suggestion.href}
                            className="underline"
                            style={{ color: 'var(--term-blue)' }}
                        >
                            {suggestion.name}
                        </Link>
                        ?
                    </p>

                    <div className="mt-8">
                        <div className="flex flex-wrap items-baseline gap-x-2">
                            <Prompt cwd="~" />
                            <span className="term-cmd">ls</span>
                        </div>
                        <div className="mt-1 space-y-0.5">
                            {ROUTES.map(route => (
                                <Link
                                    key={route.href}
                                    href={route.href}
                                    className="term-row group"
                                >
                                    <span className="ink-faint w-[11ch] shrink-0">
                                        drwxr-xr-x
                                    </span>
                                    <span
                                        className="group-hover:underline"
                                        style={{ color: 'var(--term-blue)' }}
                                    >
                                        {route.name}/
                                    </span>
                                    <span className="ink-muted ml-auto text-[11px]">
                                        {route.note}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </CommandLine>
            </main>

            <footer className="term-statusbar">
                <span>404</span>
                <span className="ml-auto">
                    <Link href="/" style={{ color: 'var(--term-blue)' }}>
                        back to ~
                    </Link>
                </span>
            </footer>
        </div>
    );
};

export default NotFoundPage;
