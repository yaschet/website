"use client";

/**
 * Swiss Grid Canvas - Pixel-Perfect Grid Overlay
 *
 * @module swiss-grid-canvas
 * @description
 * A Canvas-based grid overlay that achieves mathematically perfect crosshair
 * intersections at any viewport size. Unlike CSS gradients, this approach
 * calculates exact intersection points and draws dashes precisely.
 *
 * Architecture:
 * 1. SwissGridProvider - Context for section registration
 * 2. SwissGridCanvas - Fixed canvas overlay that draws the grid
 * 3. SwissGridSection - Wrapper that registers section boundaries
 *
 * Performance:
 * - Uses ResizeObserver for efficient position tracking
 * - Batches draws with requestAnimationFrame
 * - Scales for devicePixelRatio (Retina displays)
 * - GPU-accelerated canvas rendering
 */

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
import { springs } from "@/src/lib/physics";
import { useReveal } from "@/src/components/providers/reveal-provider";

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Dash length in pixels.
 * MUST BE ODD for symmetric crosshairs - an odd number has a true center pixel.
 * With 9px: dash spans X-4 to X+4, center is exactly at X.
 */
const DASH_SIZE = 9;

/** Gap length in pixels */
const GAP_SIZE = 7;

/** Grid line color for light mode */
const COLOR_LIGHT = "rgba(0, 0, 0, 0.1)";

/** Grid line color for dark mode */
const COLOR_DARK = "rgba(255, 255, 255, 0.1)";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface GridConfig {
	dashSize: number;
	gapSize: number;
	colorLight: string;
	colorDark: string;
}

interface SectionBoundary {
	id: string;
	top: number;
	bottom: number;
}

