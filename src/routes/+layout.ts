import { dev } from '$app/env';

// Every page is rendered to a file at build time and ships no JavaScript.
// Dev keeps client rendering so that edits hot-reload.
export const prerender = true;
export const csr = dev;
export const trailingSlash = 'always';
