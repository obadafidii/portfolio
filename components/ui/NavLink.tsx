import { clsx } from 'clsx';
import Link from 'next/link';

import type { NavLinkType } from '@/types/types.navigation';

interface NavLinkProps {
    title: string;
    href: string;
    selected: NavLinkType;
}

export const NavLink = (props: NavLinkProps) => {
    const isActive = props.title == props.selected;

    return (
        <Link
            href={props.href}
            className={clsx(
                'rounded-[4px] px-2.5 py-1.5 text-[12px] tracking-[0.02em] transition-colors duration-200',
                isActive
                    ? 'bg-[var(--paper-accent-soft)] text-[var(--paper-bright)]'
                    : 'text-[var(--paper-muted)] hover:text-[var(--paper-bright)]',
            )}
            aria-current={isActive ? 'page' : undefined}
        >
            <span className="ink-faint">/</span>
            {props.title}
        </Link>
    );
};
