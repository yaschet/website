import { readFile } from "node:fs/promises";
import path from "node:path";
import { cwd } from "node:process";

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════
export const OG_SIZE = {
	width: 1200,
	height: 630,
};

export const OG_CONTENT_TYPE = "image/png";

// Design System Colors (Aligned with globals.css/tailwind)
export const OG_COLORS = {
	surface50: "#fafafa",
	surface100: "#f4f4f5",
	surface200: "#e4e4e7", // Borders
	surface300: "#d4d4d8",
	surface400: "#a1a1aa",
	surface500: "#71717a",
	surface600: "#52525b",
	surface800: "#27272a",
	surface900: "#18181b", // Text Primary
	surface950: "#09090b",
	white: "#ffffff",
	primary: "#18181b", // Default primary text
};

// ═══════════════════════════════════════════════════════════════════════════
// FONT LOADER
// ═══════════════════════════════════════════════════════════════════════════
export async function loadOgFonts() {
	// In production (Vercel), we might need to fetch from URL if file system is restricted,
	// but for local dev/build, reading from node_modules or assets is standard.
	// We will try standard fetch for maximum compatibility.

	const loadFont = async (name: string, weight: 300 | 400 | 500 | 600 | 700) => {
		const url = `https://cdn.jsdelivr.net/npm/@fontsource/${name}/files/${name}-latin-${weight}-normal.woff`;
		const res = await fetch(url);
		return await res.arrayBuffer();
	};

	return [
		{
			name: "Space Grotesk",
			data: await loadFont("space-grotesk", 700),
			style: "normal" as const,
			weight: 700 as const,
		},
		{
			name: "Space Grotesk",
			data: await loadFont("space-grotesk", 500),
			style: "normal" as const,
			weight: 500 as const,
		},
		{
			name: "Space Mono",
			data: await loadFont("space-mono", 400),
			style: "normal" as const,
			weight: 400 as const,
		},
	];
}

// ═══════════════════════════════════════════════════════════════════════════
// ASSET LOADER
// ═══════════════════════════════════════════════════════════════════════════
export async function loadAvatar() {
	try {
		// Use file system for local reliability
		const buffer = await readFile(path.join(cwd(), "public/images/avatar.jpeg"));
		return buffer;
	} catch (e) {
		// biome-ignore lint/suspicious/noConsole: Expected error logging
		console.warn("Failed to load avatar local:", e);
		return null;
	}
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Shared Neo-Swiss Grid Layout Props
 */
export const sharedGridStyles = {
	display: "flex",
	backgroundColor: OG_COLORS.surface50,
	width: "100%",
	height: "100%",
	fontFamily: '"Space Grotesk"',
	// We simulate the grid via absolute positioned lines or flex borders
};
