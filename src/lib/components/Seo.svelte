<script lang="ts">
	import { page } from '$app/state';
	import { jsonLdScript } from '#lib/seo/jsonld.ts';
	import { absolute } from '#lib/urls.ts';
	import type { Thing, WithContext } from 'schema-dts';

	interface Props {
		title: string;
		description: string;
		/** Root-relative path of this page, such as `/archive/`. */
		path: string;
		/** Overrides the canonical URL, for posts published elsewhere first. */
		canonical?: string;
		/** Absolute URL of the share image; the site's default is used without it. */
		image?: string;
		type?: 'website' | 'article';
		published?: string;
		modified?: string;
		noindex?: boolean;
		jsonLd?: WithContext<Thing>[];
	}

	let {
		title,
		description,
		path,
		canonical,
		image,
		type = 'website',
		published,
		modified,
		noindex = false,
		jsonLd = []
	}: Props = $props();

	const site = $derived(page.data.site);
	const fullTitle = $derived(title === site.title ? title : `${title} · ${site.title}`);
	const url = $derived(canonical ?? absolute(path));
	const shareImage = $derived(image ?? (site.defaultImage ? absolute(site.defaultImage) : undefined));
</script>

<svelte:head>
	<title>{fullTitle}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={url} />
	{#if noindex}<meta name="robots" content="noindex" />{/if}

	<meta property="og:site_name" content={site.title} />
	<meta property="og:type" content={type} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={url} />
	{#if shareImage}<meta property="og:image" content={shareImage} />{/if}
	{#if published}<meta property="article:published_time" content={published} />{/if}
	{#if modified}<meta property="article:modified_time" content={modified} />{/if}

	<meta name="twitter:card" content={shareImage ? 'summary_large_image' : 'summary'} />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	{#if shareImage}<meta name="twitter:image" content={shareImage} />{/if}

	{#each jsonLd as data, index (index)}
		{@html jsonLdScript(data)}
	{/each}
</svelte:head>