interface SwissGridContextValue {
	/** Register a section's boundary */
	registerSection: (id: string, element: HTMLElement | null) => void;
	/** Unregister a section */
	unregisterSection: (id: string) => void;
	/** Current container bounds */
	containerBounds: { left: number; right: number; width: number } | null;
	/** Grid configuration */
	config: GridConfig;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONTEXT
// ═══════════════════════════════════════════════════════════════════════════

const SwissGridContext = createContext<SwissGridContextValue | null>(null);

/**
 * Hook to access the Swiss Grid context
 */
export function useSwissGrid() {
	const context = useContext(SwissGridContext);
	if (!context) {
		throw new Error("useSwissGrid must be used within SwissGridProvider");
	}
	return context;
}

// ═══════════════════════════════════════════════════════════════════════════
// PROVIDER + CANVAS
// ═══════════════════════════════════════════════════════════════════════════

interface SwissGridProviderProps {
	children: ReactNode;
	/** Dash length in pixels (default: 8) */
	dashSize?: number;
	/** Gap length in pixels (default: 8) */
	gapSize?: number;
}

/**
 * SwissGridProvider - Provides context and renders the canvas overlay
 *
 * This component:
 * 1. Provides context for section registration
 * 2. Tracks the max-w-3xl container bounds
 * 3. Renders a fixed canvas overlay
 * 4. Draws pixel-perfect dashed grid lines
 */
export function SwissGridProvider({
	children,
	dashSize = DASH_SIZE,
	gapSize = GAP_SIZE,
}: SwissGridProviderProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const sectionsRef = useRef<Map<string, HTMLElement>>(new Map());
	const [sections, setSections] = useState<SectionBoundary[]>([]);
	const [containerBounds, setContainerBounds] = useState<{
		left: number;
		right: number;
		width: number;
	} | null>(null);
	const [isDark, setIsDark] = useState(false);
	const { phase } = useReveal();
	const shouldReduceMotion = useReducedMotion();

	const config: GridConfig = {
		dashSize,
		gapSize,
		colorLight: COLOR_LIGHT,
		colorDark: COLOR_DARK,
	};

	// ─────────────────────────────────────────────────────────────────────────
	// Section Registration
	// ─────────────────────────────────────────────────────────────────────────

	const registerSection = useCallback((id: string, element: HTMLElement | null) => {
		if (element) {
			sectionsRef.current.set(id, element);
		} else {
			sectionsRef.current.delete(id);
		}
	}, []);

	const unregisterSection = useCallback((id: string) => {
		sectionsRef.current.delete(id);
	}, []);

	// ─────────────────────────────────────────────────────────────────────────
	// Position Calculation
	// ─────────────────────────────────────────────────────────────────────────

	const recalculatePositions = useCallback(() => {
		// Get container bounds
		if (containerRef.current) {
			const rect = containerRef.current.getBoundingClientRect();
			setContainerBounds({
				left: rect.left,
				right: rect.right,
				width: rect.width,
			});
		}

		// Get section boundaries
		const newSections: SectionBoundary[] = [];
		sectionsRef.current.forEach((element, id) => {
			const rect = element.getBoundingClientRect();
			newSections.push({
				id,
				top: rect.top,
				bottom: rect.bottom,
			});
		});

		// Sort by top position
		newSections.sort((a, b) => a.top - b.top);
		setSections(newSections);
	}, []);

	// ─────────────────────────────────────────────────────────────────────────
	// Dark Mode Detection
	// ─────────────────────────────────────────────────────────────────────────

	useEffect(() => {
		const checkDarkMode = () => {
			setIsDark(document.documentElement.classList.contains("dark"));
		};

		checkDarkMode();

		const observer = new MutationObserver(checkDarkMode);
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["class"],
		});

		return () => observer.disconnect();
	}, []);

	// ─────────────────────────────────────────────────────────────────────────
	// Canvas Drawing
	// ─────────────────────────────────────────────────────────────────────────

	const draw = useCallback(() => {
		const canvas = canvasRef.current;
		if (!canvas || !containerBounds) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const dpr = window.devicePixelRatio || 1;
		const width = window.innerWidth;
		const height = window.innerHeight;

		// Set canvas size (accounting for DPR for crisp rendering)
		canvas.width = width * dpr;
		canvas.height = height * dpr;
		canvas.style.width = `${width}px`;
		canvas.style.height = `${height}px`;
		ctx.scale(dpr, dpr);

		// Clear canvas
		ctx.clearRect(0, 0, width, height);

		// Set color
		ctx.fillStyle = isDark ? config.colorDark : config.colorLight;

		const cycle = config.dashSize + config.gapSize;
		const { left: containerLeft, right: containerRight } = containerBounds;

		// ─────────────────────────────────────────────────────────────────────
		// Draw Vertical Rails (left and right edges of container)
		// ─────────────────────────────────────────────────────────────────────

		// Get horizontal line Y positions for crosshair alignment
		const horizontalYs = sections.map((s) => s.bottom);

		// Draw left vertical rail
		drawVerticalRail(ctx, containerLeft, height, cycle, config.dashSize, horizontalYs);

		// Draw right vertical rail
		drawVerticalRail(ctx, containerRight, height, cycle, config.dashSize, horizontalYs);

		// ─────────────────────────────────────────────────────────────────────
		// Draw Horizontal Lines (at section bottoms)
		// ─────────────────────────────────────────────────────────────────────

		for (const section of sections) {
			drawHorizontalLine(
				ctx,
				section.bottom,
				0,
				width,
				cycle,
				config.dashSize,
				containerLeft,
				containerRight,
			);
		}
	}, [containerBounds, sections, config, isDark]);

	// ─────────────────────────────────────────────────────────────────────────
	// ResizeObserver + Draw Loop
	// ─────────────────────────────────────────────────────────────────────────

	useEffect(() => {
		recalculatePositions();

		// Observe container size changes
		const resizeObserver = new ResizeObserver(() => {
			requestAnimationFrame(recalculatePositions);
		});

		if (containerRef.current) {
			resizeObserver.observe(containerRef.current);
		}

		// Observe all sections
		sectionsRef.current.forEach((element) => {
			resizeObserver.observe(element);
		});

		// Window resize
		const handleResize = () => requestAnimationFrame(recalculatePositions);
		window.addEventListener("resize", handleResize);

		// Scroll (for fixed positioning recalc)
		const handleScroll = () => requestAnimationFrame(recalculatePositions);
		window.addEventListener("scroll", handleScroll, { passive: true });

		return () => {
			resizeObserver.disconnect();
			window.removeEventListener("resize", handleResize);
			window.removeEventListener("scroll", handleScroll);
		};
	}, [recalculatePositions]);

	// Draw when positions change
	useEffect(() => {
		requestAnimationFrame(draw);
	}, [draw]);

	// ─────────────────────────────────────────────────────────────────────────
	// Render
	// ─────────────────────────────────────────────────────────────────────────

	const isVisible = phase >= 0;

	const contextValue: SwissGridContextValue = {
		registerSection,
		unregisterSection,
		containerBounds,
		config,
	};

	return (
		<SwissGridContext.Provider value={contextValue}>
			{/* Hidden container to measure max-w-3xl bounds */}
			<div
				ref={containerRef}
				className="pointer-events-none fixed top-0 right-0 left-0 z-[-1] mx-auto h-px max-w-3xl"
				aria-hidden="true"
			/>

			{/* Canvas overlay */}
			<motion.canvas
				ref={canvasRef}
				className="pointer-events-none fixed inset-0 z-50"
				initial={{ opacity: 0 }}
				animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
				transition={shouldReduceMotion ? { duration: 0 } : springs.responsive}
				aria-hidden="true"
			/>

			{children}
		</SwissGridContext.Provider>
	);
}

