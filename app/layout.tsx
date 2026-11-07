import type { Metadata } from 'next';
import { Fira_Code, IBM_Plex_Mono, Manrope } from 'next/font/google';
import './globals.css';
import info from '@/misc/info';
import { ThemeProvider } from 'next-themes';
import ogImageUrl from '@/misc/og';
import { Analytics } from '@vercel/analytics/next';
import { SplitWorkspaceProvider } from '@/components/layout/SplitWorkspaceProvider';
import { MusicProvider } from '@/components/ui/music/MusicProvider';
import { getTracks } from '@/lib/music';

const sans = Manrope({
    variable: '--font-sans',
    subsets: ['latin'],
    preload: false,
});

const mono = IBM_Plex_Mono({
    variable: '--font-mono',
    subsets: ['latin'],
    weight: ['400', '500', '600'],
});

const code = Fira_Code({
    variable: '--font-code',
    subsets: ['latin'],
    weight: ['400', '500', '600'],
    preload: false,
});

export const metadata: Metadata = {
    title: {
        default: `${info.name} · ${info.role}`,
        template: `%s · ${info.name}`,
    },
    description: info.description,
    authors: [{ name: info.name, url: info.url }],
    icons: {
        shortcut: info.shortcutIcon,
    },
    openGraph: {
        type: 'website',
        locale: 'en_US',
        title: `${info.name} · ${info.role}`,
        siteName: info.name,
        description: info.description,
        url: info.url,
        images: [
            {
                url: ogImageUrl.toString(),
                width: 1200,
                height: 630,
                alt: `${info.name}, ${info.role.toLowerCase()}`,
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: `${info.name} · ${info.role}`,
        description: info.description,
        images: [ogImageUrl.toString()],
    },
    metadataBase: new URL(info.url),
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            suppressHydrationWarning
            className={`${sans.variable} ${mono.variable} ${code.variable}`}
        >
            <body className="antialiased">
                <ThemeProvider
                    attribute="data-theme"
                    defaultTheme="dark"
                    enableSystem={false}
                >
                    <MusicProvider tracks={getTracks()}>
                        <SplitWorkspaceProvider>
                            {children}
                        </SplitWorkspaceProvider>
                    </MusicProvider>
                </ThemeProvider>
                <Analytics />
            </body>
        </html>
    );
}
