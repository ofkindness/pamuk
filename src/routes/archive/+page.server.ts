import { posts, summary } from '#lib/content/index.ts';
import { groupByYear } from '#lib/content/order.ts';

export function load() {
	return { years: groupByYear(posts.map(summary)) };
}
