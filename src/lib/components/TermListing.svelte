<script lang="ts">
	import PostList from '#lib/components/PostList.svelte';
	import Seo from '#lib/components/Seo.svelte';
	import type { Term } from '#lib/config.ts';
	import type { PostSummary } from '#lib/content/index.ts';
	import { breadcrumbLd } from '#lib/seo/jsonld.ts';
	import { absolute } from '#lib/urls.ts';

	interface Props {
		/** What the term is, shown above its name: "Tag" or "Category". */
		kind: string;
		term: Term;
		path: string;
		posts: PostSummary[];
		site: { title: string; language: string };
	}

	let { kind, term, path, posts, site }: Props = $props();
	const count = $derived(posts.length === 1 ? '1 post' : `${posts.length} posts`);
</script>

<Seo
	title={`${term.name} (${kind.toLowerCase()})`}
	description={term.description ?? `${count} in “${term.name}” on ${site.title}.`}
	{path}
	jsonLd={[
		breadcrumbLd([
			{ name: site.title, url: absolute('/') },
			{ name: term.name, url: absolute(path) }
		])
	]}
/>

<header class="mb-12">
	<p class="text-xs font-bold tracking-wider text-muted uppercase">{kind}</p>
	<h1 class="mt-2 font-serif text-4xl font-semibold">{term.name}</h1>
	{#if term.description}
		<p class="mt-4 font-serif text-lg leading-relaxed text-muted">{term.description}</p>
	{/if}
	<p class="mt-3 text-sm text-muted">{count}</p>
</header>

<PostList {posts} language={site.language} />
