## David Dada's Website

### Writing a blog

Writing lives in `content/blog`. The site discovers articles and series
automatically when you run `npm run dev` or `npm run build`, including changes
while the development server is running. There is no manual post registry or
split-pane registration.

For a standalone article, create `content/blog/my-article/post.mdx`:

```mdx
export const post = {
    title: 'My article',
    summary: 'What this article covers.',
    publishedOn: '2026-09-03T09:00:00.000Z',
    tags: ['systems'],
    status: 'draft',
};

# My article

Start writing here. MDX components and imports work as before.
```

This creates `/blog/my-article`. Use plain literal values in `post`; metadata
cannot call functions or reference imported variables.
`coverImage: { src, alt }` is optional. The folder determines the URL, and the
date determines the year.

### Writing a series

Your four-part article is in `content/blog/log`:

```text
log/
├── series.json
├── part-1-introduction.mdx
├── part-2-databases.mdx
├── part-3-version-control.mdx
└── part-4-distributed-systems.mdx
```

`series.json` contains the shared title, summary, date, and tags:

```json
{
    "title": "Understanding Log",
    "summary": "An introduction to logs and their uses.",
    "publishedOn": "2026-09-03T00:00:00.000Z",
    "tags": ["logs", "databases"]
}
```

Each MDX part has the same `post` block as a standalone article, plus a unique
positive `part` number. Parts inherit the series tags unless they define their
own. Reading navigation follows ascending `part` numbers, so filenames can
remain descriptive. The main blog list shows newest dates first; parts with the
same date appear in reverse part order (4, 3, 2, 1).

Every part appears as its own row on `/blog`, alongside the other articles, with
a part number and its individual publication status. Each row links straight to
its part, such as `/blog/log/part-1-introduction`. There is no separate series
overview; the old `/blog/log` URL redirects to `/blog`. Previous/next links,
sharing URLs, the sitemap, and split panes update automatically. To add another
part, add an MDX file with its metadata; no other code needs editing. Keep
filenames stable after publishing to preserve links.

### Publishing

- `draft`: displays the outline/status notice; the article body is not shipped.
- `in-progress`: displays the writing-in-progress notice; the body is not
  shipped.
- `done`: publishes that individual article or part.

You can publish one part while continuing to write the others. Unpublished parts
remain visible in the main blog list with their status, and open a notice.
Drafts are marked `noindex`; the sitemap includes published articles and parts.
`publishedOn` is a display date, not a scheduled release.

Metadata validation runs before the site compiles. Fix any reported missing
fields, invalid dates/statuses, or duplicate part numbers in the content files.

`npm run blog:sync` refreshes generated files without starting the site.
`npm run test:blog` checks discovery, ordering, publication rules, and URL
metadata. Do not edit `meta/blog.generated.ts` or `PostContent.generated.tsx`
manually.
