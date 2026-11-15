import { getPost, posts } from '#lib/content/index.ts';
import { contentType } from '#lib/server/site-files.ts';
import { error } from '@sveltejs/kit';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { EntryGenerator, RequestHandler } from './$types';

// Files beside a post's index.md are published next to the post,
// so `![](diagram.png)` in Markdown resolves on the page.
export const prerender = true;

export const entries: EntryGenerator = () =>
	posts.flatMap((post) => post.assets.map((file) => ({ slug: post.slug, file })));

export const GET: RequestHandler = async ({ params }) => {
	const post = getPost(params.slug);
	if (!post?.directory || !post.assets.includes(params.file)) error(404, 'Not found');

	const bytes = await readFile(path.join(__SITE_DIR__, 'content', post.directory, params.file));
	return new Response(bytes, { headers: { 'content-type': contentType(params.file) } });
};
