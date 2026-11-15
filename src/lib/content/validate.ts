import type { SiteConfig } from '../config.ts';
import { isSlug } from './files.ts';

/** Top-level URL segments owned by the app; a page cannot use them as its slug. */
export const RESERVED_SLUGS = [
	'posts',
	'drafts',
	'tags',
	'categories',
	'authors',
	'archive',
	'search',
	'page',
	'og',
	'404',
	'pagefind'
];

export interface PostRef {
	slug: string;
	source: string;
	date: string;
	updated?: string;
	datePrefix?: string;
	author?: string;
	category?: string;
	tags: string[];
}

export interface ContentRefs {
	site: SiteConfig;
	posts: PostRef[];
	authors: { slug: string }[];
	pages: { slug: string }[];
}

/**
 * Checks what the schemas cannot: references between documents and the site
 * configuration, and URL collisions. Returns one message per problem.
 */
export function validateContent({ site, posts, authors, pages }: ContentRefs): string[] {
	const problems: string[] = [];
	const authorSlugs = new Set(authors.map((a) => a.slug));
	const tagSlugs = new Set(site.tags.map((t) => t.slug));
	const categorySlugs = new Set(site.categories.map((c) => c.slug));

	for (const [kind, terms] of [['tag', site.tags], ['category', site.categories]] as const) {
		const seen = new Set<string>();
		for (const term of terms) {
			if (!isSlug(term.slug)) {
				problems.push(`site config: ${kind} slug "${term.slug}" must be lowercase ASCII words joined by hyphens`);
			}
			if (seen.has(term.slug)) problems.push(`site config: ${kind} "${term.slug}" is declared twice`);
			seen.add(term.slug);
		}
	}

	if (site.defaultAuthor && !authorSlugs.has(site.defaultAuthor)) {
		problems.push(`site config: defaultAuthor "${site.defaultAuthor}" has no file in content/authors`);
	}

	const bySlug = new Map<string, string>();
	for (const post of posts) {
		const at = post.source;

		if (!isSlug(post.slug)) {
			problems.push(`${at}: slug "${post.slug}" must be lowercase ASCII words joined by hyphens`);
		}
		const other = bySlug.get(post.slug);
		if (other) problems.push(`${at}: slug "${post.slug}" is already used by ${other}`);
		else bySlug.set(post.slug, at);

		if (post.datePrefix && post.datePrefix !== post.date) {
			problems.push(`${at}: the file name says ${post.datePrefix} but date is ${post.date}`);
		}
		if (post.updated && post.updated < post.date) {
			problems.push(`${at}: updated (${post.updated}) is earlier than date (${post.date})`);
		}

		const author = post.author ?? site.defaultAuthor;
		if (!author) {
			problems.push(`${at}: no author, and the site config has no defaultAuthor`);
		} else if (!authorSlugs.has(author)) {
			problems.push(`${at}: unknown author "${author}"`);
		}

		if (post.category && !categorySlugs.has(post.category)) {
			problems.push(`${at}: unknown category "${post.category}"`);
		}
		for (const tag of post.tags) {
			if (!tagSlugs.has(tag)) problems.push(`${at}: unknown tag "${tag}"`);
		}
	}

	for (const page of pages) {
		if (!isSlug(page.slug)) {
			problems.push(`pages/${page.slug}.md: slug must be lowercase ASCII words joined by hyphens`);
		}
		if (RESERVED_SLUGS.includes(page.slug)) {
			problems.push(`pages/${page.slug}.md: "${page.slug}" is a built-in route, choose another file name`);
		}
	}

	return problems;
}
