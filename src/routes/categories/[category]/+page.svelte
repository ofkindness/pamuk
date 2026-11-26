<script lang="ts">
	import TermListing from '#lib/components/TermListing.svelte';
	import { categoryPath } from '#lib/urls.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<TermListing kind="Category" term={data.term} path={categoryPath(data.term.slug)} posts={data.posts} site={data.site} />
