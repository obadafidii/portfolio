import Image from 'next/image';
import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface ImageProps extends HTMLAttributes<HTMLImageElement> {
    src: string;
    alt: string;
    width?: string | number;
    height?: string | number;
    /** Overrides the caption. Defaults to the alt text. */
    caption?: string;
    /** Optional display width for illustrations that should sit within the text measure. */
    maxWidth?: number;
}

const Img = ({ src, alt, width, height, className, caption, maxWidth }: ImageProps) => {
    const resolvedWidth = typeof width === 'number' ? width : Number(width) || 1280;
    const resolvedHeight = typeof height === 'number' ? height : Number(height) || 720;
    const label = caption ?? alt;

    return (
        <figure className="mdx-image-frame" style={{ maxWidth }}>
            <Image
                src={src}
                alt={alt}
                width={resolvedWidth}
                height={resolvedHeight}
                sizes={maxWidth ? `(max-width: ${maxWidth}px) 100vw, ${maxWidth}px` : undefined}
                className={cn(
                    'h-auto w-full rounded-[4px] border',
                    className,
                )}
                style={{ borderColor: 'var(--paper-line-strong)' }}
            />
            {label && (
                <figcaption
                    className="mt-2 text-[12px]"
                    style={{
                        color: 'var(--paper-faint)',
                        fontFamily: 'var(--font-mono)',
                    }}
                >
                    {label}
                </figcaption>
            )}
        </figure>
    );
};

export default Img;
