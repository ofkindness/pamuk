<script lang="ts">
	import TermListing from '#lib/components/TermListing.svelte';
	import { tagPath } from '#lib/urls.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<TermListing kind="Tag" term={data.term} path={tagPath(data.term.slug)} posts={data.posts} site={data.site} />
