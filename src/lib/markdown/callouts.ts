import type { Paragraph, Root } from 'mdast';
import type { ContainerDirective, LeafDirective, TextDirective } from 'mdast-util-directive';
import { visit } from 'unist-util-visit';

/** Container directives that render as callouts, with their default titles. */
export const CALLOUTS: Record<string, string> = {
	note: 'Note',
	tip: 'Tip',
	important: 'Important',
	warning: 'Warning',
	caution: 'Caution'
};

/**
 * Turns `:::note` blocks into `<aside class="callout callout-note">` with a
 * title line. `:::note[Custom title]` overrides the title.
 *
 * Text and leaf directives are not used by pamuk, so they are put back as the
 * text the author typed: otherwise "see:this" would lose ":this".
 */
export function remarkCallouts() {
	return (tree: Root) => {
		visit(tree, (node, index, parent) => {
			if (node.type === 'containerDirective') {
				const directive = node as ContainerDirective;
				const defaultTitle = CALLOUTS[directive.name];
				if (!defaultTitle) return;

				const first = directive.children[0];
				let title: Paragraph;
				if (first?.type === 'paragraph' && first.data?.directiveLabel) {
					title = first;
				} else {
					title = { type: 'paragraph', children: [{ type: 'text', value: defaultTitle }] };
					directive.children.unshift(title);
				}
				title.data = { ...title.data, hProperties: { className: ['callout-title'] } };
				directive.data = {
					...directive.data,
					hName: 'aside',
					hProperties: { className: ['callout', `callout-${directive.name}`] }
				};
				return;
			}

			if ((node.type === 'textDirective' || node.type === 'leafDirective') && parent && index !== undefined) {
				const directive = node as TextDirective | LeafDirective;
				const marker = node.type === 'textDirective' ? ':' : '::';
				const label = directive.children.length > 0;
				parent.children.splice(
					index,
					1,
					{ type: 'text', value: `${marker}${directive.name}${label ? '[' : ''}` },
					...(directive.children as never[]),
					...(label ? [{ type: 'text', value: ']' } as never] : [])
				);
				return index;
			}
		});
	};
}
