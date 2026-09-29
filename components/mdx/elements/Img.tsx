import Image from 'next/image';
import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { cloudinaryImageLoader, isCloudinaryImage } from '@/lib/cloudinary';

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

const Img = ({
    src,
    alt,
    width,
    height,
    className,
    caption,
    maxWidth,
}: ImageProps) => {
    const resolvedWidth =
        typeof width === 'number' ? width : Number(width) || 1280;
    const resolvedHeight =
        typeof height === 'number' ? height : Number(height) || 720;
    const label = caption ?? alt;
    const cloudinary = isCloudinaryImage(src);

    return (
        <figure className="mdx-image-frame" style={{ maxWidth }}>
            <Image
                src={src}
                alt={alt}
                width={resolvedWidth}
                height={resolvedHeight}
                loader={cloudinary ? cloudinaryImageLoader : undefined}
                sizes={
                    maxWidth
                        ? `(max-width: ${maxWidth}px) 100vw, ${maxWidth}px`
                        : '(max-width: 768px) 100vw, (max-width: 1100px) 760px, 820px'
                }
                className={cn('h-auto w-full rounded-[4px] border', className)}
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
