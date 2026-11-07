import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Open source',
    description:
        'Pull requests merged into other projects, including LLVM, with notes on what changed and why.',
};

export default function OpenSourceLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
