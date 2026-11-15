import { existsSync } from 'node:fs';
import path from 'node:path';

/** True when the selected site ships this file in its `static/` folder. */
export function hasStaticFile(file: string): boolean {
	return existsSync(path.join(__SITE_DIR__, 'static', file));
}

const TYPES: Record<string, string> = {
	'.avif': 'image/avif',
	'.csv': 'text/csv; charset=utf-8',
	'.gif': 'image/gif',
	'.jpeg': 'image/jpeg',
	'.jpg': 'image/jpeg',
	'.json': 'application/json',
	'.mp4': 'video/mp4',
	'.pdf': 'application/pdf',
	'.png': 'image/png',
	'.svg': 'image/svg+xml',
	'.txt': 'text/plain; charset=utf-8',
	'.webm': 'video/webm',
	'.webp': 'image/webp'
};

export function contentType(file: string): string {
	return TYPES[path.extname(file).toLowerCase()] ?? 'application/octet-stream';
}
