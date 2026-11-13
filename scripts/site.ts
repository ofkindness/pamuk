import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

/** The repository root. Every pamuk command runs from it. */
export const root = process.cwd();

const SITE_NAME = /^[a-z0-9][a-z0-9.-]*$/i;

/** The selected site: `SITE`, else `pamuk.defaultSite` in package.json, else `demo`. */
export function siteName(): string {
	const fromEnv = process.env.SITE?.trim();
	const name = fromEnv || defaultSite();
	if (!SITE_NAME.test(name)) {
		throw new Error(`Invalid site name "${name}": use letters, digits, dots and hyphens.`);
	}
	return name;
}

function defaultSite(): string {
	const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
	return pkg.pamuk?.defaultSite ?? 'demo';
}

/** Absolute path of `sites/<name>`. Throws when the site has no config file. */
export function siteDir(name = siteName()): string {
	const dir = path.join(root, 'sites', name);
	if (!existsSync(path.join(dir, 'site.config.ts'))) {
		throw new Error(`Site "${name}" not found: ${path.relative(root, dir)}/site.config.ts is missing.`);
	}
	return dir;
}
