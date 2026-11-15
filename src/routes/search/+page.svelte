<script lang="ts">
	import Seo from '#lib/components/Seo.svelte';
	import searchScript from '#lib/scripts/search.js?url&no-inline';
	import { href } from '#lib/urls.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<Seo title="Search" description={`Search ${data.site.title}.`} path="/search/" noindex />

<svelte:head>
	<script type="module" src={searchScript}></script>
</svelte:head>

<h1 class="font-serif text-4xl font-semibold">Search</h1>

<div class="mt-8" data-search={href('/pagefind/pagefind.js')}>
	<form role="search" onsubmit={(event) => event.preventDefault()}>
		<label class="sr-only" for="search-input">Search posts</label>
		<input
			id="search-input"
			class="w-full rounded-lg border border-line bg-surface px-4 py-3 text-lg placeholder:text-muted"
			type="search"
			name="q"
			placeholder="Search posts"
			autocomplete="off"
		/>
	</form>
	<p class="mt-4 text-sm text-muted" data-search-status aria-live="polite"></p>
	<ol class="search-results mt-6" data-search-results></ol>
	<noscript>
		<p class="text-muted">
			Search needs JavaScript. Without it, the <a class="text-accent underline" href={href('/archive/')}>archive</a>
			lists every post.
		</p>
	</noscript>
</div>
