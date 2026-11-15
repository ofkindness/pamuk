/** A tag or category declared by a site. The slug is its URL segment. */
export interface Term {
	slug: string;
	name: string;
	description?: string;
}

export interface NavItem {
	title: string;
	/** Root-relative path (`/archive/`) or an absolute URL. */
	href: string;
}

export type Analytics =
	| { provider: 'none' }
	| { provider: 'goatcounter'; endpoint: string };

export interface SiteInput {
	/** Public URL of the home page, without a trailing slash. */
	url: string;
	title: string;
	description: string;
	/** BCP 47 language tag, such as `en` or `ru`. */
	language: string;
	/** Author slug used by posts that name no author. */
	defaultAuthor?: string;
	/** Posts shown on the home page. */
	homePosts?: number;
	/** Listing page size, used once pagination exists. */
	postsPerPage?: number;
	categories?: Term[];
	tags?: Term[];
	nav?: NavItem[];
	analytics?: Analytics;
}

export type SiteConfig = Required<Omit<SiteInput, 'defaultAuthor'>> & Pick<SiteInput, 'defaultAuthor'>;

/** Fills in the defaults of a site's configuration. */
export function defineSite(input: SiteInput): SiteConfig {
	return {
		homePosts: 10,
		postsPerPage: 20,
		categories: [],
		tags: [],
		nav: [],
		analytics: { provider: 'none' },
		...input,
		url: input.url.replace(/\/+$/, '')
	};
}
