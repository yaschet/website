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
	surface700: "#3f3f46", // Required for contrast
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

/**
 * Loads the user avatar from the local file system.
 */
export async function loadAvatar() {
	try {
		// Use file system for local reliability
		const buffer = await readFile(path.join(cwd(), "public/images/avatar.png"));
		return buffer;
	} catch (e) {
		// biome-ignore lint/suspicious/noConsole: Expected error logging
		console.warn("Failed to load avatar local:", e);
		return null;
	}
}

/**
 * Loads a project image from the public directory.
 * Path should be relative to 'public', e.g., '/images/verto/screenshot.png'
 */
export async function loadProjectImage(imagePath: string) {
	if (!imagePath) return null;

	try {
		// Clean the path (remove leading slash if present for path.join)
		const cleanPath = imagePath.startsWith("/") ? imagePath.slice(1) : imagePath;
		const absolutePath = path.join(cwd(), "public", cleanPath);

		const buffer = await readFile(absolutePath);
		return buffer;
	} catch (e) {
		// biome-ignore lint/suspicious/noConsole: Expected error logging
		console.warn(`Failed to load project image at ${imagePath}:`, e);
		return null;
	}
}

// ═══════════════════════════════════════════════════════════════════════════
// LAYOUT & GRID SYSTEM (Neo-Swiss Architecture)
// ═══════════════════════════════════════════════════════════════════════════

export const OG_LAYOUT = {
	// Base mathematical unit
	UNIT: 4,

	// Sidebar (Brand Anchor)
	SIDEBAR_WIDTH: 340,

	// Vertical Header standard
	HEADER_HEIGHT: 140,

	// Standard Island Padding
	PADDING: 80, // Expansive breathing room

	// Secondary Alignment Padding
	PADDING_SM: 40,

	// Proof/Footer Row Height
	FOOTER_HEIGHT: 120,

	// Borders
	BORDER: `1px solid ${OG_COLORS.surface200}`,
	BORDER_DARK: `1px solid ${OG_COLORS.surface800}`,

	// Font Sizes (Adjusted for safety/no-overflow)
	FONT_HEADLINE: 64, // Slightly smaller for 2-4 word dominance
	FONT_SUBHEAD: 24,
	FONT_BODY: 18,
	FONT_MONO: 14,
	FONT_LABEL: 12,

	// Colors Shorthand
	BG: OG_COLORS.surface50,
	BG_DARK: OG_COLORS.surface950,
};

/**
 * Shared Neo-Swiss Grid Layout Props
 */
export const sharedGridStyles = {
	display: "flex",
	backgroundColor: OG_LAYOUT.BG,
	width: "100%",
	height: "100%",
	fontFamily: '"Space Grotesk"',
};
