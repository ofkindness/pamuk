import rehypeShiki from '@shikijs/rehype';
import type { Element, Root } from 'hast';
import { toString } from 'hast-util-to-string';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify';
import remarkDirective from 'remark-directive';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';
import { VFile } from 'vfile';
import { remarkCallouts } from './callouts.ts';
import { rehypeImages, type ImageResolver } from './images.ts';

// A type alias, not an interface: content-collections needs documents to be
// plain serializable data, and interfaces do not pass that check.
export type Heading = {
	depth: 2 | 3;
	id: string;
	text: string;
};

export interface Rendered {
	html: string;
	/** Second- and third-level headings, for the table of contents. */
	headings: Heading[];
	/** Words in the text, code included. */
	words: number;
}

declare module 'vfile' {
	interface DataMap {
		headings?: Heading[];
		words?: number;
	}
}

function rehypeCollect() {
	return (tree: Root, file: VFile) => {
		const headings: Heading[] = [];
		visit(tree, 'element', (node: Element) => {
			if ((node.tagName === 'h2' || node.tagName === 'h3') && typeof node.properties.id === 'string') {
				headings.push({ depth: node.tagName === 'h2' ? 2 : 3, id: node.properties.id, text: toString(node) });
			}
		});
		file.data.headings = headings;
		file.data.words = toString(tree).split(/\s+/).filter(Boolean).length;
	};
}

const processor = unified()
	.use(remarkParse)
	.use(remarkGfm)
	.use(remarkDirective)
	.use(remarkCallouts)
	.use(remarkRehype, { allowDangerousHtml: true })
	.use(rehypeRaw)
	.use(rehypeSlug)
	.use(rehypeCollect)
	.use(rehypeAutolinkHeadings, { behavior: 'wrap' })
	.use(rehypeShiki, {
		themes: { light: 'github-light', dark: 'github-dark' },
		defaultColor: 'light-dark()',
		fallbackLanguage: 'text',
		lazy: true
	})
	.use(rehypeImages)
	.use(rehypeStringify);

/** Renders Markdown to HTML: GFM, callouts, heading anchors, Shiki code blocks, sized images. */
export async function renderMarkdown(source: string, resolveImage?: ImageResolver): Promise<Rendered> {
	const file = await processor.process(new VFile({ value: source, data: { resolveImage } }));
	return {
		html: String(file),
		headings: file.data.headings ?? [],
		words: file.data.words ?? 0
	};
}

/** Minutes to read `words` words, at least one. */
export function readingTime(words: number): number {
	return Math.max(1, Math.round(words / 220));
}
