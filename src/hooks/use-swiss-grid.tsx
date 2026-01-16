"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { calculateGridDimensions, type GridDimensions } from "@/src/lib/grid";

/**
 * useSwissGrid - Hook for dynamic grid dimension calculation
 *
 * This hook calculates pixel-perfect dash dimensions based on container width.
 * It uses ResizeObserver for efficient updates and requestAnimationFrame for
 * smooth rendering.
 *
 * @param containerRef - React ref to the container element to measure
 * @returns GridDimensions or null if not yet calculated
 *
 * @example
 * const containerRef = useRef<HTMLDivElement>(null);
 * const dimensions = useSwissGrid(containerRef);
 *
 * if (dimensions) {
 *   console.log(`Dash: ${dimensions.dashSize}px, Gap: ${dimensions.gapSize}px`);
 * }
 */
export function useSwissGrid(
	containerRef: React.RefObject<HTMLElement | null>,
): GridDimensions | null {
	const [dimensions, setDimensions] = useState<GridDimensions | null>(null);

	const recalculate = useCallback(() => {
		if (!containerRef.current) return;

		const width = containerRef.current.offsetWidth;
		if (width > 0) {
			const newDimensions = calculateGridDimensions(width);
			setDimensions(newDimensions);
		}
	}, [containerRef]);

	useEffect(() => {
		if (!containerRef.current) return;

		// Initial calculation
		recalculate();

		// ResizeObserver for responsive updates
		const observer = new ResizeObserver(() => {
			requestAnimationFrame(recalculate);
		});

		observer.observe(containerRef.current);

		return () => observer.disconnect();
	}, [recalculate, containerRef]);

	return dimensions;
}

/**
 * useSwissGridCSS - Hook that returns CSS gradient strings for immediate use
 *
 * This is a convenience hook that returns ready-to-use CSS gradient strings
 * for horizontal and vertical dashed lines.
 *
 * @param containerRef - React ref to the container element to measure
 * @param color - CSS color value for the dashes (default: uses CSS variable)
 * @returns Object with horizontalGradient and verticalGradient strings, or null
 */
export function useSwissGridCSS(
	containerRef: React.RefObject<HTMLElement | null>,
	color: string = "var(--swiss-grid-color, oklch(0 0 0 / 0.1))",
): { horizontalGradient: string; verticalGradient: string } | null {
	const dimensions = useSwissGrid(containerRef);

	if (!dimensions) return null;

	const { dashSize, cycleSize } = dimensions;

	return {
		horizontalGradient: `repeating-linear-gradient(
      to right,
      ${color} 0px,
      ${color} ${dashSize}px,
      transparent ${dashSize}px,
      transparent ${cycleSize}px
    )`,
		verticalGradient: `repeating-linear-gradient(
      to bottom,
      ${color} 0px,
      ${color} ${dashSize}px,
      transparent ${dashSize}px,
      transparent ${cycleSize}px
    )`,
	};
}

/**
 * SwissHorizontalLine - Inline component for dynamic horizontal borders
 *
 * A lightweight component that calculates its own dash pattern based on width.
 * Use this instead of the CSS class for pixel-perfect alignment.
 */
export function SwissHorizontalLine({
	className = "",
	position = "bottom",
}: {
	className?: string;
	position?: "top" | "bottom";
}) {
	const ref = useRef<HTMLDivElement>(null);
	const dimensions = useSwissGrid(ref);

	const gradient = dimensions
		? `repeating-linear-gradient(
        to right,
        var(--swiss-grid-color, oklch(0 0 0 / 0.1)) 0px,
        var(--swiss-grid-color, oklch(0 0 0 / 0.1)) ${dimensions.dashSize}px,
        transparent ${dimensions.dashSize}px,
        transparent ${dimensions.cycleSize}px
      )`
		: "transparent";

	return (
		<div
			ref={ref}
			className={`absolute left-0 right-0 h-px ${
				position === "top" ? "top-0" : "bottom-0"
			} ${className}`}
			style={{ background: gradient }}
			aria-hidden="true"
		/>
	);
}

export default useSwissGrid;
