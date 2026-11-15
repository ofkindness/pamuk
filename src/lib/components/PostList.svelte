<script lang="ts">
	import type { PostSummary } from '#lib/content/index.ts';
	import { formatDate } from '#lib/dates.ts';
	import { href, postPath } from '#lib/urls.ts';

	let { posts, language }: { posts: PostSummary[]; language: string } = $props();
</script>

<ul class="space-y-10">
	{#each posts as post (post.slug)}
		<li>
			<article lang={post.lang}>
				<p class="text-sm text-muted">
					<time datetime={post.date}>{formatDate(post.date, language)}</time>
					{#if post.draft}<span class="ml-2 rounded border border-line px-1.5 py-0.5 text-xs uppercase tracking-wide">Draft</span>{/if}
				</p>
				<h2 class="mt-1 font-serif text-2xl leading-snug font-semibold">
					<a class="decoration-accent decoration-1 underline-offset-4 hover:underline" href={href(postPath(post.slug))}>
						{post.title}
					</a>
				</h2>
				<p class="mt-2 leading-relaxed text-muted">{post.description}</p>
			</article>
		</li>
	{/each}
</ul>
