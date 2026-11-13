declare global {
	/** Name of the selected site, such as `demo`. */
	const __SITE_NAME__: string;
	/** Absolute path of the selected site's folder. Server-side only. */
	const __SITE_DIR__: string;
}

export {};
