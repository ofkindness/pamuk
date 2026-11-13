import { existsSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import { root } from './site.ts';

/**
 * Runs after `vite build`. Pages are built with client rendering off, yet
 * SvelteKit still emits its client bundle and a `__data.json` per page.
 * Nothing links to them, so they are removed from the output. If any page
 * does load the client bundle, everything is left in place.
 */
const build = path.join(root, 'build');

function walk(dir: string): string[] {
	return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		const file = path.join(dir, entry.name);
		return entry.isDirectory() ? walk(file) : [file];
	});
}

if (!existsSync(build)) {
	console.error('build/ not found: run `vite build` first.');
	process.exit(1);
}

const files = walk(build);
const usesClient = files
	.filter((file) => file.endsWith('.html'))
	.some((file) => readFileSync(file, 'utf8').includes('/_app/immutable/entry/'));

if (usesClient) {
	console.log('Some pages load the client bundle; build/ left as is.');
} else {
	const immutable = path.join(build, '_app', 'immutable');
	for (const dir of ['chunks', 'entry', 'nodes']) rmSync(path.join(immutable, dir), { recursive: true, force: true });
	rmSync(path.join(build, '_app', 'version.json'), { force: true });
	const data = files.filter((file) => file.endsWith('__data.json'));
	for (const file of data) rmSync(file, { force: true });
	console.log(`Removed the unused client bundle and ${data.length} data files from build/.`);
}
