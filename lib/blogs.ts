import { blogMetadata, blogSeries } from '@/meta/blog.meta';
import type { BlogMetadata } from '@/types/blog.type';

/** A post body is only public after its author marks it done. */
export const isReadable = (blog: Pick<BlogMetadata, 'status'>) =>
    blog.status === 'done';

const asListing = (entries: Record<string, BlogMetadata>) =>
    Object.entries(entries)
        .map(([key, meta]) => ({ ...meta, slug: key }))
        .sort(
            (a, b) =>
                Date.parse(b.publishedOn) - Date.parse(a.publishedOn) ||
                (a.series === b.series ? (b.part ?? 0) - (a.part ?? 0) : 0) ||
                a.slug.localeCompare(b.slug),
        );

/** Every article and series part appears directly in the main blog list. */
export const getAllBlogs = () => asListing(blogMetadata);

/** Individual articles, including every series part. */
export const getAllPosts = getAllBlogs;
export const getReadablePosts = () => getAllPosts().filter(isReadable);
export const getReadableBlogs = getReadablePosts;

export const getBlogMetadata = (key: string): BlogMetadata | undefined =>
    Object.hasOwn(blogMetadata, key) ? blogMetadata[key] : undefined;

export const getBlogSeries = (key: string) =>
    Object.hasOwn(blogSeries, key) ? blogSeries[key] : undefined;

export const getSeriesParts = (key: string) =>
    (getBlogSeries(key)?.parts ?? []).map(partKey => blogMetadata[partKey]);

export const getPostKey = (pathname: string) => {
    const prefix = '/blog/';
    if (!pathname.startsWith(prefix)) return undefined;
    const key = pathname.slice(prefix.length).replace(/\/+$/, '');
    return key.replace(/^post\//, '') || undefined;
};

export const blogStatusLabel = (status: BlogMetadata['status']) =>
    status === 'done'
        ? 'published'
        : status === 'in-progress'
          ? 'in progress'
          : 'draft';

/**
 * Page metadata for a post.
 *
 * Unpublished posts render a notice instead of 404ing, which means they now
 * answer 200 — so they must be explicitly noindex, or crawlers will index a
 * page whose only content is "this is not finished".
 */
export const buildPostMetadata = (
    key: string,
    site: { me: string; icon: string },
) => {
    // Former series overview URLs redirect to the main blog list.
    if (getBlogSeries(key))
        return {
            title: site.me,
            alternates: { canonical: '/blog' },
            robots: { index: false, follow: true },
        };
    const blog = getBlogMetadata(key);

    if (!blog) return { title: site.me };

    const published = isReadable(blog);
    const generatedImage = `/api/og?${new URLSearchParams({
        title: blog.title,
        description: blog.summary,
        type: 'article',
        v: '2',
    })}`;
    const socialImage = blog.coverImage
        ? `/api/blog-image/${key}?v=2`
        : generatedImage;
    const canonicalUrl = `/blog/${key}`;

    return {
        title: `${blog.title} | ${site.me}`,
        description: blog.summary,
        alternates: { canonical: canonicalUrl },
        authors: [{ name: site.me }],
        icons: { icon: site.icon },
        openGraph: {
            type: 'article' as const,
            title: blog.title,
            description: blog.summary,
            url: canonicalUrl,
            siteName: site.me,
            locale: 'en_US',
            publishedTime: blog.publishedOn,
            images: [
                {
                    url: socialImage,
                    width: 1200,
                    height: 630,
                    type: blog.coverImage ? 'image/jpeg' : 'image/png',
                    alt: blog.coverImage?.alt ?? `${blog.title} article cover`,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image' as const,
            title: blog.title,
            description: blog.summary,
            images: [socialImage],
        },
        robots: published
            ? undefined
            : {
                  index: false,
                  follow: false,
                  googleBot: { index: false, follow: false },
              },
    };
};