// ═══════════════════════════════════════════════════════════════════════════
// DRAWING UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Draw a vertical dashed rail with crosshair alignment
 *
 * For a perfect '+' crosshair, we must:
 * 1. Round the X position FIRST
 * 2. Use that same rounded X for both the vertical line AND calculating horizontal dash center
 *
 * @param ctx - Canvas 2D context
 * @param x - X position of the rail (will be rounded)
 * @param height - Total height to draw
 * @param cycle - Dash + gap cycle size
 * @param dashSize - Length of each dash
 * @param horizontalYs - Y positions where horizontal lines cross (will be rounded)
 */
function drawVerticalRail(
	ctx: CanvasRenderingContext2D,
	x: number,
	height: number,
	cycle: number,
	dashSize: number,
	horizontalYs: number[],
): void {
	// Round X position FIRST - this is the definitive column for the vertical line
	const railX = Math.round(x);
	const halfDash = Math.floor(dashSize / 2);

	// Draw dashes at each intersection, centered on the rounded Y
	for (const hy of horizontalYs) {
		const crosshairY = Math.round(hy);
		const dashStartY = crosshairY - halfDash;
		ctx.fillRect(railX, dashStartY, 1, dashSize);
	}

	// Fill in dashes between crosshairs
	let currentY = 0;
	while (currentY < height) {
		// Skip crosshair zones
		const inCrosshair = horizontalYs.some((hy) => {
			const crosshairY = Math.round(hy);
			return currentY >= crosshairY - halfDash && currentY < crosshairY + halfDash;
		});

		if (!inCrosshair) {
			// Find nearest crosshair for phase alignment
			const nearestY = Math.round(findNearest(currentY, horizontalYs) ?? 0);
			const relativePos = Math.abs(currentY - nearestY);
			const phaseInCycle = relativePos % cycle;

			if (phaseInCycle < halfDash || phaseInCycle >= cycle - halfDash) {
				ctx.fillRect(railX, currentY, 1, 1);
			}
		}
		currentY += 1;
	}
}

