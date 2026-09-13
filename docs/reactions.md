# Shared blog reactions

Published posts have Like and Love controls. A reader can choose one, switch it,
or tap it again to remove it. Totals are shared through Redis and survive app
restarts and deployments. A signed, HTTP-only cookie remembers a browser for one
year. Clearing cookies or using another browser creates a new reader identity;
this is anonymous feedback, not authenticated voting.

## Storage

The `portfolio` Vercel project is connected to the `portfolio-reactions` Upstash
Redis database. It uses the free plan with eviction and automatic paid upgrades
disabled. The integration supplies these **server-only** environment variables:

```dotenv
KV_REST_API_URL=<managed by Vercel>
KV_REST_API_TOKEN=<managed by Vercel>
REACTIONS_COOKIE_SECRET=<managed by Vercel>
```

The variables are connected to production, preview, and development. The cookie
secret is independent of the Redis token so rotating database credentials does
not invalidate reader identities. Never prefix these values with `NEXT_PUBLIC_`.

On a fresh clone, run `vercel link --yes --project portfolio` followed by
`vercel env pull .env.local --yes`. The saved CLI login and project link avoid
repeating browser authentication during normal development.

Without storage, the controls show an unavailable message and the API returns
503. It never substitutes local counts or displays invented totals.

## Behavior and verification

`GET /api/reactions/log/part-2-databases` returns `{ like, love, selected }` and
sets the reader cookie. Same-origin `PUT` accepts `{ "reaction": "like" }`,
`{ "reaction": "love" }`, or `{ "reaction": null }`. Only published post keys
are accepted. Responses are never cached. Redis Lua updates totals and the
reader's selection atomically; retrying the same selection does not add a vote.
Each reader is limited to 60 update requests per article per minute.

Run `npm run test:reactions` for API validation, identity and storage-response
tests. The live database was also verified with two independent reader cookies:
Like and Love produced shared totals, switching moved the count atomically, and
undoing both reactions returned the totals to zero.
The implementation does not poll: totals refresh on page load, reaction changes,
and when returning to a backgrounded article.

Redis keys use the prefix `blog:reactions:{post-key}`. Local development and
production currently share this database, so clean up test reactions after an
end-to-end check. Keep eviction disabled so counts and reader records persist.
