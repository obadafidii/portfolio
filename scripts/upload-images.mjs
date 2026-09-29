import { mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { v2 as cloudinary } from 'cloudinary';

const projectRoot = path.resolve(import.meta.dirname, '..');
const imageRoot = path.join(projectRoot, 'local-images', 'blog');
const folder = process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER || 'portfolio/blog';
const dryRun = process.argv.includes('--dry-run');
const supportedExtensions = new Set([
    '.avif',
    '.gif',
    '.jpeg',
    '.jpg',
    '.png',
    '.svg',
    '.webp',
]);

async function findImages(directory) {
    const images = [];
    for (const entry of await readdir(directory, { withFileTypes: true })) {
        const filename = path.join(directory, entry.name);
        if (entry.isDirectory()) images.push(...(await findImages(filename)));
        else if (
            supportedExtensions.has(path.extname(entry.name).toLowerCase())
        )
            images.push(filename);
    }
    return images.sort();
}

const publicIdFor = filename => {
    const relative = path
        .relative(imageRoot, filename)
        .split(path.sep)
        .join('/');
    return `${folder}/${relative.replace(/\.[a-z0-9]+$/i, '')}`;
};

await mkdir(imageRoot, { recursive: true });
const images = await findImages(imageRoot);
if (!images.length) {
    console.log(
        'Add source images to local-images/blog, then run this command again.',
    );
    process.exit(0);
}

if (dryRun) {
    for (const filename of images) {
        console.log(
            `${path.relative(projectRoot, filename)} -> ${publicIdFor(filename)}`,
        );
    }
    console.log(`Dry run complete: ${images.length} images.`);
    process.exit(0);
}

const config = cloudinary.config({ secure: true });
if (!config.cloud_name || !config.api_key || !config.api_secret) {
    throw new Error(
        'Set CLOUDINARY_URL in .env.local before uploading images.',
    );
}

for (const [index, filename] of images.entries()) {
    const publicId = publicIdFor(filename);
    const result = await cloudinary.uploader.upload(filename, {
        public_id: publicId,
        resource_type: 'image',
        overwrite: true,
        invalidate: true,
        unique_filename: false,
        use_filename: false,
        tags: ['portfolio', 'blog'],
    });
    console.log(
        `[${index + 1}/${images.length}] ${publicId} -> ${result.secure_url}`,
    );
}

console.log(`Uploaded ${images.length} images to Cloudinary.`);
