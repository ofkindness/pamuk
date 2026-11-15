import { defineSite } from '#lib/config.ts';

export default defineSite({
	url: 'https://blog.sapere-aude.ru',
	title: 'blog.sapere-aude.ru',
	description: 'A technical blog, with occasional notes on books.',
	// Open decision (see README): one language or two. Posts can override it with `lang`.
	language: 'en',
	defaultAuthor: 'andrei',
	categories: [
		{ slug: 'tech', name: 'Tech' },
		{ slug: 'books', name: 'Books' }
	],
	tags: [],
	nav: [
		{ title: 'Archive', href: '/archive/' },
		{ title: 'Search', href: '/search/' }
	],
	analytics: { provider: 'none' }
});
