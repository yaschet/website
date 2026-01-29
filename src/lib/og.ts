export const OG_SIZE = {
	width: 1200,
	height: 630,
};

export const OG_CONTENT_TYPE = "image/png";

// Strict Design System Token Mapping (Zinc/Surface)
// Since ImageResponse doesn't support CSS vars, we map them here centrally.
export const OG_COLORS = {
	surface50: "#fafafa", // zinc-50
	surface100: "#f4f4f5", // zinc-100
	surface200: "#e4e4e7", // zinc-200
	surface300: "#d4d4d8", // zinc-300
	surface500: "#71717a", // zinc-500
	surface800: "#27272a", // zinc-800
	surface900: "#18181b", // zinc-900 (Deep Zinc)
	white: "#ffffff",
};

/**
 * Loads the brand fonts (Space Grotesk & Space Mono) from a reliable CDN.
 * Returns the font array formatting expected by ImageResponse options.
 */
export async function loadOgFonts() {
	const [groteskBold, groteskMedium, monoRegular] = await Promise.all([
		fetch(
			new URL(
				"https://cdn.jsdelivr.net/npm/@fontsource/space-grotesk@5.0.13/files/space-grotesk-latin-700-normal.woff",
			),
		).then((res) => res.arrayBuffer()),
		fetch(
			new URL(
				"https://cdn.jsdelivr.net/npm/@fontsource/space-grotesk@5.0.13/files/space-grotesk-latin-500-normal.woff",
			),
		).then((res) => res.arrayBuffer()),
		fetch(
			new URL(
				"https://cdn.jsdelivr.net/npm/@fontsource/space-mono@5.0.13/files/space-mono-latin-400-normal.woff",
			),
		).then((res) => res.arrayBuffer()),
	]);

	return [
		{
			name: "Space Grotesk",
			data: groteskBold,
			style: "normal" as const,
			weight: 700 as const,
		},
		{
			name: "Space Grotesk",
			data: groteskMedium,
			style: "normal" as const,
			weight: 500 as const,
		},
		{
			name: "Space Mono",
			data: monoRegular,
			style: "normal" as const,
			weight: 400 as const,
		},
	];
}
