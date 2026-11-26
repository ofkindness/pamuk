<script lang="ts">
	import Seo from '#lib/components/Seo.svelte';
	import { withBase } from '#lib/markdown/urls.ts';
	import { base } from '#lib/urls.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<Seo title={data.page.title} description={data.page.description} path={`/${data.page.slug}/`} />

<article data-pagefind-body>
	<h1 class="mb-8 font-serif text-4xl font-semibold">{data.page.title}</h1>
	<div class="prose prose-lg max-w-none">
		{@html withBase(data.page.html, base)}
	</div>
</article>
