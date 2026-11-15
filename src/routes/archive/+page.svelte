<script lang="ts">
	import Seo from '#lib/components/Seo.svelte';
	import { href, postPath } from '#lib/urls.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const dayMonth = $derived(
		new Intl.DateTimeFormat(data.site.language, { month: 'short', day: 'numeric', timeZone: 'UTC' })
	);
</script>

<Seo title="Archive" description={`Every post on ${data.site.title}, newest first.`} path="/archive/" />

<h1 class="font-serif text-4xl font-semibold">Archive</h1>

{#each data.years as [year, posts] (year)}
	<section class="mt-12">
		<h2 class="border-b border-line pb-2 font-serif text-xl font-semibold text-muted">{year}</h2>
		<ul class="mt-4 space-y-3">
			{#each posts as post (post.slug)}
				<li class="flex gap-4">
					<time class="w-16 shrink-0 pt-0.5 text-sm text-muted tabular-nums" datetime={post.date}>
						{dayMonth.format(new Date(`${post.date}T00:00:00Z`))}
					</time>
					<a class="decoration-accent decoration-1 underline-offset-4 hover:underline" lang={post.lang} href={href(postPath(post.slug))}>
						{post.title}
					</a>
				</li>
			{/each}
		</ul>
	</section>
{:else}
	<p class="mt-8 text-muted">No posts yet.</p>
{/each}
