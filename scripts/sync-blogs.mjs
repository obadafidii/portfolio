import { fileURLToPath } from 'node:url';
import { generateBlogContent } from './blog-content.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const { posts, series } = await generateBlogContent(root);
console.log(
    `Blog synced: ${Object.keys(posts).length} articles, ${Object.keys(series).length} series.`,
);
