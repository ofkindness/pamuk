import type { Element, Root } from 'hast';
import { imageSize } from 'image-size';
import { readFileSync } from 'node:fs';
import { visit } from 'unist-util-visit';
import type { VFile } from 'vfile';

/** Maps an image `src` to a file on disk, or `undefined` for images pamuk does not own (remote ones). */
export type ImageResolver = (src: string) => string | undefined;

declare module 'vfile' {
	interface DataMap {
		resolveImage?: ImageResolver;
	}
}

/**
 * Makes images lazy and gives local ones their `width` and `height`, so the
 * page does not jump while they load. A local image that is missing on disk
 * fails the build.
 */
export function rehypeImages() {
	return (tree: Root, file: VFile) => {
		const resolve = file.data.resolveImage;
		visit(tree, 'element', (node: Element) => {
			if (node.tagName !== 'img') return;
			node.properties.loading ??= 'lazy';
			node.properties.decoding ??= 'async';

			const src = node.properties.src;
			if (typeof src !== 'string' || !resolve) return;
			const filePath = resolve(src);
			if (!filePath) return;

			let bytes: Uint8Array;
			try {
				bytes = readFileSync(filePath);
			} catch {
				throw new Error(`image not found: ${src} (looked for ${filePath})`);
			}
			if (node.properties.width || node.properties.height) return;
			const { width, height } = imageSize(bytes);
			if (width && height) {
				node.properties.width = width;
				node.properties.height = height;
			}
		});
	};
}
