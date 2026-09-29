const LOCAL_IMAGE_PREFIX = '/image/';
const DEFAULT_CLOUDINARY_FOLDER = 'portfolio/blog';

type ImageTransform = {
    width?: number;
    height?: number;
    fit?: 'fill' | 'fit' | 'limit' | 'pad';
    background?: string;
    format?: 'auto' | 'jpg' | 'png' | 'webp';
    quality?: number | 'auto';
};

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const cloudinaryFolder =
    process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER || DEFAULT_CLOUDINARY_FOLDER;

const encodePath = (value: string) =>
    value.split('/').map(encodeURIComponent).join('/');

export const isLocalBlogImage = (src: string) =>
    src.startsWith(LOCAL_IMAGE_PREFIX);

export const blogImagePublicId = (src: string) => {
    const relativePath = src
        .slice(LOCAL_IMAGE_PREFIX.length)
        .replace(/^\/+/, '');
    const withoutExtension = relativePath.replace(/\.[a-z0-9]+$/i, '');
    return `${cloudinaryFolder}/${withoutExtension}`;
};

export const isCloudinaryImage = (src: string) =>
    src.startsWith('https://res.cloudinary.com/');

const addTransformations = (src: string, operations: string) => {
    const marker = '/image/upload/';
    const markerIndex = src.indexOf(marker);
    if (markerIndex === -1) return src;
    const deliveryStart = markerIndex + marker.length;
    return `${src.slice(0, deliveryStart)}${operations}/${src.slice(deliveryStart)}`;
};

/**
 * Resolve an author-friendly /image path to Cloudinary when configured.
 * Legacy paths need Cloudinary configuration; new articles use versioned URLs.
 * Original images are kept outside public and are not served locally.
 */
export const resolveBlogImage = (
    src: string,
    transform: ImageTransform = {},
) => {
    const operations = [
        `f_${transform.format ?? 'auto'}`,
        `q_${transform.quality ?? 'auto'}`,
        transform.fit ? `c_${transform.fit}` : undefined,
        transform.background ? `b_${transform.background}` : undefined,
        transform.width ? `w_${transform.width}` : undefined,
        transform.height ? `h_${transform.height}` : undefined,
    ]
        .filter(Boolean)
        .join(',');

    if (isCloudinaryImage(src)) return addTransformations(src, operations);
    if (!cloudName || !isLocalBlogImage(src)) return src;

    const deliveryUrl = `https://res.cloudinary.com/${encodeURIComponent(cloudName)}/image/upload/${encodePath(blogImagePublicId(src))}`;
    return addTransformations(deliveryUrl, operations);
};

export const cloudinaryImageLoader = ({
    src,
    width,
    quality,
}: {
    src: string;
    width: number;
    quality?: number;
}) => resolveBlogImage(src, { width, fit: 'limit', quality });
