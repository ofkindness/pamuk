import type { BlogPosting, Book, BreadcrumbList, Person, ProfilePage, Review, Thing, WebSite, WithContext } from 'schema-dts';

/** Serializes structured data as a `<script>` element that cannot be broken out of. */
export function jsonLdScript(data: WithContext<Thing>): string {
	const json = JSON.stringify(data).replace(/</g, '\\u003c');
	return `<script type="application/ld+json">${json}</` + 'script>';
}

export function websiteLd(site: { url: string; title: string; description: string; language: string }): WithContext<WebSite> {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		url: `${site.url}/`,
		name: site.title,
		description: site.description,
		inLanguage: site.language
	};
}

export function personLd(author: { name: string; links: string[] }): Person {
	return {
		'@type': 'Person',
		name: author.name,
		...(author.links.length > 0 && { sameAs: author.links })
	};
}

export interface PostingInput {
	url: string;
	title: string;
	description: string;
	date: string;
	updated?: string;
	language: string;
	image?: string;
	discussion?: string;
	author: { name: string; links: string[] };
}

export function blogPostingLd(post: PostingInput): WithContext<BlogPosting> {
	return {
		'@context': 'https://schema.org',
		'@type': 'BlogPosting',
		mainEntityOfPage: post.url,
		url: post.url,
		headline: post.title,
		description: post.description,
		datePublished: post.date,
		dateModified: post.updated ?? post.date,
		inLanguage: post.language,
		author: personLd(post.author),
		...(post.image && { image: post.image }),
		...(post.discussion && { discussionUrl: post.discussion })
	};
}

export function breadcrumbLd(items: { name: string; url: string }[]): WithContext<BreadcrumbList> {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: items.map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: item.name,
			item: item.url
		}))
	};
}

export interface BookInput {
	title: string;
	authors: string[];
	year?: number;
	isbn?: string;
	cover?: string;
	rating?: number;
}

export function bookLd(book: BookInput): Book {
	return {
		'@type': 'Book',
		name: book.title,
		author: book.authors.map((name) => ({ '@type': 'Person', name })),
		...(book.year && { datePublished: String(book.year) }),
		...(book.isbn && { isbn: book.isbn }),
		...(book.cover && { image: book.cover })
	};
}

/**
 * A post about a book. Without a rating it stays a `BlogPosting` that is
 * `about` the book; with one it is a `Review` of the book.
 */
export function bookPostLd(post: PostingInput, book: BookInput): WithContext<BlogPosting> | WithContext<Review> {
	const posting = blogPostingLd(post);
	if (!book.rating) return { ...posting, about: bookLd(book) };
	const { '@type': _, ...shared } = posting;
	return {
		...shared,
		'@type': 'Review',
		itemReviewed: bookLd(book),
		reviewRating: { '@type': 'Rating', ratingValue: book.rating, bestRating: 5, worstRating: 1 }
	};
}

export function profilePageLd(author: { name: string; links: string[]; url: string; image?: string }): WithContext<ProfilePage> {
	return {
		'@context': 'https://schema.org',
		'@type': 'ProfilePage',
		url: author.url,
		mainEntity: {
			'@type': 'Person',
			name: author.name,
			url: author.url,
			...(author.links.length > 0 && { sameAs: author.links }),
			...(author.image && { image: author.image })
		}
	};
}
