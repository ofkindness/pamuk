import { cpSync, existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { root } from './site.ts';

/**
 * Turns a fresh clone into your own blog: `npm run init -- my-blog`.
 *
 * - copies sites/demo to sites/<name>
 * - makes <name> the default site
 * - removes sites/blog.sapere-aude.ru, whose content is not MIT-licensed
 *
 * sites/demo stays untouched, so later changes to the starter merge cleanly.
 */
const AUTHORS_BLOG = 'blog.sapere-aude.ru';
const name = process.argv[2];

function fail(message: string): never {
	console.error(message);
	process.exit(1);
}

if (!name) fail('Usage: npm run init -- <site-name>   (for example: npm run init -- my-blog)');
if (!/^[a-z0-9][a-z0-9.-]*$/.test(name)) {
	fail(`Invalid site name "${name}": use lowercase letters, digits, dots and hyphens.`);
}

const sites = path.join(root, 'sites');
const target = path.join(sites, name);
if (existsSync(target)) fail(`sites/${name} already exists.`);
if (!existsSync(path.join(sites, 'demo', 'site.config.ts'))) fail('sites/demo is missing: nothing to copy from.');

cpSync(path.join(sites, 'demo'), target, { recursive: true });

const packagePath = path.join(root, 'package.json');
const pkg = JSON.parse(readFileSync(packagePath, 'utf8'));
pkg.pamuk = { ...pkg.pamuk, defaultSite: name };
// Editors read the shape of a site's files from this mapping.
pkg.imports['#site/*'] = `./sites/${name}/*`;
writeFileSync(packagePath, `${JSON.stringify(pkg, null, '\t')}\n`);

const removed = existsSync(path.join(sites, AUTHORS_BLOG));
rmSync(path.join(sites, AUTHORS_BLOG), { recursive: true, force: true });
// static/ may still point at the removed site; the next command recreates it.
rmSync(path.join(root, 'static'), { force: true });

console.log(`Created sites/${name} and made it the default site.`);
if (removed) console.log(`Removed sites/${AUTHORS_BLOG} (the starter author's blog, not MIT-licensed).`);
console.log(`
Next:
  1. Edit sites/${name}/site.config.ts and theme.css.
  2. Replace the posts, authors and pages in sites/${name}/content.
  3. Rewrite content/pages/privacy.md, or delete it if you use no analytics.
  4. npm run dev
`);
