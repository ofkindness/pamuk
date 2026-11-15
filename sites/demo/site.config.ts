import { defineSite } from '#lib/config.ts';

export default defineSite({
	url: 'https://example.com',
	title: 'pamuk demo',
	description: 'A static blog starter built with SvelteKit and typed Markdown content.',
	language: 'en',
	defaultAuthor: 'jane',
	homePosts: 10,
	postsPerPage: 20,
	categories: [
		{ slug: 'tech', name: 'Tech' },
		{ slug: 'books', name: 'Books' }
	],
	tags: [
		{ slug: 'svelte', name: 'Svelte' },
		{ slug: 'markdown', name: 'Markdown' },
		{ slug: 'fiction', name: 'Fiction' }
	],
	nav: [
		{ title: 'Archive', href: '/archive/' },
		{ title: 'About', href: '/about/' },
		{ title: 'Search', href: '/search/' }
	],
	analytics: { provider: 'none' } // or { provider: 'goatcounter', endpoint: 'https://stats.example.com/count' }
});
