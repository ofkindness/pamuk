<script lang="ts">
	interface Props {
		title: string;
		authors: string[];
		year?: number;
		isbn?: string;
		rating?: number;
		/** Link target of the cover image, already resolved. */
		cover?: string;
		coverSize?: { width: number; height: number };
	}

	let { title, authors, year, isbn, rating, cover, coverSize }: Props = $props();
</script>

<aside class="mb-10 flex gap-5 rounded-lg border border-line bg-surface p-5" aria-label="About the book">
	{#if cover}
		<img
			class="h-auto w-24 shrink-0 self-start rounded shadow-sm"
			src={cover}
			width={coverSize?.width}
			height={coverSize?.height}
			alt={`Cover of ${title}`}
		/>
	{/if}
	<div class="min-w-0">
		<p class="text-xs font-bold tracking-wider text-muted uppercase">Book</p>
		<p class="mt-1 font-serif text-xl leading-snug font-semibold"><cite class="not-italic">{title}</cite></p>
		<p class="mt-1 text-muted">
			{authors.join(', ')}{#if year}, {year}{/if}
		</p>
		{#if rating}
			<p class="mt-3 text-accent" role="img" aria-label={`Rating: ${rating} out of 5`}>
				<span aria-hidden="true">{'★'.repeat(rating)}{'☆'.repeat(5 - rating)}</span>
			</p>
		{/if}
		{#if isbn}
			<p class="mt-2 text-xs text-muted">ISBN {isbn}</p>
		{/if}
	</div>
</aside>
