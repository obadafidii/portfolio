import { cn } from '@/lib/utils';
import { HTMLAttributes, ReactNode } from 'react';

interface AProps extends HTMLAttributes<HTMLAnchorElement> {
    children: ReactNode;
}

const A = ({ children, className = '', ...props }: AProps) => {
    return (
        <a {...props} className={cn('cursor-pointer', className)}>
            {children}
        </a>
    );
};

export default A;
