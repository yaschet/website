import { format, parseISO } from "date-fns";

/**
 * Safely formats a date string (ISO) to a localized string.
 * This helper avoids direct `new Date()` calls in Server Components to prevent
 * Next.js from opting out of static rendering or throwing Prerender errors.
 */
export function formatDate(dateString: string): string {
	try {
		// Parse ISO string derived from Contentlayer
		const date = parseISO(dateString);
		return format(date, "MMMM yyyy");
	} catch (_e) {
		return "";
	}
}
