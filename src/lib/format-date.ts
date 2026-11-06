import { format, parseISO } from "date-fns";

/**
 * Formats an ISO date as month and year, preserving an authored year-only date.
 * This helper avoids direct `new Date()` calls in Server Components to prevent
 * Next.js from opting out of static rendering or throwing Prerender errors.
 */
export function formatDate(dateString: string): string {
	if (/^\d{4}$/.test(dateString)) return dateString;

	try {
		const date = parseISO(dateString);
		return format(date, "MMMM yyyy");
	} catch (_e) {
		return "";
	}
}
