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
	const documentRoot =
		root?.ownerDocument.documentElement ??
		(typeof document === "undefined" ? null : document.documentElement);
	const rootFontSize = documentRoot
		? Number.parseFloat(getComputedStyle(documentRoot).fontSize)
		: 16;
	const pixels = (name: string, fallback: number) => {
		const value = style?.getPropertyValue(name).trim() ?? "";
		const amount = Number.parseFloat(value);
		if (!Number.isFinite(amount)) return fallback;
		return value.endsWith("rem") ? amount * rootFontSize : amount;
	};
	const rail = pixels("--gallery-media-rail", compact ? 16 : 24);
	const inset = pixels("--gallery-inset", short ? 8 : compact ? 16 : 24);
	// Use the same content token as CSS: one/two title lines and the desktop caption.
	const fallbackHeadContent = ((short ? 24 : compact ? 40 : 48) * rootFontSize) / 16;
	const head = Math.max(48, pixels("--gallery-head-content", fallbackHeadContent)) + 2 * inset;
	const foot = pixels("--gallery-foot", multiple ? (short ? 64 : compact ? 88 : 112) : 0);
	const gap = pixels("--gallery-gap", short ? 12 : compact ? 16 : 24);
	const zoom =
		zoomable || multiple ? pixels("--gallery-zoom-height", compact ? 52 : 56) + gap : 0;
	return {
		top: pixels("--gallery-safe-top", 0) + head + gap,
		bottom: pixels("--gallery-safe-bottom", 0) + foot + zoom + gap,
		left: pixels("--gallery-safe-left", 0) + rail,
		right: pixels("--gallery-safe-right", 0) + rail,
	};
}
