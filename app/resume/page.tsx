import type { Metadata } from 'next';

import { ManPage } from '@/components/ui/resume/ManPage';
import { getResume } from '@/lib/resume';
import { inlineToText } from '@/lib/resume';
import info from '@/misc/info';

const resume = getResume();

const description =
    inlineToText(resume.tagline) ||
    'Backend and systems engineer. Experience, projects and skills.';

export const metadata: Metadata = {
    title: 'Resume',
    description,
    alternates: {
        canonical: `${info.url}/resume`,
    },
    openGraph: {
        title: `Resume · ${info.name}`,
        description,
        url: `${info.url}/resume`,
        siteName: info.name,
        type: 'profile',
        images: [
            {
                url: '/api/og',
                width: 1200,
                height: 630,
                alt: `Resume · ${info.name}`,
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: `Resume · ${info.name}`,
        description,
        images: ['/api/og'],
    },
};

const ResumePage = () => <ManPage resume={resume} />;

export default ResumePage;
