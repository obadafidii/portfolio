'use client';

// Generated from content/blog. Edit the writing files, then run npm run blog:sync.
import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';

const content: Record<string, ComponentType> = {
    "busy-waiting": dynamic(() => import("@/content/blog/busy-waiting/post.mdx")),
    "cpu-pipelining": dynamic(() => import("@/content/blog/cpu-pipelining/post.mdx")),
    "log/part-1-introduction": dynamic(() => import("@/content/blog/log/part-1-introduction.mdx")),
    "log/part-2-databases": dynamic(() => import("@/content/blog/log/part-2-databases.mdx")),
};

export function PostContent({ postKey }: { postKey: string }) {
    const Content = content[postKey];
    return Content ? <Content /> : null;
}
