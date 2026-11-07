import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Works',
    description:
        'Production systems and from-scratch builds: a Solana trading data pipeline, a Redis-compatible cache server, a DNS server and more.',
    alternates: { canonical: '/works' },
};

export default function WorksLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
