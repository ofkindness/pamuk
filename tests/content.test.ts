import { describe, expect, it } from 'vitest';
import { defineSite } from '../src/lib/config.ts';
import { isSlug, parsePostPath } from '../src/lib/content/files.ts';
import { comparePosts, groupByYear } from '../src/lib/content/order.ts';
import { validateContent, type PostRef } from '../src/lib/content/validate.ts';

describe('parsePostPath', () => {
	it('reads a plain file', () => {
		expect(parsePostPath('posts/hello.md')).toEqual({
			slug: 'hello',
			datePrefix: undefined,
			bundle: false,
			directory: undefined,
			fromDrafts: false
		});
	});

	it('strips a date prefix from the slug', () => {
		const file = parsePostPath('posts/2026-04-13-hello-world.md');
		expect(file.slug).toBe('hello-world');
		expect(file.datePrefix).toBe('2026-04-13');
	});

	it('reads a post folder', () => {
		const file = parsePostPath('posts/2026-05-02-tour/index.md');
		expect(file).toMatchObject({ slug: 'tour', bundle: true, directory: 'posts/2026-05-02-tour' });
	});

	it('marks files under drafts/', () => {
		expect(parsePostPath('drafts/idea.md').fromDrafts).toBe(true);
		expect(parsePostPath('posts/idea.md').fromDrafts).toBe(false);
	});
});

describe('isSlug', () => {
	it('accepts lowercase ASCII words joined by hyphens', () => {
		expect(isSlug('hello-world-2')).toBe(true);
	});

	it('rejects anything else', () => {
		for (const value of ['Hello', 'hello_world', 'привет', 'a--b', '-a', 'a.b', '']) {
			expect(isSlug(value), value).toBe(false);
		}
	});
});

describe('ordering', () => {
	const posts = [
		{ slug: 'b', date: '2026-01-01' },
		{ slug: 'c', date: '2025-12-31' },
		{ slug: 'a', date: '2026-01-01' }
	];

	it('sorts newest first, same day by slug', () => {
		expect([...posts].sort(comparePosts).map((p) => p.slug)).toEqual(['a', 'b', 'c']);
	});

	it('groups by year, keeping the order', () => {
		const grouped = groupByYear([...posts].sort(comparePosts));
		expect(grouped.map(([year, items]) => [year, items.length])).toEqual([
			['2026', 2],
			['2025', 1]
		]);
	});
});

describe('validateContent', () => {
	const site = defineSite({
		url: 'https://example.com/',
		title: 'Test',
		description: 'Test site',
		language: 'en',
		defaultAuthor: 'jane',
		categories: [{ slug: 'tech', name: 'Tech' }],
		tags: [{ slug: 'svelte', name: 'Svelte' }]
	});
	const authors = [{ slug: 'jane' }];
	const post = (overrides: Partial<PostRef> = {}): PostRef => ({
		slug: 'hello',
		source: 'posts/hello.md',
		date: '2026-04-13',
		tags: [],
		...overrides
	});
	const check = (posts: PostRef[], pages: { slug: string }[] = []) =>
		validateContent({ site, posts, authors, pages });

	it('accepts valid content', () => {
		expect(check([post({ tags: ['svelte'], category: 'tech', author: 'jane' })], [{ slug: 'about' }])).toEqual([]);
	});

	it('reports unknown tags, categories and authors', () => {
		const problems = check([post({ tags: ['rust'], category: 'cooking', author: 'john' })]);
		expect(problems).toEqual([
			'posts/hello.md: unknown author "john"',
			'posts/hello.md: unknown category "cooking"',
			'posts/hello.md: unknown tag "rust"'
		]);
	});

	it('reports two posts with one slug', () => {
		const problems = check([post(), post({ source: 'posts/hello/index.md' })]);
		expect(problems).toEqual(['posts/hello/index.md: slug "hello" is already used by posts/hello.md']);
	});

	it('reports a date prefix that differs from the date', () => {
		const problems = check([post({ datePrefix: '2026-04-12' })]);
		expect(problems).toEqual(['posts/hello.md: the file name says 2026-04-12 but date is 2026-04-13']);
	});

	it('reports an update earlier than the publication', () => {
		expect(check([post({ updated: '2026-04-01' })])).toHaveLength(1);
	});

	it('reports a slug that is not lowercase ASCII', () => {
		expect(check([post({ slug: 'Hello World' })])[0]).toMatch(/must be lowercase ASCII/);
	});

	it('reports a page that takes a built-in route', () => {
		expect(check([], [{ slug: 'archive' }])).toEqual([
			'pages/archive.md: "archive" is a built-in route, choose another file name'
		]);
	});

	it('reports a post without any author', () => {
		const problems = validateContent({
			site: { ...site, defaultAuthor: undefined },
			posts: [post()],
			authors,
			pages: []
		});
		expect(problems).toEqual(['posts/hello.md: no author, and the site config has no defaultAuthor']);
	});

	it('reports a default author without a file', () => {
		const problems = validateContent({ site, posts: [], authors: [], pages: [] });
		expect(problems).toEqual(['site config: defaultAuthor "jane" has no file in content/authors']);
	});

	it('reports duplicate and malformed terms in the site config', () => {
		const problems = validateContent({
			site: { ...site, tags: [{ slug: 'svelte', name: 'a' }, { slug: 'svelte', name: 'b' }, { slug: 'C++', name: 'c' }] },
			posts: [],
			authors,
			pages: []
		});
		expect(problems).toHaveLength(2);
	});
});

describe('defineSite', () => {
	it('fills defaults and drops a trailing slash from the URL', () => {
		const site = defineSite({ url: 'https://example.com/', title: 'T', description: 'D', language: 'en' });
		expect(site.url).toBe('https://example.com');
		expect(site.analytics).toEqual({ provider: 'none' });
		expect(site.tags).toEqual([]);
		expect(site.homePosts).toBe(10);
	});
});
