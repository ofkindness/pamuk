import { site } from '#lib/content/index.ts';
import { hasStaticFile } from '#lib/server/site-files.ts';

export function load() {
	return {
		site: {
			title: site.title,
			description: site.description,
			language: site.language,
			nav: site.nav,
			favicon: hasStaticFile('favicon.svg') ? '/favicon.svg' : undefined,
			defaultImage: hasStaticFile('og-default.png') ? '/og-default.png' : undefined
		}
	};
}
