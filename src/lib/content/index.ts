import { allAuthors, allPages, allPosts, type Author, type Page, type Post } from '#content-collections';
import site from '#site/site.config.ts';
import { dev } from '$app/env';
import { comparePosts } from './order.ts';
import { validateContent } from './validate.ts';

export type { Author, Page, Post };
export { site };

const problems = validateContent({ site, posts: allPosts, authors: allAuthors, pages: allPages });
if (problems.length > 0) {
	throw new Error(`Content problems:\n${problems.map((p) => `  - ${p}`).join('\n')}`);
}

/** Published posts, newest first. Drafts are included in dev only. */
export const posts: Post[] = allPosts.filter((post) => dev || !post.draft).sort(comparePosts);
export const authors: Author[] = allAuthors;
export const pages: Page[] = allPages;

export function getPost(slug: string): Post | undefined {
	return posts.find((post) => post.slug === slug);
}

export function getPage(slug: string): Page | undefined {
	return pages.find((page) => page.slug === slug);
}

/** The post's author; validation guarantees there is one. */
export function authorOf(post: Post): Author {
	const slug = post.author ?? site.defaultAuthor;
	return authors.find((author) => author.slug === slug)!;
}

export function getAuthor(slug: string): Author | undefined {
	return authors.find((author) => author.slug === slug);
}

export const postsByTag = (slug: string) => posts.filter((post) => post.tags.includes(slug));
export const postsByCategory = (slug: string) => posts.filter((post) => post.category === slug);
export const postsByAuthor = (slug: string) => posts.filter((post) => authorOf(post).slug === slug);

/** Declared tags and categories that at least one post uses; only these get a page. */
export const usedTags = site.tags.filter((tag) => postsByTag(tag.slug).length > 0);
export const usedCategories = site.categories.filter((category) => postsByCategory(category.slug).length > 0);

/** The fields a listing needs, without the rendered HTML. */
export function summary(post: Post) {
	const { slug, title, description, date, draft, lang } = post;
	return { slug, title, description, date, draft, lang };
}

export type PostSummary = ReturnType<typeof summary>;
