import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Open Source Contributions | David Dada',
    description:
        'Public open source pull requests and notes on what changed and why.',
};

export default function OpenSourceLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
