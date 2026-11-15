<script lang="ts">
	import PostList from '#lib/components/PostList.svelte';
	import Seo from '#lib/components/Seo.svelte';
	import { withBase } from '#lib/markdown/urls.ts';
	import { profilePageLd } from '#lib/seo/jsonld.ts';
	import { absolute, absoluteFile, authorPath, base, filePath, href } from '#lib/urls.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const author = $derived(data.author);
	const path = $derived(authorPath(author.slug));
	const host = (url: string) => new URL(url).host.replace(/^www\./, '');
</script>

<Seo
	title={author.name}
	description={`Posts by ${author.name} on ${data.site.title}.`}
	{path}
	jsonLd={[
		profilePageLd({
			name: author.name,
			links: author.links,
			url: absolute(path),
			image: author.avatar && absoluteFile(author.avatar, path)
		})
	]}
/>

<header class="mb-12">
	<div class="flex items-center gap-5">
		{#if author.avatar}
			<img
				class="size-20 rounded-full object-cover"
				src={href(filePath(author.avatar, path))}
				width={author.avatarSize?.width}
				height={author.avatarSize?.height}
				alt=""
			/>
		{/if}
		<div>
			<p class="text-xs font-bold tracking-wider text-muted uppercase">Author</p>
			<h1 class="mt-2 font-serif text-4xl font-semibold">{author.name}</h1>
		</div>
	</div>

	{#if author.html}
		<div class="prose mt-6 max-w-none">
			{@html withBase(author.html, base)}
		</div>
	{/if}

	{#if author.links.length > 0}
		<ul class="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm">
			{#each author.links as link (link)}
				<li><a class="text-accent underline underline-offset-4" rel="me" href={link}>{host(link)}</a></li>
			{/each}
		</ul>
	{/if}
</header>

{#if data.posts.length > 0}
	<PostList posts={data.posts} language={data.site.language} />
{:else}
	<p class="text-muted">No posts yet.</p>
{/if}
