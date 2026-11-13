import { describe, expect, it } from 'vitest';
import { dateOnly, postSchema } from '../src/lib/content/schema.ts';

const minimal = { title: 'T', description: 'D', date: '2026-04-13', content: 'Body' };

describe('dateOnly', () => {
	it('accepts a quoted date', () => {
		expect(dateOnly.parse('2026-04-13')).toBe('2026-04-13');
	});

	it('accepts a date that YAML already parsed', () => {
		expect(dateOnly.parse(new Date('2026-04-13T00:00:00Z'))).toBe('2026-04-13');
	});

	it('rejects a date with a time and an impossible date', () => {
		expect(dateOnly.safeParse('2026-04-13T10:00:00Z').success).toBe(false);
		expect(dateOnly.safeParse('2026-02-30').success).toBe(false);
	});
});

describe('postSchema', () => {
	it('needs only title, description and date', () => {
		const post = postSchema.parse(minimal);
		expect(post.tags).toEqual([]);
		expect(post.draft).toBe(false);
		expect(post.author).toBeUndefined();
	});

	it('limits the description to 200 characters', () => {
		expect(postSchema.safeParse({ ...minimal, description: 'x'.repeat(201) }).success).toBe(false);
	});

	it('requires full URLs for canonical and discussion', () => {
		expect(postSchema.safeParse({ ...minimal, discussion: '/thread/1' }).success).toBe(false);
		expect(postSchema.safeParse({ ...minimal, discussion: 'https://forum.example.com/t/1' }).success).toBe(true);
	});

	it('checks book fields', () => {
		const book = { title: 'B', authors: ['A'], rating: 5 };
		expect(postSchema.safeParse({ ...minimal, book }).success).toBe(true);
		expect(postSchema.safeParse({ ...minimal, book: { ...book, rating: 6 } }).success).toBe(false);
		expect(postSchema.safeParse({ ...minimal, book: { ...book, authors: [] } }).success).toBe(false);
	});
});
