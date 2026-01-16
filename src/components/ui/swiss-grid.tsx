"use client";

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
	type ReactNode,
} from "react";
import { motion, useReducedMotion } from "framer-motion";
import { calculateGridDimensions, type GridDimensions } from "@/src/lib/grid";
import { springs } from "@/src/lib/physics";
import { useReveal } from "@/src/components/providers/reveal-provider";

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const GRID_COLOR_LIGHT = "oklch(0 0 0 / 0.1)";
const GRID_COLOR_DARK = "oklch(1 0 0 / 0.1)";

// ═══════════════════════════════════════════════════════════════════════════
// SWISS GRID CONTEXT
// ═══════════════════════════════════════════════════════════════════════════

interface SwissGridContextValue {
	/** Calculated grid dimensions */
	dimensions: GridDimensions | null;
	/** Container width in pixels */
	containerWidth: number;
	/** Offset from viewport left edge to container left edge */
	containerOffset: number;
}

const SwissGridContext = createContext<SwissGridContextValue>({
	dimensions: null,
	containerWidth: 0,
	containerOffset: 0,
});

export function useSwissGridContext() {
	return useContext(SwissGridContext);
}

// ═══════════════════════════════════════════════════════════════════════════
// SWISS GRID PROVIDER + VERTICAL RAILS
// ═══════════════════════════════════════════════════════════════════════════

interface SwissGridProps {
	children?: ReactNode;
	className?: string;
}

/**
 * SwissGrid - GPU-optimized, mathematically-perfect grid overlay
 *
 * This component provides context with grid dimensions and renders vertical rails.
 * Child components (like SwissHorizontalLine) consume the context for alignment.
 */
export function SwissGrid({ children, className = "" }: SwissGridProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [dimensions, setDimensions] = useState<GridDimensions | null>(null);
	const [containerOffset, setContainerOffset] = useState(0);
	const [containerWidth, setContainerWidth] = useState(0);
	const { phase } = useReveal();
	const shouldReduceMotion = useReducedMotion();

	const recalculate = useCallback(() => {
		if (!containerRef.current) return;

		const rect = containerRef.current.getBoundingClientRect();
		const width = rect.width;
		const offset = rect.left;

		const newDimensions = calculateGridDimensions(width);
		setDimensions(newDimensions);
		setContainerWidth(width);
		setContainerOffset(offset);
	}, []);

	useEffect(() => {
		if (!containerRef.current) return;

		recalculate();

		const observer = new ResizeObserver(() => {
			requestAnimationFrame(recalculate);
		});

		observer.observe(containerRef.current);

		// Also recalculate on scroll (in case of horizontal scroll affecting offset)
		window.addEventListener("resize", recalculate);

		return () => {
			observer.disconnect();
			window.removeEventListener("resize", recalculate);
		};
	}, [recalculate]);

	const isVisible = phase >= 0;

	const contextValue: SwissGridContextValue = {
		dimensions,
		containerWidth,
		containerOffset,
	};

	return (
		<SwissGridContext.Provider value={contextValue}>
			{/* Vertical Rails Overlay */}
			<motion.div
				className={`pointer-events-none fixed inset-0 z-50 ${className}`}
				initial={{ opacity: 0 }}
				animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
				transition={springs.responsive}
				aria-hidden="true"
			>
				<div ref={containerRef} className="relative mx-auto h-full max-w-3xl">
					{dimensions && (
						<>
							<VerticalRail
								position="left"
								dimensions={dimensions}
								animate={!shouldReduceMotion}
							/>
							<VerticalRail
								position="right"
								dimensions={dimensions}
								animate={!shouldReduceMotion}
							/>
						</>
					)}
				</div>
			</motion.div>
			{children}
		</SwissGridContext.Provider>
	);
}

// ═══════════════════════════════════════════════════════════════════════════
// VERTICAL RAIL
// ═══════════════════════════════════════════════════════════════════════════

interface VerticalRailProps {
	position: "left" | "right";
	dimensions: GridDimensions;
	animate?: boolean;
}

function VerticalRail({ position, dimensions, animate = true }: VerticalRailProps) {
	const { dashSize, cycleSize } = dimensions;

	const gradient = `repeating-linear-gradient(
		to bottom,
		var(--swiss-grid-color, ${GRID_COLOR_LIGHT}) 0px,
		var(--swiss-grid-color, ${GRID_COLOR_LIGHT}) ${dashSize}px,
		transparent ${dashSize}px,
		transparent ${cycleSize}px
	)`;

	return (
		<motion.div
			className="absolute top-0 bottom-0 w-px"
			style={{
				[position]: 0,
				background: gradient,
			}}
			initial={animate ? { scaleY: 0 } : undefined}
			animate={{ scaleY: 1 }}
			transition={springs.gentle}
		/>
	);
}

// ═══════════════════════════════════════════════════════════════════════════
// HORIZONTAL LINE (FULL-WIDTH WITH PERFECT ALIGNMENT)
// ═══════════════════════════════════════════════════════════════════════════

interface SwissHorizontalLineProps {
	className?: string;
}

/**
 * SwissHorizontalLine - Full-width horizontal dashed line with perfect crosshairs
 *
 * This component spans 100% width but aligns its dash pattern to match
 * the vertical rails using the grid context. The key is offsetting the
 * background-position so dashes land exactly at the container edges.
 */
export function SwissHorizontalLine({ className = "" }: SwissHorizontalLineProps) {
	const { dimensions, containerOffset } = useSwissGridContext();

	if (!dimensions) {
		return <div className={`h-px w-full ${className}`} />;
	}

	const { dashSize, cycleSize } = dimensions;

	// Calculate the offset needed so the pattern aligns at container edges
	// The pattern should have a dash (not gap) at containerOffset pixels from left
	// We shift the pattern so it starts at the container edge
	const patternOffset = containerOffset % cycleSize;

	const gradient = `repeating-linear-gradient(
		to right,
		var(--swiss-grid-color, ${GRID_COLOR_LIGHT}) 0px,
		var(--swiss-grid-color, ${GRID_COLOR_LIGHT}) ${dashSize}px,
		transparent ${dashSize}px,
		transparent ${cycleSize}px
	)`;

	return (
		<div
			className={`h-px w-full ${className}`}
			style={{
				background: gradient,
				backgroundPosition: `${patternOffset}px 0`,
			}}
			aria-hidden="true"
		/>
	);
}

// ═══════════════════════════════════════════════════════════════════════════
// CSS VARIABLE INJECTION
// ═══════════════════════════════════════════════════════════════════════════

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
