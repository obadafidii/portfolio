import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createProcessor } from '@mdx-js/mdx';

// Read literal metadata without evaluating imports or running article code.
function literal(node) {
    if (node?.type === 'Literal') return node.value;
    if (node?.type === 'ArrayExpression') return node.elements.map(literal);
    if (node?.type === 'ObjectExpression') {
        return Object.fromEntries(
            node.properties.map(property => {
                if (
                    property.type !== 'Property' ||
                    property.computed ||
                    property.method ||
                    property.shorthand
                ) {
                    throw new Error(
                        'Post metadata must contain plain literal values',
                    );
                }
                return [
                    property.key.name ?? property.key.value,
                    literal(property.value),
                ];
            }),
        );
    }
    throw new Error('Post metadata must contain plain literal values');
}

export function readPostMetadata(source, filename) {
    const tree = createProcessor().parse(source);
    for (const block of tree.children) {
        if (block.type !== 'mdxjsEsm') continue;
        for (const statement of block.data.estree.body) {
            if (statement.type !== 'ExportNamedDeclaration') continue;
            const declaration = statement.declaration?.declarations?.find(
                item => item.id.name === 'post',
            );
            if (declaration) return literal(declaration.init);
        }
    }
    throw new Error(`${filename}: missing export const post = { ... }`);
}

function validate(meta, filename, series = false) {
    for (const field of ['title', 'summary', 'publishedOn']) {
        if (typeof meta[field] !== 'string' || !meta[field].trim()) {
            throw new Error(`${filename}: ${field} is required`);
        }
    }
    if (!Number.isFinite(Date.parse(meta.publishedOn)))
        throw new Error(`${filename}: invalid publishedOn date`);
    if (
        !Array.isArray(meta.tags) ||
        !meta.tags.every(tag => typeof tag === 'string')
    ) {
        throw new Error(`${filename}: tags must be an array of strings`);
    }
    if (!series && !['draft', 'in-progress', 'done'].includes(meta.status)) {
        throw new Error(
            `${filename}: status must be draft, in-progress or done`,
        );
    }
    if (
        meta.coverImage &&
        (typeof meta.coverImage.src !== 'string' ||
            typeof meta.coverImage.alt !== 'string')
    ) {
        throw new Error(`${filename}: coverImage needs src and alt`);
    }
}

export async function readCatalog(contentRoot) {
    const posts = {};
    const series = {};
    const sources = {};
    const folders = (await readdir(contentRoot, { withFileTypes: true }))
        .filter(entry => entry.isDirectory())
        .sort((a, b) => a.name.localeCompare(b.name));

    for (const folder of folders) {
        if (!/^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$/.test(folder.name)) {
            throw new Error(`${folder.name}: use a URL-safe folder name`);
        }
        const directory = path.join(contentRoot, folder.name);
        const files = (await readdir(directory)).sort();
        const group = files.includes('series.json')
            ? JSON.parse(
                  await readFile(path.join(directory, 'series.json'), 'utf8'),
              )
            : undefined;
        if (group) validate(group, `${folder.name}/series.json`, true);
        const mdxFiles = files.filter(file => file.endsWith('.mdx'));
        if (
            !mdxFiles.length ||
            (!group && (mdxFiles.length !== 1 || mdxFiles[0] !== 'post.mdx'))
        ) {
            throw new Error(
                `${folder.name}: use post.mdx for an article or series.json with MDX parts for a series`,
            );
        }
        const parts = [];
        for (const file of mdxFiles) {
            const filename = `${folder.name}/${file}`;
            const name = file.slice(0, -4);
            if (!/^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$/.test(name))
                throw new Error(`${filename}: use a URL-safe filename`);
            const raw = readPostMetadata(
                await readFile(path.join(directory, file), 'utf8'),
                filename,
            );
            const meta = { ...raw, tags: raw.tags ?? group?.tags };
            validate(meta, filename);
            if (group && (!Number.isInteger(meta.part) || meta.part < 1)) {
                throw new Error(`${filename}: part must be a positive integer`);
            }
            const key = group ? `${folder.name}/${name}` : folder.name;
            posts[key] = {
                title: meta.title,
                summary: meta.summary,
                publishedOn: meta.publishedOn,
                year: String(new Date(meta.publishedOn).getUTCFullYear()),
                slug: key,
                tags: meta.tags,
                status: meta.status,
                ...(meta.coverImage ? { coverImage: meta.coverImage } : {}),
                ...(group ? { series: folder.name, part: meta.part } : {}),
            };
            sources[key] = filename;
            parts.push(key);
        }
        if (group) {
            parts.sort((a, b) => posts[a].part - posts[b].part);
            if (
                new Set(parts.map(key => posts[key].part)).size !== parts.length
            ) {
                throw new Error(`${folder.name}: duplicate part numbers`);
            }
            const publishedParts = parts.filter(
                key => posts[key].status === 'done',
            ).length;
            series[folder.name] = {
                title: group.title,
                summary: group.summary,
                publishedOn: group.publishedOn,
                year: String(new Date(group.publishedOn).getUTCFullYear()),
                slug: folder.name,
                tags: [
                    ...new Set([
                        ...group.tags,
                        ...parts.flatMap(key => posts[key].tags),
                    ]),
                ],
                status:
                    publishedParts === parts.length
                        ? 'done'
                        : parts.every(key => posts[key].status === 'draft')
                          ? 'draft'
                          : 'in-progress',
                ...(group.coverImage ? { coverImage: group.coverImage } : {}),
                parts,
                partCount: parts.length,
                publishedParts,
            };
        }
    }
    return { posts, series, sources };
}

