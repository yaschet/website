import { Space_Grotesk, Space_Mono } from "next/font/google";

/**
 * @file fonts.ts
 * @description
 * Professional typography configuration using Next.js Google Fonts.
 * We utilize Space Grotesk for its engineered, Swiss-style precision in headlines,
 * and Space Mono for technical data and code snippets.
 */

export const fontSans = Space_Grotesk({
	subsets: ["latin"],
	display: "swap",
	variable: "--font-app-sans",
	weight: ["300", "400", "500", "600", "700"],
	// Robust Swiss fallback stack
	fallback: ["system-ui", "-apple-system", "Helvetica Neue", "Arial", "sans-serif"],
});

export const fontMono = Space_Mono({
	subsets: ["latin"],
	display: "swap",
	variable: "--font-app-mono",
	weight: ["400", "700"],
	fallback: ["SF Mono", "ui-monospace", "Monaco", "monospace"],
});

/**
 * Combined font variables to be applied to the root <html> element.
 */
export const fontVariables = `${fontSans.variable} ${fontMono.variable}`;
