export type BlogStatus = 'done' | 'in-progress' | 'draft';

export interface BlogMetadata {
    title: string;
    summary: string;
    publishedOn: string;
    year: string;
    slug: string;
    tags: string[];
    status: BlogStatus;
    series?: string;
    part?: number;
    partCount?: number;
    publishedParts?: number;
    coverImage?: {
        src: string;
        alt: string;
    };
}

export interface BlogSeries extends BlogMetadata {
    parts: string[];
    partCount: number;
    publishedParts: number;
}

export interface Blog {
    metadata: BlogMetadata;
    content: string;
}
