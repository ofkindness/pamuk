/**
 * Formats a `YYYY-MM-DD` date for readers. The date is read as UTC and printed
 * as UTC, so it never shifts with the build machine's timezone.
 */
export function formatDate(date: string, language: string): string {
	return new Intl.DateTimeFormat(language, {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		timeZone: 'UTC'
	}).format(new Date(`${date}T00:00:00Z`));
}

/** RFC 822 timestamp at midnight UTC, as RSS expects. */
export function rssDate(date: string): string {
	return new Date(`${date}T00:00:00Z`).toUTCString();
}
