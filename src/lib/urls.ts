import site from '#site/site.config.ts';
import { filePath } from './markdown/urls.ts';
import { resolve } from '$app/paths';

/** The base path the site is served from: `''` or `/subfolder`. */
export const base = resolve('/').replace(/\/$/, '');

/** A link target for a root-relative path such as `/archive/`. Absolute URLs pass through. */
export function href(path: string): string {
	return path.startsWith('/') && !path.startsWith('//') ? base + path : path;
}

/** The public URL of a root-relative path, for canonical links, feeds and structured data. */
export function absolute(path: string): string {
	return site.url + path;
}

export const postPath = (slug: string) => `/posts/${slug}/`;
export const tagPath = (slug: string) => `/tags/${slug}/`;
export const categoryPath = (slug: string) => `/categories/${slug}/`;
export const authorPath = (slug: string) => `/authors/${slug}/`;

export { filePath };

/** Like `absolute`, but leaves full URLs alone. */
export function absoluteFile(src: string, pagePath: string): string {
	const path = filePath(src, pagePath);
	return path.startsWith('/') ? absolute(path) : path;
}
