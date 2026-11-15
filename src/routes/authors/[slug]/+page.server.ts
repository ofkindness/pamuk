import { authors, getAuthor, postsByAuthor, summary } from '#lib/content/index.ts';
import { error } from '@sveltejs/kit';
import type { EntryGenerator } from './$types';

export const entries: EntryGenerator = () => authors.map((author) => ({ slug: author.slug }));

export function load({ params }) {
	const author = getAuthor(params.slug);
	if (!author) error(404, 'Author not found');
	return {
		author: {
			slug: author.slug,
			name: author.name,
			avatar: author.avatar,
			avatarSize: author.avatarSize,
			links: author.links,
			html: author.html
		},
		posts: postsByAuthor(author.slug).map(summary)
	};
}
