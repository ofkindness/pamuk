export interface PostFile {
	/** URL segment of the post. */
	slug: string;
	/** `YYYY-MM-DD` taken from the file name, when it has that prefix. */
	datePrefix?: string;
	/** True for `<slug>/index.md`, a post folder that can hold images. */
	bundle: boolean;
	/** Folder of a bundle, relative to the content folder. */
	directory?: string;
	/** True when the file lives in `drafts/`. */
	fromDrafts: boolean;
}

const DATE_PREFIX = /^(\d{4}-\d{2}-\d{2})-(.+)$/;

/**
 * Reads a post's identity from its path inside the content folder:
 * `posts/hello.md`, `posts/2026-04-13-hello.md` or `posts/hello/index.md`
 * (and the same under `drafts/`).
 */
export function parsePostPath(filePath: string): PostFile {
	const parts = filePath.split(/[/\\]/);
	const fromDrafts = parts[0] === 'drafts';
	const bundle = parts.length === 3 && parts[2] === 'index.md';
	const name = bundle ? parts[1] : parts[1].replace(/\.md$/, '');
	const match = DATE_PREFIX.exec(name);
	return {
		slug: match ? match[2] : name,
		datePrefix: match?.[1],
		bundle,
		directory: bundle ? `${parts[0]}/${parts[1]}` : undefined,
		fromDrafts
	};
}

/** URL segments are lowercase ASCII words joined by hyphens. */
export function isSlug(value: string): boolean {
	return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(value);
}
