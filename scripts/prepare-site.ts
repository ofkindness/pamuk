import { cpSync, existsSync, lstatSync, mkdirSync, readlinkSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { root, siteDir, siteName } from './site.ts';

const COPY_MARKER = '.pamuk-copy';

/**
 * Points `static/` at `sites/<site>/static`, so SvelteKit serves the selected
 * site's files. A symlink where possible; a marked copy where symlinks are
 * not allowed (Windows without developer mode).
 */
export function prepareSite(name = siteName()): void {
	const source = path.join(siteDir(name), 'static');
	const target = path.join(root, 'static');
	const link = path.relative(root, source);
	mkdirSync(source, { recursive: true });

	const stat = lstatSync(target, { throwIfNoEntry: false });
	if (stat?.isSymbolicLink()) {
		if (readlinkSync(target) === link) return;
		rmSync(target);
	} else if (stat) {
		if (!existsSync(path.join(target, COPY_MARKER))) {
			throw new Error(
				'static/ is a real folder. pamuk manages it as a link to the selected site: ' +
					`move its files to ${link} and delete static/.`
			);
		}
		rmSync(target, { recursive: true });
	}

	try {
		symlinkSync(link, target, 'dir');
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code !== 'EPERM') throw error;
		cpSync(source, target, { recursive: true });
		writeFileSync(path.join(target, COPY_MARKER), `copied from ${link}\n`);
	}
}

if (import.meta.main) {
	prepareSite();
	console.log(`static/ → sites/${siteName()}/static`);
}
