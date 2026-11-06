"use client";

export type DotGridLength = number | string;
export type DotGridOrigin = "center" | "inset" | "registered";

export function computeGridAxis(
	size: number,
	step: number,
	minInset: number,
	origin: DotGridOrigin,
) {
	if (origin === "registered") {
		// Keep the leading origin fixed; any remainder stays at the trailing edge.
		return {
			count: Math.max(0, Math.floor((size - minInset * 2) / step) + 1),
			offset: minInset,
		};
	}
	const usable = Math.max(size - minInset * 2, step);
	const count = Math.max(2, Math.floor(usable / step) + 1);
	const span = count * step;
	const offset =
		origin === "inset" ? minInset + (usable - (count - 1) * step) / 2 : (size - span) / 2;
	return { count, offset };
}

export function resolveLength(node: HTMLElement, value: DotGridLength, fallback: number) {
	if (typeof value === "number") return value;

	const probe = document.createElement("div");
	probe.style.position = "absolute";
	probe.style.visibility = "hidden";
	probe.style.pointerEvents = "none";
	probe.style.inlineSize = value;
	probe.style.blockSize = "0";
	probe.style.padding = "0";
	probe.style.border = "0";

	node.appendChild(probe);
	const resolved = probe.getBoundingClientRect().width;
	node.removeChild(probe);

	return Number.isFinite(resolved) ? resolved : fallback;
}
