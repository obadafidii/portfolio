import { notFound, redirect } from 'next/navigation';
import { PostView } from '@/components/ui/blog/PostView';
import {
    buildPostMetadata,
    getAllPosts,
    getBlogMetadata,
    getBlogSeries,
} from '@/lib/blogs';
import info from '@/misc/info';

type Props = { params: Promise<{ slug: string[] }> };

export function generateStaticParams() {
    return getAllPosts().map(post => ({ slug: post.slug.split('/') }));
}

export async function generateMetadata({ params }: Props) {
    const key = (await params).slug.join('/');
    return buildPostMetadata(key, { me: info.me, icon: '/icon.svg' });
}

export default async function BlogPost({ params }: Props) {
    const key = (await params).slug.join('/');
    if (getBlogSeries(key)) redirect('/blog');
    if (!getBlogMetadata(key)) notFound();
    return <PostView key={key} postKey={key} />;
}
