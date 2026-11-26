import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';
import { root } from './site.ts';

/**
 * Serves build/ the way a static host does: folders answer with their
 * index.html, unknown addresses get 404.html with status 404, and BASE_PATH
 * mounts the site in a subfolder. It shows exactly what will be deployed,
 * including the search index, which the dev server does not have.
 */
const build = path.join(root, 'build');
const base = (process.env.BASE_PATH ?? '').replace(/\/+$/, '');
const port = Number(process.env.PORT ?? 4173);

const TYPES: Record<string, string> = {
	'.avif': 'image/avif',
	'.css': 'text/css; charset=utf-8',
	'.gif': 'image/gif',
	'.html': 'text/html; charset=utf-8',
	'.ico': 'image/x-icon',
	'.jpeg': 'image/jpeg',
	'.jpg': 'image/jpeg',
	'.js': 'text/javascript; charset=utf-8',
	'.json': 'application/json',
	'.png': 'image/png',
	'.svg': 'image/svg+xml',
	'.txt': 'text/plain; charset=utf-8',
	'.wasm': 'application/wasm',
	'.webp': 'image/webp',
	'.woff2': 'font/woff2',
	'.xml': 'application/xml; charset=utf-8'
};

if (!existsSync(path.join(build, 'index.html'))) {
	console.error('build/ not found: run `npm run build` first.');
	process.exit(1);
}

const isFile = (file: string) => statSync(file, { throwIfNoEntry: false })?.isFile() ?? false;

createServer((request, response) => {
	const send = (file: string, status = 200) => {
		response.writeHead(status, { 'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream' });
		if (request.method === 'HEAD') response.end();
		else createReadStream(file).pipe(response);
	};
	const notFound = () => send(path.join(build, '404.html'), 404);

	let pathname: string;
	try {
		pathname = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname);
	} catch {
		return notFound();
	}

	if (base && pathname !== base && !pathname.startsWith(`${base}/`)) return notFound();
	const file = path.join(build, pathname.slice(base.length));
	// A decoded path can contain "..": never leave build/.
	if (file !== build && !file.startsWith(build + path.sep)) return notFound();

	if (isFile(file)) return send(file);
	if (isFile(path.join(file, 'index.html'))) {
		if (pathname.endsWith('/')) return send(path.join(file, 'index.html'));
		response.writeHead(308, { location: `${pathname}/` });
		return response.end();
	}
	notFound();
}).listen(port, () => {
	console.log(`Serving build/ at http://localhost:${port}${base}/`);
});
