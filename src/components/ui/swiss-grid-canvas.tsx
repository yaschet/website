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
	type ElementType,
} from "react";
import { useReducedMotion, useSpring } from "framer-motion";
import { springs } from "@/src/lib/physics";
import { useReveal } from "@/src/components/providers/reveal-provider";

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Regular dash length in pixels.
 * MUST BE ODD for symmetric crosshairs - an odd number has a true center pixel.
 */
const DASH_SIZE = 9;

/** Regular gap length in pixels */
const GAP_SIZE = 7;

/**
 * CORNER REINFORCEMENTS
 * Like shipping container corner protectors - thicker and longer at intersections.
 * Creates a visual "box frame" effect around each section.
 */
const CORNER_DASH_SIZE = 17; // 2x longer than regular dashes (must be odd)
const CORNER_THICKNESS = 3; // 3px thick for bold reinforcement effect

/**
 * Grid line colors - subtle rgba values that don't compete with content.
 */
const COLOR_LIGHT = "rgba(0, 0, 0, 0.12)";
const COLOR_DARK = "rgba(255, 255, 255, 0.12)";

/**
 * Corner reinforcement colors - bold text color to make corners SPECIAL.
 * White on dark mode, black on light mode (matches text color).
 */
const CORNER_COLOR_LIGHT = "rgba(0, 0, 0, 0.5)"; // Strong black
const CORNER_COLOR_DARK = "rgba(255, 255, 255, 0.5)"; // Strong white

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

	// Physics-based animation progress (0 → 1)
	// Low stiffness + High mass = Heavy, deliberate mechanical work
	const drawProgress = useSpring(0, {
		stiffness: 6,
		damping: 10,
		mass: 4,
		restDelta: 0.001,
	});

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
		// Get scroll offsets
		const scrollX = window.scrollX || window.pageXOffset;
		const scrollY = window.scrollY || window.pageYOffset;

		// Get container bounds (absolute)
		if (containerRef.current) {
			const rect = containerRef.current.getBoundingClientRect();
			setContainerBounds({
				left: rect.left + scrollX,
				right: rect.right + scrollX,
				width: rect.width,
			});
		}

		// Get section boundaries (absolute)
		const newSections: SectionBoundary[] = [];
		sectionsRef.current.forEach((element, id) => {
			const rect = element.getBoundingClientRect();
			newSections.push({
				id,
				top: rect.top + scrollY,
				bottom: rect.bottom + scrollY,
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
	// Canvas Drawing - accepts progress for procedural animation
	// ─────────────────────────────────────────────────────────────────────────

	const draw = useCallback(
		(progress: number) => {
			const canvas = canvasRef.current;
			if (!canvas || !containerBounds) return;

			const ctx = canvas.getContext("2d");
			if (!ctx) return;

			const dpr = window.devicePixelRatio || 1;
			const width = document.documentElement.scrollWidth;
			const height = document.documentElement.scrollHeight;

			// Ensure canvas is sized correctly
			if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
				canvas.width = width * dpr;
				canvas.height = height * dpr;
				canvas.style.width = "100%";
				canvas.style.height = `${height}px`;
			}

			ctx.save();
			ctx.setTransform(1, 0, 0, 1, 0, 0);
			ctx.scale(dpr, dpr);
			ctx.clearRect(0, 0, width, height);

			// Colors
			const dashColor = isDark ? config.colorDark : config.colorLight;
			const cornerColor = isDark ? CORNER_COLOR_DARK : CORNER_COLOR_LIGHT;

			const cycle = config.dashSize + config.gapSize;
			const { left: containerLeft, right: containerRight } = containerBounds;

			// ─────────────────────────────────────────────────────────────────────
			// Physics of Paper Sequence:
			// 1. Construction Scaffold (The Paper Foundation)
			// 2. Vertical Lead (The Main Rails)
			// 3. Horizontal Momentum (The Shoot-out with Rebound)
			// 4. Mechanical Snaps (The Corners bolted down)
			// ─────────────────────────────────────────────────────────────────────

			const verticalProgress = progress;
			// Vertical lead finishes at 70% of global progress to leave headroom for horizontals
			const leadProgress = Math.min(progress / 0.7, 1);
			const currentY = height * leadProgress;

			// Get horizontal line Y positions for crosshair alignment
			const horizontalYs = sections.map((s) => s.bottom);

			// PASS 1: Construction Scaffold (Light foundation)
			if (progress > 0) {
				ctx.globalAlpha = 0.06;
				drawVerticalRail(
					ctx,
					containerLeft,
					height,
					cycle,
					config.dashSize,
					horizontalYs,
					dashColor,
					dashColor, // Scaffold corners are the same color as dashes
					false, // DON'T SKIP for scaffold - we want a continuous foundation
				);
				drawVerticalRail(
					ctx,
					containerRight,
					height,
					cycle,
					config.dashSize,
					horizontalYs,
					dashColor,
					dashColor,
					false,
				);
				for (const s of sections) {
					drawHorizontalLine(
						ctx,
						s.bottom,
						0,
						width,
						cycle,
						config.dashSize,
						containerLeft,
						containerRight,
						dashColor,
						dashColor,
						false,
					);
				}
				ctx.globalAlpha = 1;
			}

			// PASS 2: Vertical Rails (Primary ink)
			if (currentY > 0) {
				drawVerticalRail(
					ctx,
					containerLeft,
					currentY,
					cycle,
					config.dashSize,
					horizontalYs,
					dashColor,
					"transparent", // No corners in initial passes
				);
				drawVerticalRail(
					ctx,
					containerRight,
					currentY,
					cycle,
					config.dashSize,
					horizontalYs,
					dashColor,
					"transparent",
				);
			}

			// PASS 3: Horizontal Momentum & Kinetic Corners
			for (const section of sections) {
				const lineY = section.bottom;
				// Trigger scaled into the 0.7 lead window
				const trigger = (lineY / height) * 0.7;

				if (progress >= trigger) {
					// Velocity slightly adjusted to ensure completion within the 0.3 settle window
					const rawLineProgress = Math.min((progress - trigger) * 4, 1.2);
					const lineProgress =
						rawLineProgress > 1
							? 1 + Math.sin((rawLineProgress - 1) * Math.PI * 5) * 0.03
							: rawLineProgress;

					if (lineProgress > 0) {
						const currentX = width * lineProgress;

						drawHorizontalLine(
							ctx,
							lineY,
							0,
							currentX,
							cycle,
							config.dashSize,
							containerLeft,
							containerRight,
							dashColor,
							cornerColor,
						);

						// PASS 4: Apple-Level "Physical Stamp" (Ballistic Snap)
						// This is now the ONLY source for bold corner reinforcements
						const drawPhysicalStamp = (ix: number) => {
							const railX = Math.round(ix);
							const ry = Math.round(lineY);
							const distPast = currentX - railX;

							// The "Stamp Window" - widened to 350px for a "Slow-Motion Impact" feel
							const stampWindow = 350;

							if (distPast > 0) {
								const rawStampProgress = Math.min(distPast / stampWindow, 1);

								// Ballistic Snap Physics: 0 -> 1.4 -> 1.0
								// Hit peak impact early (15%), then a long luxurious settle
								const impactPoint = 0.15;
								const stampScale =
									rawStampProgress < impactPoint
										? (rawStampProgress / impactPoint) * 1.4
										: 1.4 -
											((rawStampProgress - impactPoint) / (1 - impactPoint)) *
												0.4;

								// Kinetic Impact Drop: Start 20px above and gravity-snap down
								const yOffset =
									(1 - Math.min(rawStampProgress / impactPoint, 1)) * -20;

								// Bolting Rotation: 25deg -> 0deg mechanical locking
								const rotation =
									(1 - Math.min(rawStampProgress / impactPoint, 1)) *
									(25 * (Math.PI / 180));

								ctx.save();
								ctx.translate(railX, ry + yOffset);
								ctx.rotate(rotation);
								ctx.scale(stampScale, stampScale);

								const halfBar = CORNER_DASH_SIZE / 2;
								const halfCornerThickness = Math.floor(CORNER_THICKNESS / 2);

								ctx.fillStyle = cornerColor;

								// High-contrast impact flash at the moment of landing
								if (
									rawStampProgress > impactPoint - 0.05 &&
									rawStampProgress < impactPoint + 0.05
								) {
									ctx.globalAlpha = 0.8;
								}

								// The "Stamped" Mark (V + H bars together)
								ctx.fillRect(
									-halfCornerThickness,
									-halfBar,
									CORNER_THICKNESS,
									CORNER_DASH_SIZE,
								);
								ctx.fillRect(
									-halfBar,
									-halfCornerThickness,
									CORNER_DASH_SIZE,
									CORNER_THICKNESS,
								);
								ctx.restore();
							}
						};

						drawPhysicalStamp(containerLeft);
						drawPhysicalStamp(containerRight);
					}
				}
			}
			ctx.restore();
		},
		[containerBounds, sections, config, isDark],
	);

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

		// Observe body height changes (crucial for absolute positioning)
		resizeObserver.observe(document.body);

		// Observe all sections
		sectionsRef.current.forEach((element) => {
			resizeObserver.observe(element);
		});

		// Window resize
		const handleResize = () => requestAnimationFrame(recalculatePositions);
		window.addEventListener("resize", handleResize);

		return () => {
			resizeObserver.disconnect();
			window.removeEventListener("resize", handleResize);
		};
	}, [recalculatePositions]);

	// Draw when positions change
	useEffect(() => {
		requestAnimationFrame(() => draw(drawProgress.get()));
	}, [draw, drawProgress]);

	// ─────────────────────────────────────────────────────────────────────────
	// Animation Loop - Subscribe to spring changes
	// ─────────────────────────────────────────────────────────────────────────

	const isVisible = phase >= 0;
	// Use a ref for draw to avoid re-sketches on theme change while ensuring latest color
	const drawRef = useRef(draw);
	drawRef.current = draw;

	// Reset only on mount or visibility change
	useEffect(() => {
		if (isVisible) {
			drawProgress.jump(0);

			const timer = setTimeout(() => {
				if (shouldReduceMotion) {
					drawProgress.jump(1);
				} else {
					drawProgress.set(1);
				}
			}, 50);

			return () => clearTimeout(timer);
		}
	}, [isVisible, drawProgress, shouldReduceMotion]);

	// Subscribe to spring and ensure 60fps redraws
	useEffect(() => {
		const unsubscribe = drawProgress.on("change", (value) => {
			requestAnimationFrame(() => drawRef.current(value));
		});

		// Ensure we draw the current state immediately if something changes
		requestAnimationFrame(() => drawRef.current(drawProgress.get()));

		return unsubscribe;
	}, [drawProgress, isVisible]);

	// ─────────────────────────────────────────────────────────────────────────
	// Render
	// ─────────────────────────────────────────────────────────────────────────

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

			{/* Canvas - procedurally animated via draw() */}
			<canvas
				ref={canvasRef}
				className="pointer-events-none absolute inset-0 z-50"
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
 * @param dashColor - Color for regular dashes
 * @param cornerColor - Color for corner reinforcements (bold)
 */
function drawVerticalRail(
	ctx: CanvasRenderingContext2D,
	x: number,
	height: number,
	cycle: number,
	dashSize: number,
	horizontalYs: number[],
	dashColor: string,
	cornerColor: string,
	skipCorners = true,
): void {
	// Round X position FIRST - this is the definitive column for the vertical line
	const railX = Math.round(x);
	const halfDash = Math.floor(dashSize / 2);
	const halfCornerDash = Math.floor(CORNER_DASH_SIZE / 2);
	const halfCornerThickness = Math.floor(CORNER_THICKNESS / 2);

	// Regular dashes only (bold corners are now exclusively handled by the PASS 4 physical stamp)
	ctx.fillStyle = dashColor;
	let currentY = 0;
	while (currentY < height) {
		// Skip corner reinforcement zones ONLY if requested (Primary ink pass)
		const inCrosshair =
			skipCorners &&
			horizontalYs.some((hy) => {
				const crosshairY = Math.round(hy);
				return (
					currentY >= crosshairY - halfCornerDash &&
					currentY < crosshairY + halfCornerDash
				);
			});

		if (!inCrosshair) {
			const nearestY = Math.round(findNearest(currentY, horizontalYs) ?? 0);
			const relativePos = Math.abs(currentY - nearestY);
			const phaseInCycle = relativePos % cycle;

			if (phaseInCycle <= halfDash || phaseInCycle >= cycle - halfDash) {
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
 * @param dashColor - Color for regular dashes
 * @param cornerColor - Color for corner reinforcements (bold)
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
	dashColor: string,
	cornerColor: string,
	skipCorners = true,
): void {
	// Round positions FIRST
	const lineY = Math.round(y);
	const leftCrosshairX = Math.round(containerLeft);
	const rightCrosshairX = Math.round(containerRight);
	const halfDash = Math.floor(dashSize / 2);
	const halfCornerDash = Math.floor(CORNER_DASH_SIZE / 2);
	const halfCornerThickness = Math.floor(CORNER_THICKNESS / 2);

	// Crosshair boundaries for skipping (corners handled by physical stamp pass)
	const leftDashStartX = leftCrosshairX - halfCornerDash;
	const rightDashStartX = rightCrosshairX - halfCornerDash;

	ctx.fillStyle = dashColor;
	let currentX = Math.round(startX);

	// Optimize: pre-calculate both rail positions for validity check
	const rails = [leftCrosshairX, rightCrosshairX];

	while (currentX < endX) {
		const inLeftCrosshair =
			skipCorners &&
			currentX >= leftDashStartX &&
			currentX < leftDashStartX + CORNER_DASH_SIZE;
		const inRightCrosshair =
			skipCorners &&
			currentX >= rightDashStartX &&
			currentX < rightDashStartX + CORNER_DASH_SIZE;

		if (!inLeftCrosshair && !inRightCrosshair) {
			// Align phase to the NEAREST rail to ensure perfect crosshairs at both ends
			const nearestX = Math.round(findNearest(currentX, rails) ?? leftCrosshairX);
			const relativePos = Math.abs(currentX - nearestX);
			const phaseInCycle = relativePos % cycle;

			if (phaseInCycle <= halfDash || phaseInCycle >= cycle - halfDash) {
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
	as?: ElementType;
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
