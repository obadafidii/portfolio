'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export const ThemeSwitcher = () => {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    if (!mounted) return null;

    return (
        <button
            type="button"
            aria-label={
                theme === 'dark'
                    ? 'Switch to light theme'
                    : 'Switch to dark theme'
            }
            className="grid h-7 w-7 cursor-pointer place-items-center rounded-[4px] text-[var(--paper-muted)] transition-colors duration-200 hover:bg-[var(--paper-accent-soft)] hover:text-[var(--paper-bright)]"
            onClick={toggleTheme}
        >
            <span aria-hidden="true" className="text-[15px] leading-none">
                {theme === 'dark' ? '☾' : '☀'}
            </span>
        </button>
    );
};
