import path from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { readingTime, renderMarkdown } from '../src/lib/markdown/render.ts';

const fixtures = path.join(import.meta.dirname, 'fixtures');
const beside = (src: string) => (src.startsWith('http') ? undefined : path.join(fixtures, src));

describe('renderMarkdown', () => {
	// The first render starts Shiki, which can take seconds on a busy machine.
	// Paying for it here keeps that time out of the first test's own limit.
	beforeAll(async () => {
		await renderMarkdown('```ts\nconst warm = true;\n```');
	}, 60_000);

	it('renders GitHub Flavored Markdown', async () => {
		const { html } = await renderMarkdown('~~old~~ **new**\n\n| a | b |\n|---|---|\n| 1 | 2 |');
		expect(html).toContain('<del>old</del>');
		expect(html).toContain('<strong>new</strong>');
		expect(html).toContain('<table>');
	});

	it('turns container directives into callouts with a default title', async () => {
		const { html } = await renderMarkdown(':::note\nRemember this.\n:::');
		expect(html).toContain('<aside class="callout callout-note">');
		expect(html).toContain('<p class="callout-title">Note</p>');
		expect(html).toContain('<p>Remember this.</p>');
	});

	it('uses a callout label as its title', async () => {
		const { html } = await renderMarkdown(':::warning[Mind the gap]\nCareful.\n:::');
		expect(html).toContain('<p class="callout-title">Mind the gap</p>');
		expect(html).not.toContain('>Warning<');
	});

	it('keeps text that only looks like a directive', async () => {
		const { html } = await renderMarkdown('Ratio is 16:9 and see:this, at 10:30.');
		expect(html).toContain('16:9');
		expect(html).toContain('see:this');
		expect(html).toContain('10:30');
	});

	it('leaves unknown container directives out of the callouts', async () => {
		const { html } = await renderMarkdown(':::spoiler\nHidden.\n:::');
		expect(html).not.toContain('callout');
		expect(html).toContain('Hidden.');
	});

	it('gives headings ids, self-links and a table of contents', async () => {
		const { html, headings } = await renderMarkdown('# Title\n\n## First part\n\n### Detail\n\n## Second part');
		expect(headings).toEqual([
			{ depth: 2, id: 'first-part', text: 'First part' },
			{ depth: 3, id: 'detail', text: 'Detail' },
			{ depth: 2, id: 'second-part', text: 'Second part' }
		]);
		expect(html).toContain('<h2 id="first-part"><a href="#first-part">First part</a></h2>');
	});

	it('highlights code at build time for light and dark', async () => {
		const { html } = await renderMarkdown('```ts\nconst answer: number = 42;\n```');
		expect(html).toContain('class="shiki');
		expect(html).toContain('light-dark(');
		expect(html).not.toContain('<script');
	});

	it('renders code in an unknown language as plain text', async () => {
		const { html } = await renderMarkdown('```nosuchlang\nhello\n```');
		expect(html).toContain('hello');
		expect(html).toContain('<pre');
	});

	it('sizes local images and makes them lazy', async () => {
		const { html } = await renderMarkdown('![A pixel](pixel.svg)', beside);
		expect(html).toContain('src="pixel.svg"');
		expect(html).toContain('width="40"');
		expect(html).toContain('height="30"');
		expect(html).toContain('loading="lazy"');
	});

	it('leaves remote images unsized', async () => {
		const { html } = await renderMarkdown('![Remote](https://example.com/a.png)', beside);
		expect(html).toContain('loading="lazy"');
		expect(html).not.toContain('width=');
	});

	it('fails on a local image that does not exist', async () => {
		await expect(renderMarkdown('![Gone](missing.png)', beside)).rejects.toThrow(/image not found: missing\.png/);
	});

	it('counts words', async () => {
		const { words } = await renderMarkdown('one two three\n\nfour five');
		expect(words).toBe(5);
	});
});

describe('readingTime', () => {
	it('is at least one minute', () => {
		expect(readingTime(0)).toBe(1);
		expect(readingTime(50)).toBe(1);
	});

	it('rounds to whole minutes', () => {
		expect(readingTime(660)).toBe(3);
	});
});
