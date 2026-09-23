import Image from 'next/image';
import { cloudinaryImageLoader, isCloudinaryImage } from '@/lib/cloudinary';

interface ResizableImageProps {
    src: string;
    alt: string;
    width: number;
    height: number;
    desc?: string;
}

const ResizableImg = ({ src, alt, width, height, desc }: ResizableImageProps) => {
    const cloudinary = isCloudinaryImage(src);

    return (
        <figure className="mdx-image-frame group">
            <Image
                src={src}
                alt={alt}
                width={width}
                height={height}
                loader={cloudinary ? cloudinaryImageLoader : undefined}
                sizes={`(max-width: ${width}px) 100vw, ${width}px`}
                className="h-auto w-full rounded-[14px] border border-[#2a3347] bg-[#0b1120] shadow-[0_14px_35px_-24px_rgb(0,0,0,0.95)] transition duration-300 group-hover:scale-[1.01]"
            />
            {desc && <figcaption className="mt-2 px-1 text-xs text-[#93a4bf]">{desc}</figcaption>}
        </figure>
    );
};

export default ResizableImg;