async function writeIfChanged(filename, value) {
    const existing = await readFile(filename, 'utf8').catch(error => {
        if (error.code !== 'ENOENT') throw error;
        return undefined;
    });
    if (existing === value) return;
    await mkdir(path.dirname(filename), { recursive: true });
    await writeFile(filename, value);
}

export async function generateBlogContent(root) {
    const catalog = await readCatalog(path.join(root, 'content/blog'));
    const header =
        '// Generated from content/blog. Edit the writing files, then run npm run blog:sync.\n';
    await writeIfChanged(
        path.join(root, 'meta/blog.generated.ts'),
        header +
            "import type { BlogMetadata, BlogSeries } from '@/types/blog.type';\n\n" +
            `export const blogMetadata: Record<string, BlogMetadata> = ${JSON.stringify(catalog.posts, null, 4)};\n\n` +
            `export const blogSeries: Record<string, BlogSeries> = ${JSON.stringify(catalog.series, null, 4)};\n`,
    );

    // Draft bodies never enter the public module graph, including split panes.
    const imports = Object.entries(catalog.sources)
        .filter(([key]) => catalog.posts[key].status === 'done')
        .map(
            ([key, file]) =>
                `    ${JSON.stringify(key)}: dynamic(() => import(${JSON.stringify('@/content/blog/' + file)})),`,
        )
        .join('\n');
    await writeIfChanged(
        path.join(root, 'components/ui/blog/PostContent.generated.tsx'),
        "'use client';\n\n" +
            header +
            "import dynamic from 'next/dynamic';\nimport type { ComponentType } from 'react';\n\n" +
            `const content: Record<string, ComponentType> = {\n${imports}\n};\n\n` +
            'export function PostContent({ postKey }: { postKey: string }) {\n' +
            '    const Content = content[postKey];\n    return Content ? <Content /> : null;\n}\n',
    );
    return catalog;
}

export class BlogContentPlugin {
    constructor(root) {
        this.root = root;
    }

    apply(compiler) {
        compiler.hooks.beforeCompile.tapPromise('BlogContent', () =>
            generateBlogContent(this.root),
        );
        compiler.hooks.afterCompile.tapPromise(
            'BlogContent',
            async compilation => {
                const directory = path.join(this.root, 'content/blog');
                compilation.contextDependencies.add(directory);
                for (const folder of await readdir(directory, {
                    withFileTypes: true,
                })) {
                    if (!folder.isDirectory()) continue;
                    const parent = path.join(directory, folder.name);
                    compilation.contextDependencies.add(parent);
                    for (const file of await readdir(parent)) {
                        compilation.fileDependencies.add(
                            path.join(parent, file),
                        );
                    }
                }
            },
        );
    }
}
