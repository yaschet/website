import { readFile } from "node:fs/promises";
import path from "node:path";

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
async function loadLocalFont(fontPath: string) {
	try {
		return await readFile(path.join(/* turbopackIgnore: true */ process.cwd(), fontPath));
	} catch (error) {
		// biome-ignore lint/suspicious/noConsole: Expected OG asset fallback logging
		console.warn(`Failed to load OG font at ${fontPath}:`, error);
		return null;
	}
}

export async function loadOgFonts() {
	const [inter700, inter500, spaceMono] = await Promise.all([
		loadLocalFont("node_modules/@fontsource/inter/files/inter-latin-700-normal.woff"),
		loadLocalFont("node_modules/@fontsource/inter/files/inter-latin-500-normal.woff"),
		loadLocalFont("public/fonts/SpaceMono-Regular.ttf"),
	]);

	return [
		inter700
			? [
					{
						// Register the site sans family name against a static font the OG renderer can parse.
						name: "Space Grotesk",
						data: inter700,
						style: "normal" as const,
						weight: 700 as const,
					},
				]
			: [],
		inter500
			? [
					{
						name: "Space Grotesk",
						data: inter500,
						style: "normal" as const,
						weight: 500 as const,
					},
				]
			: [],
		spaceMono
			? [
					{
						name: "Space Mono",
						data: spaceMono,
						style: "normal" as const,
						weight: 400 as const,
					},
				]
			: [],
	].flat();
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
		const buffer = await readFile(
			path.join(/* turbopackIgnore: true */ process.cwd(), "public/images/avatar.png"),
		);
		return buffer;
	} catch (e) {
		// biome-ignore lint/suspicious/noConsole: Expected error logging
		console.warn("Failed to load avatar local:", e);
		return null;
	}
}

export async function loadAvatarDataUrl() {
	const avatarBuffer = await loadAvatar();
	return avatarBuffer ? `data:image/png;base64,${avatarBuffer.toString("base64")}` : "";
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
		const absolutePath = path.join(
			/* turbopackIgnore: true */ process.cwd(),
			"public",
			cleanPath,
		);

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
