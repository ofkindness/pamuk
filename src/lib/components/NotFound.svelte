<script lang="ts">
	import { href } from '#lib/urls.ts';
</script>

<h1 class="font-serif text-4xl font-semibold">Page not found</h1>
<p class="mt-4 leading-relaxed text-muted">
	Nothing lives at this address. It may have moved, or the link may be wrong.
</p>
<p class="mt-6 flex gap-6">
	<a class="text-accent underline underline-offset-4" href={href('/')}>Home</a>
	<a class="text-accent underline underline-offset-4" href={href('/archive/')}>All posts</a>
</p>
