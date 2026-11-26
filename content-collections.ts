import { defineCollection, defineConfig } from '@content-collections/core';
import { readdirSync } from 'node:fs';
import path from 'node:path';
import { root, siteDir } from './scripts/site.ts';
import { parsePostPath } from './src/lib/content/files.ts';
import { authorSchema, pageSchema, postSchema } from './src/lib/content/schema.ts';
import { measureImage } from './src/lib/markdown/images.ts';
import { readingTime, renderMarkdown } from './src/lib/markdown/render.ts';

const site = siteDir();
const contentDir = path.join(site, 'content');
const staticDir = path.join(site, 'static');
// content-collections joins collection folders onto the config's folder, so they must be relative.
const collectionDir = path.relative(root, contentDir);

const isRemote = (src: string) => /^([a-z][a-z0-9+.-]*:|\/\/)/i.test(src);

/** Finds an image on disk: root-relative ones in the site's static folder, others beside the document. */
function imageResolver(documentDir?: string) {
	return (src: string) => {
		if (isRemote(src)) return undefined;
		const clean = decodeURI(src.split(/[?#]/)[0]);
		if (clean.startsWith('/')) return path.join(staticDir, clean);
		return documentDir ? path.join(documentDir, clean) : undefined;
	};
}

/** Size of a local image named in frontmatter; fails the build when the file is missing. */
function frontmatterImage(src: string | undefined, documentDir?: string) {
	if (!src) return undefined;
	const filePath = imageResolver(documentDir)(src);
	if (!filePath) return undefined;
	const { width, height } = measureImage(filePath, src);
	return width && height ? { width, height } : undefined;
}

const posts = defineCollection({
	name: 'posts',
	directory: collectionDir,
	include: ['posts/*.md', 'posts/*/index.md', 'drafts/*.md', 'drafts/*/index.md'],
	schema: postSchema,
	transform: async ({ content, _meta, ...data }) => {
		const file = parsePostPath(_meta.filePath);
		const directory = file.directory ? path.join(contentDir, file.directory) : undefined;
		const rendered = await renderMarkdown(content, imageResolver(directory));
		frontmatterImage(data.image, directory);
		const coverSize = frontmatterImage(data.book?.cover, directory);
		// Everything beside index.md is published next to the post.
		const assets = directory
			? readdirSync(directory, { withFileTypes: true })
					.filter((entry) => entry.isFile() && entry.name !== 'index.md' && !entry.name.startsWith('.'))
					.map((entry) => entry.name)
					.sort()
			: [];
		return {
			...data,
			slug: file.slug,
			datePrefix: file.datePrefix,
			draft: data.draft || file.fromDrafts,
			source: _meta.filePath,
			directory: file.directory,
			assets,
			coverSize,
			hasCode: rendered.html.includes('<pre'),
			html: rendered.html,
			headings: rendered.headings,
			readingTime: readingTime(rendered.words)
		};
	}
});

const authors = defineCollection({
	name: 'authors',
	directory: collectionDir,
	include: 'authors/*.md',
	schema: authorSchema,
	transform: async ({ content, _meta, ...data }) => ({
		...data,
		slug: path.basename(_meta.filePath, '.md'),
		avatarSize: frontmatterImage(data.avatar),
		html: (await renderMarkdown(content, imageResolver())).html
	})
});

const pages = defineCollection({
	name: 'pages',
	directory: collectionDir,
	include: 'pages/*.md',
	schema: pageSchema,
	transform: async ({ content, _meta, ...data }) => ({
		...data,
		slug: path.basename(_meta.filePath, '.md'),
		html: (await renderMarkdown(content, imageResolver())).html
	})
});

export default defineConfig({
	content: [posts, authors, pages],
	// Rendering depends on files outside the document (images, the pipeline itself),
	// so results are not kept between runs.
	cache: 'none'
});
