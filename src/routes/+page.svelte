<script lang="ts">
	import PostList from '#lib/components/PostList.svelte';
	import Seo from '#lib/components/Seo.svelte';
	import { websiteLd } from '#lib/seo/jsonld.ts';
	import { absolute, href } from '#lib/urls.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const site = $derived(data.site);
</script>

<Seo
	title={site.title}
	description={site.description}
	path="/"
	jsonLd={[websiteLd({ ...site, url: absolute('') })]}
/>

<h1 class="sr-only">{site.title}</h1>
<p class="mb-12 font-serif text-lg leading-relaxed text-muted">{site.description}</p>

{#if data.posts.length > 0}
	<PostList posts={data.posts} language={site.language} />
	{#if data.total > data.posts.length}
		<p class="mt-12">
			<a class="text-accent underline underline-offset-4" href={href('/archive/')}>All {data.total} posts</a>
		</p>
	{/if}
{:else}
	<p class="text-muted">No posts yet.</p>
{/if}
