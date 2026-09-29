/** Add editorial notes by PR URL. GitHub supplies dates, titles, and status. */
export type Contribution = {
    title: string;
    url: string;
    date: string;
    repository: string;
    status: 'merged' | 'open' | 'closed';
    description?: string;
};

/** Verified PRs remain visible when GitHub's public search is rate limited. */
export const savedContributions: Contribution[] = [
    {
        title: 'Feat: Add empty json output mode',
        url: 'https://github.com/It4innovations/hyperqueue/pull/844',
        date: '2025-03-08',
        repository: 'It4innovations/hyperqueue',
        status: 'merged',
    },
    {
        title: '#437: feat: add test for abort command',
        url: 'https://github.com/dicedb/dicedb/pull/531',
        date: '2024-09-11',
        repository: 'dicedb/dicedb',
        status: 'merged',
    },
];

export const contributionNotes: Record<
    string,
    { changed: string; why: string; learned?: string; article?: string }
> = {
    'https://github.com/It4innovations/hyperqueue/pull/844': {
        changed:
            'Improved structured JSON output and added regression coverage.',
        why: 'Reliable machine-readable output makes HyperQueue easier to use from other tools.',
    },
    'https://github.com/dicedb/dicedb/pull/531': {
        changed: 'Added a test for the ABORT command.',
        why: 'A regression test helps keep transaction behavior stable as DiceDB changes.',
    },
};
