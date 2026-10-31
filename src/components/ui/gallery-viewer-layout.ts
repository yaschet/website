/** Reserve the attached glass regions and the artwork's responsive side rails. */
export function getGalleryPadding(
	root: HTMLElement | null | undefined,
	viewport: { x: number; y: number },
	multiple: boolean,
	zoomable: boolean,
) {
	const compact = viewport.x < 760;
	const short = viewport.y <= 520;
	const style = root ? getComputedStyle(root) : null;
	const pixels = (name: string, fallback: number) => {
		const value = Number.parseFloat(style?.getPropertyValue(name) ?? "");
		return Number.isFinite(value) ? value : fallback;
	};
	const rail = pixels("--gallery-media-rail", compact ? 16 : 104);
	const head = pixels("--gallery-head", short ? 64 : compact ? 80 : 96);
	const foot = pixels("--gallery-foot", multiple ? (short ? 64 : compact ? 88 : 112) : 0);
	const gap = pixels("--gallery-gap", short ? 12 : compact ? 16 : 24);
	const zoom = zoomable ? pixels("--gallery-zoom-height", 56) + gap : 0;
	return {
		top: pixels("--gallery-safe-top", 0) + head + gap,
		bottom: pixels("--gallery-safe-bottom", 0) + foot + zoom + gap,
		left: rail,
		right: rail,
	};
}
