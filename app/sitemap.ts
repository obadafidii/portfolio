// Generate site map
import { getReadablePosts } from '@/lib/blogs';
import info from '@/misc/info';

export default async function sitemap() {
    const routes = ['/', '/works', '/contact', '/blog', '/open-source', '/resume'].map(route => ({
        url: `${info.url}${route}`,
        lastModified: new Date().toISOString().split('T')[0],
    }));

    const posts = getReadablePosts().map(post => ({
        url: `${info.url}/blog/${post.slug}`,
        lastModified: new Date(post.publishedOn).toISOString().split('T')[0],
    }));

    return [...routes, ...posts];
}
