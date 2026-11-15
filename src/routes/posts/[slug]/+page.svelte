<script lang="ts">
	import BookCard from '#lib/components/BookCard.svelte';
	import Seo from '#lib/components/Seo.svelte';
	import { formatDate } from '#lib/dates.ts';
	import { withBase } from '#lib/markdown/urls.ts';
	import copyCode from '#lib/scripts/copy-code.js?url&no-inline';
	import { blogPostingLd, bookPostLd, breadcrumbLd } from '#lib/seo/jsonld.ts';
	import {
		absolute,
		absoluteFile,
		authorPath,
		base,
		categoryPath,
		filePath,
		href,
		postPath,
		tagPath
	} from '#lib/urls.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const post = $derived(data.post);
	const path = $derived(postPath(post.slug));
	const url = $derived(absolute(path));
	const image = $derived(post.image && absoluteFile(post.image, path));

	const posting = $derived.by(() => {
		const input = { ...post, url, image, language: post.lang, author: data.author };
		if (!post.book) return blogPostingLd(input);
		const cover = post.book.cover && absoluteFile(post.book.cover, path);
		return bookPostLd(input, { ...post.book, cover });
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
		posting,
		breadcrumbLd([
			{ name: data.site.title, url: absolute('/') },
			{ name: 'Archive', url: absolute('/archive/') },
			{ name: post.title, url }
		])
	]}
/>

<svelte:head>
	{#if post.hasCode}
		<script type="module" src={copyCode}></script>
	{/if}
</svelte:head>

<article lang={post.lang} data-pagefind-body>
	<header class="mb-10">
		<h1 class="font-serif text-4xl leading-tight font-semibold text-balance sm:text-[2.75rem]">{post.title}</h1>
		<p class="mt-4 font-serif text-xl leading-relaxed text-muted">{post.description}</p>
		<p class="mt-5 flex flex-wrap gap-x-2 text-sm text-muted" data-pagefind-ignore>
			<a class="hover:text-ink" href={href(authorPath(data.author.slug))}>{data.author.name}</a>
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
			<p class="mt-1 text-sm text-muted" data-pagefind-ignore>
				Updated <time datetime={post.updated}>{formatDate(post.updated, post.lang)}</time>
			</p>
		{/if}
		{#if data.category || data.tags.length > 0}
			<ul class="mt-4 flex flex-wrap gap-2 text-sm" aria-label="Topics" data-pagefind-ignore>
				{#if data.category}
					<li>
						<a
							class="block rounded-full border border-accent px-3 py-0.5 text-accent hover:bg-surface"
							href={href(categoryPath(data.category.slug))}
						>
							{data.category.name}
						</a>
					</li>
				{/if}
				{#each data.tags as tag (tag.slug)}
					<li>
						<a
							class="block rounded-full border border-line px-3 py-0.5 text-muted hover:text-ink"
							href={href(tagPath(tag.slug))}
						>
							{tag.name}
						</a>
					</li>
				{/each}
			</ul>
		{/if}
	</header>

	{#if post.book}
		<BookCard
			{...post.book}
			cover={post.book.cover && href(filePath(post.book.cover, path))}
			coverSize={post.coverSize}
		/>
	{/if}

	{#if post.headings.length >= 3}
		<nav class="mb-10 rounded-lg border border-line px-5 py-4 text-sm" aria-labelledby="toc-title" data-pagefind-ignore>
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
