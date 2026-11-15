import { posts, site, summary } from '#lib/content/index.ts';

export function load() {
	return {
		posts: posts.slice(0, site.homePosts).map(summary),
		total: posts.length
	};
}
