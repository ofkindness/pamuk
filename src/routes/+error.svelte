<script lang="ts">
	import { page } from '$app/state';
	import NotFound from '#lib/components/NotFound.svelte';
</script>

<svelte:head>
	<title>{page.status === 404 ? 'Page not found' : 'Error'}</title>
</svelte:head>

{#if page.status === 404}
	<NotFound />
{:else}
	<h1 class="font-serif text-4xl font-semibold">{page.status}</h1>
	<p class="mt-4 text-muted">{page.error?.message}</p>
{/if}
