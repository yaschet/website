/**
 * Core utility functions for the design system.
 *
 * @remarks
 * This module exports common utilities used throughout the application.
 * All functions are tree-shakeable and have no side effects.
 *
 * @public
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind CSS classes with proper precedence handling.
 *
 * @param inputs - Class values to merge (strings, arrays, objects, or conditionals).
 * @returns A single merged class string with conflicts resolved.
 *
 * @example
 * ```tsx
 * cn("p-4 bg-red-500", isActive && "bg-blue-500")
 * // Returns "p-4 bg-blue-500" when isActive is true
 * ```
 *
 * @public
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Delays execution for a specified duration.
 *
 * @param duration - Time to wait in milliseconds.
 * @returns A promise that resolves after the duration.
 *
 * @public
 */
export async function wait(duration: number): Promise<void> {
	return new Promise((resolve) => {
		setTimeout(resolve, duration);
	});
}

export { wait as sleep };

/**
 * Calculates pagination range for database queries.
 *
 * @param page - Current page number (0-indexed).
 * @param limit - Number of items per page.
 * @returns An object with `start` and `end` indices.
 *
 * @public
 */
export function getRange(page: number, limit: number) {
	const from = page;
	const to = page + limit - 1;

	return {
		start: from,
		end: to,
	};
}

/**
 * Checks if text contains Arabic characters.
 *
 * @param text - The string to test.
 * @returns `true` if the text contains Arabic script.
 *
 * @public
 */
export const isArabic = (text: string): boolean => {
	const arabicPattern = /[\u0600-\u06FF\u0750-\u077F]/;
	return arabicPattern.test(text);
};

/**
 * Detects the current operating system.
 *
 * @returns The detected OS: `'macOS'`, `'Windows'`, or `'Other'`.
 *
 * @public
 */
export function getOS(): "macOS" | "Windows" | "Other" {
	const userAgent = window.navigator.userAgent;
	if (userAgent.includes("Mac")) {
		return "macOS";
	}
	if (userAgent.includes("Win")) {
		return "Windows";
	}
	return "Other";
}
