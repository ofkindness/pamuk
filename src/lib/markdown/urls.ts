const URL_ATTRIBUTE = /(\s(?:href|src|poster)=")([^"]*)(")/g;

/** Applies `fn` to every `href`, `src` and `poster` value in HTML produced by the Markdown pipeline. */
export function rewriteUrls(html: string, fn: (url: string) => string): string {
	return html.replace(URL_ATTRIBUTE, (_, before: string, url: string, after: string) => before + fn(url) + after);
}

const isRootRelative = (url: string) => url.startsWith('/') && !url.startsWith('//');

/** Adds the site's base path to root-relative URLs, for sites served from a subfolder. */
export function withBase(html: string, base: string): string {
	if (!base) return html;
	return rewriteUrls(html, (url) => (isRootRelative(url) ? base + url : url));
}

/**
 * Makes every URL absolute, for feeds: readers show the HTML away from the
 * page it came from. `siteUrl` is the public URL of the home page and
 * `pageUrl` the public URL of the page the HTML belongs to.
 */
export function absolutize(html: string, siteUrl: string, pageUrl: string): string {
	return rewriteUrls(html, (url) => {
		if (isRootRelative(url)) return siteUrl + url;
		try {
			return new URL(url, pageUrl).href;
		} catch {
			return url;
		}
	});
}

/**
 * Where a file named in frontmatter (a share image, a book cover, an avatar)
 * is served: a full URL stays as it is, `/x.png` is a file under `static/`,
 * and anything else sits beside the document at `pagePath`.
 */
export function filePath(src: string, pagePath: string): string {
	if (/^https?:\/\//.test(src) || src.startsWith('/')) return src;
	return pagePath + src;
}
