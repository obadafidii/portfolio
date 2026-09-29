import { getBlogMetadata } from '@/lib/blogs';
import { isCloudinaryImage, resolveBlogImage } from '@/lib/cloudinary';

export const runtime = 'nodejs';

/** Serve a small, standard-format preview without depending on an image optimizer URL. */
export async function GET(
    _request: Request,
    { params }: { params: Promise<{ slug: string[] }> },
) {
    const post = getBlogMetadata((await params).slug.join('/'));
    const src = post?.coverImage?.src;
    if (!src || !isCloudinaryImage(src)) {
        return new Response('Image not found', { status: 404 });
    }

    const cloudinarySrc = resolveBlogImage(src, {
        width: 1200,
        height: 630,
        fit: 'pad',
        background: 'rgb:10141b',
        format: 'jpg',
    });
    return new Response(null, {
        status: 307,
        headers: {
            Location: cloudinarySrc,
            'Cache-Control': 'public, max-age=31536000, immutable',
        },
    });
}
