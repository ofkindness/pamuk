import { defineConfig } from 'vitest/config';

// Tests cover plain modules (schemas, validation, the Markdown pipeline),
// so they run without the SvelteKit and content plugins.
export default defineConfig({
	test: {
		expect: { requireAssertions: true },
		environment: 'node',
		include: ['tests/**/*.test.ts']
	}
});
