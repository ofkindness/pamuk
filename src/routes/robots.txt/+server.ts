import { absolute } from '#lib/urls.ts';

export const prerender = true;

export function GET() {
	return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${absolute('/sitemap.xml')}\n`, {
		headers: { 'content-type': 'text/plain; charset=utf-8' }
	});
}
