import { createBuilder, type Builder } from '@content-collections/core';
import { configureLogging } from '@content-collections/integrations';
import path from 'node:path';
import type { Plugin } from 'vite';

/**
 * Runs content-collections inside Vite. Unlike the stock plugin, a production
 * build fails when a document cannot be read, parsed, validated or rendered,
 * instead of silently leaving it out.
 */
export function content(configPath = 'content-collections.ts'): Plugin {
	let builder: Builder | undefined;
	let isBuild = false;
	let errors: string[] = [];
	let built = false;
	let watcher: { unsubscribe: () => Promise<void> } | undefined;

	return {
		name: 'pamuk-content',
		async configResolved(config) {
			isBuild = config.command === 'build';
			builder = await createBuilder(path.resolve(config.root, configPath));
			configureLogging(builder);
			builder.on('_error', (event) => errors.push(`${event._event}: ${event.error.message}`));
		},
		async buildStart() {
			// Vite calls buildStart once per environment (client, server); one run is enough.
			if (!builder || built) return;
			built = true;
			errors = [];
			await builder.build();
			if (isBuild && errors.length > 0) {
				throw new Error(`Content errors:\n${errors.map((e) => `  - ${e}`).join('\n')}`);
			}
		},
		async configureServer() {
			watcher = await builder?.watch();
		},
		async closeBundle() {
			const subscription = watcher;
			watcher = undefined;
			await subscription?.unsubscribe();
		}
	};
}
