import { authorOf, posts, site } from '#lib/content/index.ts';
import { rssDate } from '#lib/dates.ts';
import { absolutize } from '#lib/markdown/urls.ts';
import { cdata, escapeXml } from '#lib/seo/xml.ts';
import { absolute, postPath } from '#lib/urls.ts';

export const prerender = true;

/** Full-content feed. Every URL inside a post is made absolute, since readers show it elsewhere. */
export function GET() {
	const items = posts
		.filter((post) => !post.draft)
		.map((post) => {
			const url = absolute(postPath(post.slug));
			return `		<item>
			<title>${escapeXml(post.title)}</title>
			<link>${escapeXml(url)}</link>
			<guid isPermaLink="true">${escapeXml(url)}</guid>
			<pubDate>${rssDate(post.date)}</pubDate>
			<dc:creator>${escapeXml(authorOf(post).name)}</dc:creator>
			<description>${escapeXml(post.description)}</description>
			<content:encoded>${cdata(absolutize(post.html, site.url, url))}</content:encoded>
		</item>`;
		});

	const newest = posts.find((post) => !post.draft);
	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/">
	<channel>
		<title>${escapeXml(site.title)}</title>
		<link>${escapeXml(absolute('/'))}</link>
		<description>${escapeXml(site.description)}</description>
		<language>${escapeXml(site.language)}</language>
		<atom:link href="${escapeXml(absolute('/rss.xml'))}" rel="self" type="application/rss+xml" />${
			newest ? `\n\t\t<lastBuildDate>${rssDate(newest.updated ?? newest.date)}</lastBuildDate>` : ''
		}
${items.join('\n')}
	</channel>
</rss>
`;

	return new Response(xml, { headers: { 'content-type': 'application/rss+xml; charset=utf-8' } });
}
