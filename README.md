## David Dada's Website

### Music

The status bar's music button and the terminal commands `play`, `pause` and
`next` control an audio-only player. There is no visible player or video.
Playback continues across client-side navigation and split panes, and nothing
downloads until a visitor presses play.

Drop audio files (mp3, ogg, m4a, wav, opus) into `public/music/`. Every file
becomes a track, played in filename order and looped. Prefix names with numbers
to set the order, for example `01-desert-mystic.mp3`; the title shown in the
status bar comes from the filename. The files are served from this site, so
only use tracks you have the rights to publish (CC0 or similar).

While music plays, a faint carved frieze drifts along the bottom of the window
and walks through history as the track plays. Each era gets an equal share of
the song: ancient Egypt, classical Greece, Rome, Tang China, the Mali Empire,
the industrial age, today (a booster landing on a drone ship) and the future
in space. As each era's time runs out, the next civilization walks in from
the right and pushes it off to the left. The frieze fades out when the music stops and stays still
for visitors who prefer reduced motion.

The frieze lives in `components/ui/music/Frieze.tsx`, with one file per era in
`components/ui/music/frieze/` and the order in `frieze/eras.ts`.

### GitHub comments

Published blog posts render a Giscus comment thread after the reaction buttons.
Each discussion uses a stable `blog:<slug>` key, so it also works when a post is
opened inside a split pane. The widget follows the site's light or dark theme.

Giscus is connected to the repository's `General` discussion category. The
public repository and category identifiers live in
`components/ui/blog/GitHubComments.tsx`; environment variables can override the
category values if the discussion category changes. Allowed production and
localhost origins are restricted in `giscus.json`. The custom light and dark
stylesheets in `public/giscus-*.css` match the terminal palette. Giscus loads
them from the site's own origin, so theme changes follow the site toggle. The
blog's existing Like/Love buttons and GitHub discussion reactions are separate
totals. On HTTP localhost, the widget uses Giscus's built-in themes because an
HTTPS iframe cannot fetch a custom stylesheet over HTTP.

### Open source archive

`/open-source` loads public pull requests authored by `obadafidii` from GitHub,
groups them by year and month, and excludes repositories owned by that account.
The GitHub response is cached for one hour. Set `GITHUB_TOKEN` on the server for
a higher API rate limit; the token is never sent to the browser.

The verified entries in `content/contributions.ts` remain visible if GitHub is
unavailable. Add an entry to `contributionNotes` using the exact PR URL to write
the “what changed” and “why it matters” explanation. Optional `learned` and
`article` fields add a personal note and a link to a longer blog post. PRs
without editorial notes show their public GitHub description when available.

On the archive, `/` focuses search, Up/Down moves through focused PR rows,
Enter opens a PR, and Escape clears search. The same controls work by click or
tap.

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

### Blog images on Cloudinary

Article source files use versioned Cloudinary delivery URLs. The shared image
component adds responsive widths plus automatic format and quality selection,
and cover-image social previews are transformed from the same assets.

Copy the Cloudinary variables from `.env.example` into `.env.local`. Get
`CLOUDINARY_URL` from the API Keys page in the Cloudinary console and never
commit it or expose the API secret through a `NEXT_PUBLIC_` variable. Add the
same variables to the production deployment environment.

Keep image originals in `local-images/blog`, which is ignored by Git and sits
outside `public` so originals are not included in deployments. The upload command
creates this directory when needed; a fresh clone contains no original images.

Run `npm run images:upload:dry-run` to inspect the local-to-Cloudinary mapping,
then run `npm run images:upload` to upload or replace the images in that directory.
Assets use stable IDs under `portfolio/blog`, so rerunning the command updates
them without creating duplicates. Copy the returned versioned URLs into article
sources and cover metadata. Verify those URLs before removing your local copies.

The unused former avatar is archived locally in `local-images/unused`; it is not
included in blog uploads. Keep public images out of the repository; the site's
favicon remains in `app/icon.svg`. Removing tracked images does not remove their
copies from older Git commits.
