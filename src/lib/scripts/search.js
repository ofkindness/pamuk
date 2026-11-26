// The search page. Loads the Pagefind index built by `npm run build` and
// renders results into the page. Plain JavaScript on purpose: this file is
// shipped as it is, not bundled.

/**
 * @typedef {{ url: string, excerpt: string, meta: { title?: string } }} Result
 * @typedef {{ results: { data: () => Promise<Result> }[] }} Found
 * @typedef {{ init: () => Promise<void>, debouncedSearch: (query: string) => Promise<Found | null> }} Pagefind
 */

/** @template {Element} T @param {ParentNode} parent @param {string} selector @returns {T} */
function find(parent, selector) {
	const element = parent.querySelector(selector);
	if (!element) throw new Error(`search: ${selector} is missing from the page`);
	return /** @type {T} */ (element);
}

/** @type {HTMLElement} */
const root = find(document, '[data-search]');
/** @type {HTMLInputElement} */
const input = find(root, 'input');
/** @type {HTMLElement} */
const status = find(root, '[data-search-status]');
/** @type {HTMLElement} */
const list = find(root, '[data-search-results]');

/** @param {Result[]} results @param {string} query */
function render(results, query) {
	list.replaceChildren(
		...results.map((result) => {
			const item = document.createElement('li');

			const link = document.createElement('a');
			link.href = result.url;
			link.textContent = result.meta.title ?? result.url;

			// Pagefind's excerpt is escaped text with <mark> around the matches.
			const excerpt = document.createElement('p');
			excerpt.innerHTML = result.excerpt;

			item.append(link, excerpt);
			return item;
		})
	);
	if (results.length === 0) status.textContent = `Nothing found for “${query}”.`;
	else status.textContent = results.length === 1 ? '1 result' : `${results.length} results`;
}

/** @param {Pagefind} pagefind */
async function search(pagefind) {
	const query = input.value.trim();
	const url = new URL(location.href);
	if (query) url.searchParams.set('q', query);
	else url.searchParams.delete('q');
	history.replaceState(null, '', url);

	if (!query) {
		list.replaceChildren();
		status.textContent = '';
		return;
	}
	const found = await pagefind.debouncedSearch(query);
	// null means a newer keystroke replaced this search.
	if (found === null) return;
	render(await Promise.all(found.results.slice(0, 20).map((result) => result.data())), query);
}

try {
	/** @type {Pagefind} */
	const pagefind = await import(/* @vite-ignore */ root.dataset.search ?? '');
	await pagefind.init();

	input.addEventListener('input', () => search(pagefind));
	input.value = new URL(location.href).searchParams.get('q') ?? '';
	if (input.value) search(pagefind);
} catch {
	status.textContent = 'Search works on the built site: run “npm run build”, then “npm run preview”.';
	input.disabled = true;
}
