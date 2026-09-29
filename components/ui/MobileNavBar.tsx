'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher';
import { cn } from '@/lib/utils';
import info from '@/misc/info';
import type { NavLinkType } from '@/types/types.navigation';

interface MobileNavBarProps {
    active: NavLinkType;
}

export const MobileNavBar = (props: MobileNavBarProps) => {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    return (
        <>
            <div className="z-50 flex items-center gap-1 sm:hidden">
                <ThemeSwitcher />
                <button
                    type="button"
                    className="grid h-7 w-7 cursor-pointer place-items-center rounded-[4px] text-[18px] leading-none text-[var(--paper-muted)] hover:bg-[var(--paper-accent-soft)] hover:text-[var(--paper-bright)]"
                    aria-label={isOpen ? 'Close navigation' : 'Open navigation'}
                    aria-expanded={isOpen}
                    onClick={() => setIsOpen(open => !open)}
                >
                    <span aria-hidden="true">{isOpen ? '×' : '≡'}</span>
                </button>
            </div>

            {isOpen && (
                <div
                    className="mobile-menu-enter fixed inset-0 z-40 flex items-center justify-center px-6 backdrop-blur-sm"
                    style={{
                        background:
                            'color-mix(in oklab, var(--paper) 88%, transparent)',
                    }}
                    onClick={() => setIsOpen(false)}
                >
                    <div
                        className="mobile-menu-panel term-chrome w-full max-w-xs"
                        onClick={event => event.stopPropagation()}
                    >
                        <div className="term-bar">
                            <span className="term-dot" />
                            <span className="term-dot" />
                            <span className="term-dot" />
                            <span className="ink-faint ml-2 text-[11px]">
                                cd
                            </span>
                        </div>

                        <ul className="px-3 py-3 text-[13px]">
                            {info.navLinks.map(item => {
                                const isActive = props.active === item.title;
                                return (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            onClick={() => setIsOpen(false)}
                                            className={cn(
                                                'flex items-baseline gap-2 rounded-[4px] px-2 py-2',
                                                isActive &&
                                                    'bg-[var(--paper-accent-soft)]',
                                            )}
                                        >
                                            <span className="term-sym">$</span>
                                            <span
                                                style={{
                                                    color: isActive
                                                        ? 'var(--paper-bright)'
                                                        : 'var(--term-blue)',
                                                }}
                                            >
                                                cd{' '}
                                                {item.title === 'home'
                                                    ? '~'
                                                    : item.title}
                                            </span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            )}
        </>
    );
};
