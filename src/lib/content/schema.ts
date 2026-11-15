import { z } from 'zod';

/**
 * A calendar date. Accepts `"2026-04-13"` and an unquoted `2026-04-13`, which
 * some YAML parsers turn into a timestamp, and normalizes both to `YYYY-MM-DD`.
 */
export const dateOnly = z
	.union([z.iso.date(), z.date()])
	.transform((value) => (typeof value === 'string' ? value : value.toISOString().slice(0, 10)));

export const bookSchema = z.object({
	title: z.string(),
	authors: z.array(z.string()).min(1),
	year: z.number().int().optional(),
	isbn: z.string().optional(),
	cover: z.string().optional(),
	rating: z.number().int().min(1).max(5).optional()
});

export const postSchema = z.object({
	title: z.string(),
	description: z.string().max(200),
	date: dateOnly,
	updated: dateOnly.optional(),
	lang: z.string().optional(),
	author: z.string().optional(),
	category: z.string().optional(),
	tags: z.array(z.string()).default([]),
	image: z.string().optional(),
	draft: z.boolean().default(false),
	canonical: z.url().optional(),
	discussion: z.url().optional(),
	book: bookSchema.optional(),
	content: z.string()
});

export const authorSchema = z.object({
	name: z.string(),
	avatar: z.string().optional(),
	links: z.array(z.url()).default([]),
	content: z.string()
});

export const pageSchema = z.object({
	title: z.string(),
	description: z.string(),
	content: z.string()
});
