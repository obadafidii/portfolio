import { NextResponse } from 'next/server';
import { savedContributions, type Contribution } from '@/content/contributions';

const USERNAME = 'obadafidii';
const CACHE_HEADERS = {
    'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
};

type GitHubIssue = {
    title: string;
    html_url: string;
    created_at: string;
    state: 'open' | 'closed';
    repository_url: string;
    body?: string | null;
    pull_request?: { merged_at?: string | null; draft?: boolean };
};

const descriptionFrom = (body?: string | null) => {
    const paragraphs = (body ?? '')
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .split(/\n\s*\n/)
        .map(part => part.replace(/^#{1,6}\s*/gm, '').trim())
        .filter(
            part =>
                part.length >= 35 &&
                !/^(description|summary|checklist|testing|related issues|linked issue):?$/i.test(
                    part,
                ) &&
                !/^thank you\b/i.test(part),
        );
    const prose = paragraphs.find(part => !/^[-*]\s*\[[ xX]\]/.test(part));
    return prose?.replace(/\s+/g, ' ').slice(0, 500) || undefined;
};

export async function GET() {
    const query = new URLSearchParams({
        q: `author:${USERNAME} type:pr`,
        sort: 'created',
        order: 'desc',
        per_page: '100',
    });

    try {
        const response = await fetch(
            `https://api.github.com/search/issues?${query}`,
            {
                headers: {
                    Accept: 'application/vnd.github+json',
                    'X-GitHub-Api-Version': '2022-11-28',
                    ...(process.env.GITHUB_TOKEN
                        ? {
                              Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
                          }
                        : {}),
                },
                next: { revalidate: 3600 },
            },
        );
        if (!response.ok) throw new Error(`GitHub returned ${response.status}`);

        const data = (await response.json()) as { items?: GitHubIssue[] };
        const items: Contribution[] = (data.items ?? [])
            .filter(item => item.pull_request)
            .map<Contribution>(item => ({
                title: item.title,
                url: item.html_url,
                date: item.created_at.slice(0, 10),
                repository: item.repository_url.split('/repos/')[1] ?? '',
                description: descriptionFrom(item.body),
                status: item.pull_request?.merged_at
                    ? 'merged'
                    : item.state === 'open'
                      ? 'open'
                      : 'closed',
            }))
            .filter(
                item =>
                    item.repository &&
                    item.repository.split('/')[0].toLowerCase() !== USERNAME,
            );

        const byUrl = new Map(savedContributions.map(item => [item.url, item]));
        items.forEach(item => byUrl.set(item.url, item));
        return NextResponse.json(
            {
                items: [...byUrl.values()].sort((a, b) =>
                    b.date.localeCompare(a.date),
                ),
                source: 'github',
            },
            { headers: CACHE_HEADERS },
        );
    } catch {
        return NextResponse.json(
            {
                items: savedContributions,
                source: 'saved',
                notice: 'Showing saved contributions while GitHub is unavailable.',
            },
            { headers: CACHE_HEADERS },
        );
    }
}
