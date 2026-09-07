'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { TerminalWindow } from '@/components/layout/TerminalWindow';
import { CommandLine } from '@/components/ui/shell/CommandLine';
import { PagerProgress } from './PagerProgress';
import { ShareBar } from './ShareBar';
import { TableOfContents } from './TableOfContents';
import { UnpublishedNotice } from './UnpublishedNotice';
import { PostContent } from './PostContent.generated';
import { PostNavigation } from './PostNavigation';
import { blogStatusLabel, getBlogMetadata, getReadableBlogs, isReadable } from '@/lib/blogs';
import '@/app/code.css';

export function PostView({ postKey }: { postKey: string }) {
    const contentRef = useRef<HTMLDivElement>(null);
    const blog = getBlogMetadata(postKey);
    if (!blog) return <p className="term-err">Article not found.</p>;
    const file = `${postKey}.md`;
    const navigation = <PostNavigation currentKey={postKey} />;

    if (!isReadable(blog)) {
        return (
            <UnpublishedNotice
                key={postKey}
                blog={{ ...blog, slug: postKey }}
                file={file}
                others={getReadableBlogs()}
            >
                {navigation}
            </UnpublishedNotice>
        );
    }

    return (
        <TerminalWindow currentPage="blog" path={`~/writing/${file}`} status={
            <>
                <PagerProgress />
                <Link href="/blog" style={{ color: 'var(--term-blue)' }}>q · back to ~/writing</Link>
            </>
        }>
            <article>
                <header className="pager-head">
                    <span className="ink-faint">{new Date(blog.publishedOn).toISOString().slice(0, 10)}</span>
                    <span style={{ color: 'var(--paper-bright)' }}>{blog.title}</span>
                    <span style={{ color: 'var(--term-green)' }}>
                        [{blogStatusLabel(blog.status)}]
                    </span>
                    <ShareBar title={blog.title} summary={blog.summary} path={`/blog/${postKey}`} />
                    <span className="ink-faint ml-auto hidden text-[11px] sm:inline">{blog.tags.join(' · ')}</span>
                </header>

                {navigation}
                <div className="blog-post-layout">
                    <div ref={contentRef} className="pager-body pager-prose">
                        <PostContent postKey={postKey} />
                    </div>
                    <TableOfContents contentRef={contentRef} />
                </div>
                {navigation}

                <footer className="mt-0 pt-3 text-[12px]">
                    <CommandLine cwd="~/writing" />
                </footer>
            </article>
        </TerminalWindow>
    );
}
