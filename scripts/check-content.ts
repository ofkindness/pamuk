import { createBuilder } from '@content-collections/core';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { validateContent } from '../src/lib/content/validate.ts';
import { root, siteDir, siteName } from './site.ts';

/**
 * Validates the selected site's content without building the site: every
 * document must parse, match its schema and render, and every reference
 * (authors, tags, categories, slugs) must resolve. Exits with 1 on problems.
 */
const load = (file: string) => import(pathToFileURL(file).href);

const errors: string[] = [];
const builder = await createBuilder(path.join(root, 'content-collections.ts'));
builder.on('_error', (event) => errors.push(`${event._event}: ${event.error.message}`));
await builder.build();

const { allPosts, allAuthors, allPages } = await load(path.join(root, '.content-collections/generated/index.js'));
const { default: site } = await load(path.join(siteDir(), 'site.config.ts'));

const problems = [...errors, ...validateContent({ site, posts: allPosts, authors: allAuthors, pages: allPages })];

if (problems.length > 0) {
	console.error(`Content problems in sites/${siteName()}:`);
	for (const problem of problems) console.error(`  - ${problem}`);
	process.exit(1);
}
console.log(
	`sites/${siteName()}: ${allPosts.length} posts, ${allAuthors.length} authors, ${allPages.length} pages, no problems.`
);