/**
 * Draw a horizontal dashed line with crosshair alignment
 *
 * For a perfect '+' crosshair, we must:
 * 1. Round the Y position FIRST
 * 2. Round the crosshair X positions (container edges) FIRST
 * 3. Calculate dash start from rounded X, not re-round the result
 *
 * @param ctx - Canvas 2D context
 * @param y - Y position of the line (will be rounded)
 * @param startX - Starting X position
 * @param endX - Ending X position
 * @param cycle - Dash + gap cycle size
 * @param dashSize - Length of each dash
 * @param containerLeft - Left edge of container (will be rounded)
 * @param containerRight - Right edge of container (will be rounded)
 */
function drawHorizontalLine(
	ctx: CanvasRenderingContext2D,
	y: number,
	startX: number,
	endX: number,
	cycle: number,
	dashSize: number,
	containerLeft: number,
	containerRight: number,
): void {
	// Round positions FIRST - these are the definitive coordinates
	const lineY = Math.round(y);
	const leftCrosshairX = Math.round(containerLeft);
	const rightCrosshairX = Math.round(containerRight);
	const halfDash = Math.floor(dashSize / 2);

	// Draw dash centered on left crosshair (calculated from rounded X, not re-rounded)
	const leftDashStartX = leftCrosshairX - halfDash;
	ctx.fillRect(leftDashStartX, lineY, dashSize, 1);

	// Draw dash centered on right crosshair
	const rightDashStartX = rightCrosshairX - halfDash;
	ctx.fillRect(rightDashStartX, lineY, dashSize, 1);

	// Fill in dashes between, using phase from left crosshair
	let currentX = Math.round(startX);
	while (currentX < endX) {
		// Skip crosshair zones
		const inLeftCrosshair = currentX >= leftDashStartX && currentX < leftDashStartX + dashSize;
		const inRightCrosshair =
			currentX >= rightDashStartX && currentX < rightDashStartX + dashSize;

		if (!inLeftCrosshair && !inRightCrosshair) {
			const relativePos = Math.abs(currentX - leftCrosshairX);
			const phaseInCycle = relativePos % cycle;

			if (phaseInCycle < halfDash || phaseInCycle >= cycle - halfDash) {
				ctx.fillRect(currentX, lineY, 1, 1);
			}
		}
		currentX += 1;
	}
}

/**
 * Find the nearest value in an array to a target
 */
function findNearest(target: number, values: number[]): number | undefined {
	if (values.length === 0) return undefined;
	return values.reduce((prev, curr) =>
		Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev,
	);
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION WRAPPER
// ═══════════════════════════════════════════════════════════════════════════

interface SwissGridSectionProps {
	children: ReactNode;
	/** Unique identifier for this section */
	id?: string;
	/** Additional CSS classes */
	className?: string;
	/** HTML tag to render (default: div) */
	as?: keyof JSX.IntrinsicElements;
}

/**
 * SwissGridSection - Registers a section's boundary for grid alignment
 *
 * Wrap each content section with this component to register its
 * bottom edge position for horizontal line drawing.
 */
export function SwissGridSection({
	children,
	id,
	className = "",
	as: Tag = "div",
}: SwissGridSectionProps) {
	const ref = useRef<HTMLElement>(null);
	const { registerSection, unregisterSection } = useSwissGrid();
	const sectionId = useRef(id ?? `section-${Math.random().toString(36).slice(2)}`);

	useEffect(() => {
		registerSection(sectionId.current, ref.current);

		return () => {
			unregisterSection(sectionId.current);
		};
	}, [registerSection, unregisterSection]);

	// @ts-expect-error - Dynamic tag with ref
	return (
		<Tag ref={ref} className={className}>
			{children}
		</Tag>
	);
}

// ═══════════════════════════════════════════════════════════════════════════
// CSS STYLES (for dark mode color)
// ═══════════════════════════════════════════════════════════════════════════

export function SwissGridStyles() {
	return null; // Colors are handled in canvas drawing
}

export default SwissGridProvider;
