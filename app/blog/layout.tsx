import type { Metadata } from 'next';

import info from '@/misc/info';

export const metadata: Metadata = {
    // Posts below this layout keep the site-wide "Title · David Dada" form.
    title: { default: 'Writing', template: `%s · ${info.name}` },
    description:
        'Notes on how systems work: databases, logs, consensus, CPU pipelining, concurrency and compilers.',
    alternates: { canonical: '/blog' },
};

export default function WritingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
