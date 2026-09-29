import { cn } from '@/lib/utils';
import { HTMLAttributes, ReactNode } from 'react';

interface BlockQuoteProps extends HTMLAttributes<HTMLQuoteElement> {
    children: ReactNode;
}

const BlockQuote = ({
    children,
    className = '',
    ...props
}: BlockQuoteProps) => {
    return (
        <blockquote {...props} className={cn(className)}>
            {children}
        </blockquote>
    );
};

export default BlockQuote;
