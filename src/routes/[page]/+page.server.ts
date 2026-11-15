import { getPage, pages } from '#lib/content/index.ts';
import { error } from '@sveltejs/kit';
import type { EntryGenerator } from './$types';

export const entries: EntryGenerator = () => pages.map((page) => ({ page: page.slug }));

export function load({ params }) {
	const page = getPage(params.page);
	if (!page) error(404, 'Page not found');
	return { page: { slug: page.slug, title: page.title, description: page.description, html: page.html } };
}
