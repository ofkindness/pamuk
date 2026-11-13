<script lang="ts">
	import Seo from '#lib/components/Seo.svelte';
	import { formatDate } from '#lib/dates.ts';
	import { withBase } from '#lib/markdown/urls.ts';
	import { blogPostingLd, breadcrumbLd } from '#lib/seo/jsonld.ts';
	import { absolute, base, href, postPath } from '#lib/urls.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const post = $derived(data.post);
	const path = $derived(postPath(post.slug));
	const url = $derived(absolute(path));

	// A share image is a file beside the post, a path under static/, or a full URL.
	const image = $derived.by(() => {
		if (!post.image) return undefined;
		if (/^https?:\/\//.test(post.image)) return post.image;
		return post.image.startsWith('/') ? absolute(post.image) : url + post.image;
	});
</script>

<Seo
	title={post.title}
	description={post.description}
	{path}
	canonical={post.canonical}
	{image}
	type="article"
	published={post.date}
	modified={post.updated}
	noindex={post.draft}
	jsonLd={[
		blogPostingLd({ ...post, url, image, language: post.lang, author: data.author }),
		breadcrumbLd([
			{ name: data.site.title, url: absolute('/') },
			{ name: 'Archive', url: absolute('/archive/') },
			{ name: post.title, url }
		])
	]}
/>

<article lang={post.lang}>
	<header class="mb-10">
		<h1 class="font-serif text-4xl leading-tight font-semibold text-balance sm:text-[2.75rem]">{post.title}</h1>
		<p class="mt-4 font-serif text-xl leading-relaxed text-muted">{post.description}</p>
		<p class="mt-5 flex flex-wrap gap-x-2 text-sm text-muted">
			<span>{data.author.name}</span>
			<span aria-hidden="true">·</span>
			<time datetime={post.date}>{formatDate(post.date, post.lang)}</time>
			<span aria-hidden="true">·</span>
			<span>{post.readingTime} min read</span>
			{#if post.draft}
				<span aria-hidden="true">·</span>
				<span class="uppercase tracking-wide">Draft</span>
			{/if}
		</p>
		{#if post.updated}
			<p class="mt-1 text-sm text-muted">
				Updated <time datetime={post.updated}>{formatDate(post.updated, post.lang)}</time>
			</p>
		{/if}
	</header>

	{#if post.headings.length >= 3}
		<nav class="mb-10 rounded-lg border border-line px-5 py-4 text-sm" aria-labelledby="toc-title">
			<h2 id="toc-title" class="text-xs font-bold tracking-wider text-muted uppercase">Contents</h2>
			<ol class="mt-3 space-y-1.5">
				{#each post.headings as heading (heading.id)}
					<li class={heading.depth === 3 ? 'pl-4' : ''}>
						<a class="text-muted hover:text-accent" href="#{heading.id}">{heading.text}</a>
					</li>
				{/each}
			</ol>
		</nav>
	{/if}

	<div class="prose prose-lg max-w-none">
		{@html withBase(post.html, base)}
	</div>
</article>

<footer class="mt-16 space-y-8 border-t border-line pt-8 text-sm">
	{#if post.discussion}
		<p>
			<a class="text-accent underline underline-offset-4" href={post.discussion}>Discuss this post</a>
		</p>
	{/if}

	{#if data.newer || data.older}
		<nav class="grid gap-6 sm:grid-cols-2" aria-label="More posts">
			{#if data.older}
				<a class="group block" href={href(postPath(data.older.slug))}>
					<span class="text-muted">Older</span>
					<span class="mt-1 block font-serif text-lg group-hover:text-accent">{data.older.title}</span>
				</a>
			{:else}
				<span></span>
			{/if}
			{#if data.newer}
				<a class="group block sm:text-right" href={href(postPath(data.newer.slug))}>
					<span class="text-muted">Newer</span>
					<span class="mt-1 block font-serif text-lg group-hover:text-accent">{data.newer.title}</span>
				</a>
			{/if}
		</nav>
	{/if}
</footer>
