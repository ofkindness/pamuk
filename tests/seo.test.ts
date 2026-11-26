import { describe, expect, it } from 'vitest';
import { formatDate, rssDate } from '../src/lib/dates.ts';
import { blogPostingLd, bookPostLd, breadcrumbLd, jsonLdScript, profilePageLd } from '../src/lib/seo/jsonld.ts';
import { cdata, escapeXml } from '../src/lib/seo/xml.ts';

describe('jsonLdScript', () => {
	it('cannot be closed from inside the data', () => {
		const script = jsonLdScript({
			'@context': 'https://schema.org',
			'@type': 'WebSite',
			name: '</script><script>alert(1)</script>'
		});
		expect(script.match(/<\/script>/g)).toHaveLength(1);
		expect(script).toContain('\\u003c/script>');
	});
});

describe('blogPostingLd', () => {
	const posting = blogPostingLd({
		url: 'https://example.com/posts/hello/',
		title: 'Hello',
		description: 'First',
		date: '2026-04-13',
		language: 'en',
		discussion: 'https://forum.example.com/t/1',
		author: { name: 'Jane Doe', links: [] }
	});

	it('uses the publication date when the post was never updated', () => {
		expect(posting).toMatchObject({ datePublished: '2026-04-13', dateModified: '2026-04-13' });
	});

	it('links the discussion and leaves empty fields out', () => {
		expect(posting).toMatchObject({ discussionUrl: 'https://forum.example.com/t/1' });
		expect(posting).not.toHaveProperty('image');
		expect(posting.author).toEqual({ '@type': 'Person', name: 'Jane Doe' });
	});
});

describe('bookPostLd', () => {
	const post = {
		url: 'https://example.com/posts/red/',
		title: 'Reading My Name Is Red',
		description: 'Notes',
		date: '2026-06-10',
		language: 'en',
		author: { name: 'Jane Doe', links: [] }
	};
	const book = { title: 'My Name Is Red', authors: ['Orhan Pamuk'], year: 1998 };

	it('stays a blog posting about the book when there is no rating', () => {
		const data = bookPostLd(post, book);
		expect(data).toMatchObject({
			'@type': 'BlogPosting',
			about: { '@type': 'Book', name: 'My Name Is Red', datePublished: '1998' }
		});
		expect(data).not.toHaveProperty('reviewRating');
	});

	it('becomes a review of the book when there is a rating', () => {
		const data = bookPostLd(post, { ...book, rating: 4 });
		expect(data).toMatchObject({
			'@type': 'Review',
			headline: 'Reading My Name Is Red',
			itemReviewed: { '@type': 'Book', author: [{ '@type': 'Person', name: 'Orhan Pamuk' }] },
			reviewRating: { ratingValue: 4, bestRating: 5, worstRating: 1 }
		});
		expect(data).not.toHaveProperty('about');
	});
});

describe('profilePageLd', () => {
	it('describes the author as the main entity', () => {
		const data = profilePageLd({
			name: 'Jane Doe',
			links: ['https://example.org/jane'],
			url: 'https://example.com/authors/jane/'
		});
		expect(data).toMatchObject({
			'@type': 'ProfilePage',
			mainEntity: { '@type': 'Person', name: 'Jane Doe', sameAs: ['https://example.org/jane'] }
		});
		expect(data.mainEntity).not.toHaveProperty('image');
	});
});

describe('breadcrumbLd', () => {
	it('numbers items from one', () => {
		const crumbs = breadcrumbLd([
			{ name: 'Home', url: 'https://example.com/' },
			{ name: 'Post', url: 'https://example.com/posts/a/' }
		]);
		expect(crumbs.itemListElement).toMatchObject([{ position: 1 }, { position: 2 }]);
	});
});

describe('xml', () => {
	it('escapes markup characters', () => {
		expect(escapeXml(`Tom & "Jerry" <b>'s</b>`)).toBe('Tom &amp; &quot;Jerry&quot; &lt;b&gt;&apos;s&lt;/b&gt;');
	});

	it('splits a CDATA terminator so it cannot end the section early', () => {
		const wrapped = cdata('a ]]> b');
		expect(wrapped).toBe('<![CDATA[a ]]]]><![CDATA[> b]]>');
		// Joining the sections back gives the original text.
		expect(wrapped.replace(/<!\[CDATA\[|\]\]>/g, '')).toBe('a ]]> b');
	});
});

describe('dates', () => {
	it('formats without timezone shifts', () => {
		expect(formatDate('2026-04-13', 'en')).toBe('April 13, 2026');
		expect(formatDate('2026-01-01', 'en')).toBe('January 1, 2026');
	});

	it('writes feed dates at midnight UTC', () => {
		expect(rssDate('2026-04-13')).toBe('Mon, 13 Apr 2026 00:00:00 GMT');
	});
});
