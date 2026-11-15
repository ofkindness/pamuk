/** Escapes text for use in XML content and attribute values. */
export function escapeXml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

/** Wraps HTML in a CDATA section; a `]]>` inside it is split so it cannot end the section early. */
export function cdata(html: string): string {
	return `<![CDATA[${html.replace(/]]>/g, ']]]]><![CDATA[>')}]]>`;
}
