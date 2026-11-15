import { describe, expect, it } from 'vitest';
import { absolutize, withBase } from '../src/lib/markdown/urls.ts';

const html =
	'<a href="/archive/">a</a> <a href="#part">b</a> <a href="https://example.org/x">c</a> ' +
	'<a href="//cdn.example.org/y">d</a> <img src="diagram.png"> <img src="/images/photo.jpg">';

describe('withBase', () => {
	it('prefixes root-relative URLs only', () => {
		const result = withBase(html, '/pamuk');
		expect(result).toContain('href="/pamuk/archive/"');
		expect(result).toContain('src="/pamuk/images/photo.jpg"');
		expect(result).toContain('href="#part"');
		expect(result).toContain('href="https://example.org/x"');
		expect(result).toContain('href="//cdn.example.org/y"');
		expect(result).toContain('src="diagram.png"');
	});

	it('changes nothing without a base', () => {
		expect(withBase(html, '')).toBe(html);
	});
});

describe('absolutize', () => {
	const result = absolutize(html, 'https://blog.example/sub', 'https://blog.example/sub/posts/tour/');

	it('resolves root-relative URLs against the site', () => {
		expect(result).toContain('href="https://blog.example/sub/archive/"');
		expect(result).toContain('src="https://blog.example/sub/images/photo.jpg"');
	});

	it('resolves relative URLs and fragments against the page', () => {
		expect(result).toContain('src="https://blog.example/sub/posts/tour/diagram.png"');
		expect(result).toContain('href="https://blog.example/sub/posts/tour/#part"');
	});

	it('keeps absolute URLs', () => {
		expect(result).toContain('href="https://example.org/x"');
	});
});
