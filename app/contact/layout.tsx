import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Contact',
    description:
        'Get in touch with David Dada about backend, distributed systems or infrastructure work.',
    alternates: { canonical: '/contact' },
};

export default function ContactLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
