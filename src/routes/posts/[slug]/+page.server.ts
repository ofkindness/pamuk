import { authorOf, getPost, posts, site, usedTags, usedCategories } from '#lib/content/index.ts';
import { error } from '@sveltejs/kit';
import type { EntryGenerator } from './$types';

export const entries: EntryGenerator = () => posts.map((post) => ({ slug: post.slug }));

export function load({ params }) {
	const post = getPost(params.slug);
	if (!post) error(404, 'Post not found');

	const author = authorOf(post);
	const index = posts.indexOf(post);
	const link = (p?: (typeof posts)[number]) => p && { slug: p.slug, title: p.title };

	return {
		post: {
			slug: post.slug,
			title: post.title,
			description: post.description,
			date: post.date,
			updated: post.updated,
			lang: post.lang ?? site.language,
			draft: post.draft,
			image: post.image,
			canonical: post.canonical,
			discussion: post.discussion,
			book: post.book,
			coverSize: post.coverSize,
			hasCode: post.hasCode,
			html: post.html,
			headings: post.headings,
			readingTime: post.readingTime
		},
		author: { slug: author.slug, name: author.name, links: author.links },
		category: usedCategories.find((category) => category.slug === post.category),
		tags: usedTags.filter((tag) => post.tags.includes(tag.slug)),
		newer: link(posts[index - 1]),
		older: link(posts[index + 1])
	};
}
