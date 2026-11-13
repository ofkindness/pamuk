<script lang="ts">
	import '../app.css';
	import { absolute, href } from '#lib/urls.ts';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
	const site = $derived(data.site);
</script>

<svelte:head>
	{#if site.favicon}<link rel="icon" href={href(site.favicon)} />{/if}
	<link rel="alternate" type="application/rss+xml" title={site.title} href={absolute('/rss.xml')} />
</svelte:head>

<a
	class="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:rounded focus:bg-surface focus:px-3 focus:py-2"
	href="#main"
>
	Skip to content
</a>

<div class="mx-auto flex min-h-dvh max-w-[44rem] flex-col px-5 sm:px-8">
	<header class="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 py-8 sm:py-10">
		<a class="font-serif text-xl font-semibold tracking-tight" href={href('/')}>{site.title}</a>
		<nav aria-label="Main">
			<ul class="flex gap-6 text-sm text-muted">
				{#each site.nav as item (item.href)}
					<li><a class="hover:text-ink" href={href(item.href)}>{item.title}</a></li>
				{/each}
			</ul>
		</nav>
	</header>

	<main id="main" class="flex-1 pb-20">
		{@render children()}
	</main>

	<footer class="flex flex-wrap justify-between gap-x-8 gap-y-2 border-t border-line py-8 text-sm text-muted">
		<p>{site.title}</p>
		<ul class="flex gap-6">
			<li><a class="hover:text-ink" href={href('/rss.xml')}>RSS</a></li>
			<li><a class="hover:text-ink" href="https://github.com/ofkindness/pamuk">Built with pamuk</a></li>
		</ul>
	</footer>
</div>
