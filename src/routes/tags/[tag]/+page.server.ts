import { postsByTag, summary, usedTags } from '#lib/content/index.ts';
import { error } from '@sveltejs/kit';
import type { EntryGenerator } from './$types';

export const entries: EntryGenerator = () => usedTags.map((tag) => ({ tag: tag.slug }));

export function load({ params }) {
	const term = usedTags.find((tag) => tag.slug === params.tag);
	if (!term) error(404, 'Tag not found');
	return { term, posts: postsByTag(term.slug).map(summary) };
}
