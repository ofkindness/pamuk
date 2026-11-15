import { postsByCategory, summary, usedCategories } from '#lib/content/index.ts';
import { error } from '@sveltejs/kit';
import type { EntryGenerator } from './$types';

export const entries: EntryGenerator = () => usedCategories.map((category) => ({ category: category.slug }));

export function load({ params }) {
	const term = usedCategories.find((category) => category.slug === params.category);
	if (!term) error(404, 'Category not found');
	return { term, posts: postsByCategory(term.slug).map(summary) };
}
