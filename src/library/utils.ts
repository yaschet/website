import { createHash } from "node:crypto";
import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export async function wait(duration: number) {
	return new Promise((resolve) => {
		setTimeout(resolve, duration);
	});
}

export { wait as sleep };

export const generateGravatarUrl: (email: string) => string = (email) => {
	const emailString = email.trim().toLowerCase();
	const hash: string = createHash("sha256").update(emailString).digest("hex");
	return `https://www.gravatar.com/avatar/${hash}?d=404&s=480`;
};

export const generateGravatarProfileUrl: (email: string) => string = (email) => {
	if (!email || email === "") {
		return "https://gravatar.com";
	}

	const emailString = email.trim().toLowerCase();
	const hash: string = createHash("sha256").update(emailString).digest("hex");
	return `https://www.gravatar.com/${hash}`;
};

/**
 * Get the range of items to display on a page.
 *
 * @category Utils/Pagination
 * @param page
 * @param limit
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
 * Check if the text is Arabic.
 * @param text
 */
export const isArabic = (text: string) => {
	const arabicPattern = /[\u0600-\u06FF\u0750-\u077F]/;
	return arabicPattern.test(text);
};

/**
 * Detect the operating system.
 * @returns 'macOS' | 'Windows' | 'Other'
 * @category Utils/OS
 */
export function getOS(): "macOS" | "Windows" | "Other" {
	const userAgent = window.navigator.userAgent;
	if (userAgent.includes("Mac")) {
		return "macOS";
	} else if (userAgent.includes("Win")) {
		return "Windows";
	}
	return "Other";
}
