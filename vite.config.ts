import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { content } from './scripts/content-plugin.ts';
import { prepareSite } from './scripts/prepare-site.ts';
import { siteDir, siteName } from './scripts/site.ts';

const site = siteName();
const dir = siteDir(site);
prepareSite(site);

// For sites served from a subfolder, such as a GitHub Pages project site.
const base = (process.env.BASE_PATH ?? '').replace(/\/+$/, '') as '' | `/${string}`;

export default defineConfig({
	plugins: [
		content(),
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
			},
			adapter: adapter({ pages: 'build', assets: 'build', strict: true }),
			paths: {
				base,
				// Root-relative asset URLs: the 404 page is served at any depth.
				relative: false
			},
			prerender: {
				// Dynamic routes list their own entries. A site with no posts, or with
				// no post folders, has nothing to render for some of them.
				handleUnseenRoutes: 'ignore'
			}
		})
	],
	resolve: {
		// package.json maps #site to sites/demo for types; this selects the real site.
		alias: [{ find: /^#site\//, replacement: `${dir}/` }]
	},
	define: {
		__SITE_NAME__: JSON.stringify(site),
		__SITE_DIR__: JSON.stringify(dir)
	}
});
