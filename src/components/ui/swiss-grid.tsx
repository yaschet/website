"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { calculateGridDimensions, type GridDimensions, applyGridProperties } from "@/src/lib/grid";
import { springs } from "@/src/lib/physics";
import { useReveal } from "@/src/components/providers/reveal-provider";

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const GRID_COLOR_LIGHT = "oklch(0 0 0 / 0.1)";
const GRID_COLOR_DARK = "oklch(1 0 0 / 0.1)";

// ═══════════════════════════════════════════════════════════════════════════
// SWISS GRID COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface SwissGridProps {
	/** Additional CSS classes */
	className?: string;
}

/**
 * SwissGrid - GPU-optimized, mathematically-perfect grid overlay
 *
 * This component renders:
 * - Two vertical dashed rails at the edges of the max-w-3xl container
 * - Coordinates with horizontal borders on sections for perfect crosshairs
 *
 * Key features:
 * - ResizeObserver for responsive recalculation
 * - CSS custom properties for GPU-accelerated rendering
 * - Framer Motion for smooth reveal animation
 * - Perfect crosshair alignment at any width
 */
export function SwissGrid({ className = "" }: SwissGridProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [dimensions, setDimensions] = useState<GridDimensions | null>(null);
	const { phase } = useReveal();
	const shouldReduceMotion = useReducedMotion();

	// Calculate grid dimensions on mount and resize
	const recalculate = useCallback(() => {
		if (!containerRef.current) return;

		const width = containerRef.current.offsetWidth;
		const newDimensions = calculateGridDimensions(width);
		setDimensions(newDimensions);

		// Apply CSS custom properties for use in children/siblings
		applyGridProperties(containerRef.current, newDimensions);
	}, []);

	useEffect(() => {
		if (!containerRef.current) return;

		// Initial calculation
		recalculate();

		// ResizeObserver for responsive updates
		const observer = new ResizeObserver(() => {
			// Use requestAnimationFrame for smooth updates
			requestAnimationFrame(recalculate);
		});

		observer.observe(containerRef.current);

		return () => observer.disconnect();
	}, [recalculate]);

	// Animation gate
	const isVisible = phase >= 0;

	return (
		<motion.div
			className={`pointer-events-none fixed inset-0 z-50 ${className}`}
			initial={{ opacity: 0 }}
			animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
			transition={springs.responsive}
			aria-hidden="true"
		>
			{/* Centered container matching content width - ref goes here */}
			<div ref={containerRef} className="relative mx-auto h-full max-w-3xl">
				{dimensions && (
					<>
						{/* Left vertical rail */}
						<VerticalRail
							position="left"
							dimensions={dimensions}
							animate={!shouldReduceMotion}
						/>
						{/* Right vertical rail */}
						<VerticalRail
							position="right"
							dimensions={dimensions}
							animate={!shouldReduceMotion}
						/>
					</>
				)}
			</div>
		</motion.div>
	);
}

// ═══════════════════════════════════════════════════════════════════════════
// VERTICAL RAIL COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface VerticalRailProps {
	position: "left" | "right";
	dimensions: GridDimensions;
	animate?: boolean;
}

function VerticalRail({ position, dimensions, animate = true }: VerticalRailProps) {
	const { dashSize, cycleSize } = dimensions;

	// Generate gradient with calculated dimensions
	const gradient = `repeating-linear-gradient(
    to bottom,
    var(--grid-color) 0px,
    var(--grid-color) ${dashSize}px,
    transparent ${dashSize}px,
    transparent ${cycleSize}px
  )`;

	return (
		<motion.div
			className="absolute top-0 bottom-0 w-px"
			style={{
				[position]: 0,
				background: gradient,
				// CSS custom property for color - allows dark mode without re-render
				// @ts-expect-error - CSS custom property
				"--grid-color": `var(--swiss-grid-color, ${GRID_COLOR_LIGHT})`,
			}}
			initial={animate ? { scaleY: 0 } : undefined}
			animate={{ scaleY: 1 }}
			transition={springs.gentle}
		/>
	);
}

// ═══════════════════════════════════════════════════════════════════════════
// HORIZONTAL BORDER COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface SwissHorizontalBorderProps {
	/** Position relative to parent */
	position?: "top" | "bottom";
	/** Additional CSS classes */
	className?: string;
}

/**
 * SwissHorizontalBorder - Dynamic horizontal dashed line
 *
 * This component recalculates its dash pattern based on its own width,
 * ensuring perfect alignment at the edges (where vertical rails are).
 */
export function SwissHorizontalBorder({
	position = "bottom",
	className = "",
}: SwissHorizontalBorderProps) {
	const ref = useRef<HTMLDivElement>(null);
	const [gradient, setGradient] = useState<string>("");

	useEffect(() => {
		if (!ref.current) return;

		const calculateGradient = () => {
			const width = ref.current?.offsetWidth ?? 0;
			if (width === 0) return;

			const dimensions = calculateGridDimensions(width);
			const { dashSize, cycleSize } = dimensions;

			// Generate gradient that aligns perfectly at edges
			const newGradient = `repeating-linear-gradient(
        to right,
        var(--swiss-grid-color, ${GRID_COLOR_LIGHT}) 0px,
        var(--swiss-grid-color, ${GRID_COLOR_LIGHT}) ${dashSize}px,
        transparent ${dashSize}px,
        transparent ${cycleSize}px
      )`;

			setGradient(newGradient);
		};

		calculateGradient();

		const observer = new ResizeObserver(() => {
			requestAnimationFrame(calculateGradient);
		});

		observer.observe(ref.current);

		return () => observer.disconnect();
	}, []);

	return (
		<div
			ref={ref}
			className={`absolute left-0 right-0 h-px ${
				position === "top" ? "top-0" : "bottom-0"
			} ${className}`}
			style={{
				background: gradient,
			}}
			aria-hidden="true"
		/>
	);
}

// ═══════════════════════════════════════════════════════════════════════════
// CSS VARIABLE INJECTION (for dark mode)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * SwissGridStyles - Injects CSS custom properties for the grid
 *
 * This component should be rendered once at the app root level.
 * It provides the --swiss-grid-color variable for light/dark mode.
 */
export function SwissGridStyles() {
	return (
		<style
			dangerouslySetInnerHTML={{
				__html: `
          :root {
            --swiss-grid-color: ${GRID_COLOR_LIGHT};
          }
          .dark, [data-theme="dark"] {
            --swiss-grid-color: ${GRID_COLOR_DARK};
          }
        `,
			}}
		/>
	);
}

export default SwissGrid;
