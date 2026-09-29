import createMDX from '@next/mdx';
import remarkGfm from 'remark-gfm';
import rehypePrettyCode from 'rehype-pretty-code';
import { fileURLToPath } from 'node:url';
import {
    BlogContentPlugin,
    generateBlogContent,
} from './scripts/blog-content.mjs';

const projectRoot = fileURLToPath(new URL('.', import.meta.url));
await generateBlogContent(projectRoot);

/*
 * This file is .mjs on purpose.
 *
 * next.config.ts is transpiled to CommonJS before it runs, and Shiki (which
 * rehype-pretty-code depends on) is pure ESM. On Node 20 a CJS module cannot
 * require() an ESM one, which fails with ERR_REQUIRE_ESM at build time. An
 * ESM config loads both natively.
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        deviceSizes: [360, 640, 750, 828, 1080, 1200, 1600, 1920],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                pathname: '/**/image/upload/**',
            },
        ],
    },
    async headers() {
        return ['dark', 'light'].map(theme => ({
            source: `/giscus-${theme}.css`,
            headers: [{ key: 'Access-Control-Allow-Origin', value: '*' }],
        }));
    },
    pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
    webpack(config) {
        config.plugins.push(new BlogContentPlugin(projectRoot));
        config.module.rules.push({
            test: /\.svg$/,
            issuer: /\.[jt]sx?$/,
            // we need this to import svgs as react components
            use: ['@svgr/webpack'],
        });
        return config;
    },
    reactStrictMode: true,
};

/*
 * Two themes, not one. rehype-pretty-code emits every token twice as
 * --shiki-light / --shiki-dark custom properties, and code.css picks the
 * right one from [data-theme]. That is what makes highlighting follow the
 * theme toggle without shipping a highlighter to the browser.
 */
/** @type {import('rehype-pretty-code').Options} */
const prettyCodeOptions = {
    theme: {
        light: 'github-light',
        dark: 'github-dark',
    },
    keepBackground: false,
    defaultLang: 'plaintext',
};

const withMDX = createMDX({
    options: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [[rehypePrettyCode, prettyCodeOptions]],
    },
});

export default withMDX(nextConfig);
