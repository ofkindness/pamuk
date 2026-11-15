import { getPost, site } from '#lib/content/index.ts';
import type { Handle } from '@sveltejs/kit/hooks';

/** Sets `<html lang>`: the post's own language on post pages, the site's elsewhere. */
export const handle: Handle = ({ event, resolve }) => {
	const post = event.route.id === '/posts/[slug]' ? getPost(event.params.slug ?? '') : undefined;
	const lang = post?.lang ?? site.language;
	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%lang%', lang)
	});
};
