import { pages, posts } from '#lib/content/index.ts';
import { escapeXml } from '#lib/seo/xml.ts';
import { absolute, postPath } from '#lib/urls.ts';

export const prerender = true;

export function GET() {
	const published = posts.filter((post) => !post.draft);
	const urls: { path: string; lastmod?: string }[] = [
		{ path: '/', lastmod: published[0]?.date },
		{ path: '/archive/', lastmod: published[0]?.date },
		...published.map((post) => ({ path: postPath(post.slug), lastmod: post.updated ?? post.date })),
		...pages.map((page) => ({ path: `/${page.slug}/` }))
	];

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
	.map(
		({ path, lastmod }) =>
			`	<url><loc>${escapeXml(absolute(path))}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`
	)
	.join('\n')}
</urlset>
`;

	return new Response(xml, { headers: { 'content-type': 'application/xml; charset=utf-8' } });
}
