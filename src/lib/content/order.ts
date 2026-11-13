/** Newest first; posts of the same day are ordered by slug. */
export function comparePosts(a: { date: string; slug: string }, b: { date: string; slug: string }): number {
	if (a.date !== b.date) return a.date < b.date ? 1 : -1;
	return a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0;
}

/** Groups posts that are already sorted into `[year, posts]` pairs, keeping their order. */
export function groupByYear<T extends { date: string }>(posts: T[]): [string, T[]][] {
	const groups = new Map<string, T[]>();
	for (const post of posts) {
		const year = post.date.slice(0, 4);
		const group = groups.get(year);
		if (group) group.push(post);
		else groups.set(year, [post]);
	}
	return [...groups];
}
