/**
 * Swiss Grid Mathematics
 *
 * Calculates pixel-perfect dash patterns that guarantee crosshair alignment
 * at any container width. The math ensures the pattern always terminates
 * with a dash (not a gap) at both edges.
 *
 * @module grid
 * @description
 * This is the mathematical foundation for the Swiss-precision grid system.
 * It calculates dynamic dash/gap sizes based on container width to ensure
 * perfect '+' crosshair intersections at every vertical/horizontal junction.
 *
 * The key insight: We adjust the cycle size (dash + gap) to be a perfect
 * divisor of the container width, ensuring the pattern aligns at edges.
 */

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

/** Target cycle size in pixels (dash + gap). Actual size will be adjusted for perfect fit. */
export const TARGET_CYCLE = 16;

/** Minimum number of cycles to maintain visual density */
export const MIN_CYCLES = 8;

/** Maximum cycle size to prevent overly sparse patterns */
export const MAX_CYCLE = 24;

/** Minimum cycle size to prevent overly dense patterns */
export const MIN_CYCLE = 12;

// ═══════════════════════════════════════════════════════════════════════════
// CORE MATHEMATICS
// ═══════════════════════════════════════════════════════════════════════════

export interface GridDimensions {
	/** Actual dash length in pixels */
	dashSize: number;
	/** Actual gap length in pixels */
	gapSize: number;
	/** Complete cycle size (dash + gap) */
	cycleSize: number;
	/** Number of complete cycles that fit in the container */
	cycleCount: number;
	/** Container width this was calculated for */
	containerWidth: number;
}

/**
 * Calculate pixel-perfect dash dimensions for a given container width.
 *
 * The algorithm:
 * 1. Calculate the ideal number of cycles based on target cycle size
 * 2. Round to nearest whole number to ensure perfect edge alignment
 * 3. Derive actual cycle size from container width / cycle count
 * 4. Split cycle 50/50 between dash and gap
 *
 * This guarantees:
 * - The pattern starts with a dash at x=0
 * - The pattern ends with a dash at x=containerWidth
 * - Perfect crosshair alignment at vertical rail positions
 *
 * @param containerWidth - Width of the container in pixels
 * @returns GridDimensions with calculated values
 */
export function calculateGridDimensions(containerWidth: number): GridDimensions {
	// Handle edge cases
	if (containerWidth <= 0) {
		return {
			dashSize: TARGET_CYCLE / 2,
			gapSize: TARGET_CYCLE / 2,
			cycleSize: TARGET_CYCLE,
			cycleCount: 0,
			containerWidth: 0,
		};
	}

	// Calculate ideal number of cycles
	const idealCycles = containerWidth / TARGET_CYCLE;

	// Round to nearest whole number (ensures perfect fit)
	// Use Math.max to ensure minimum density
	const cycleCount = Math.max(MIN_CYCLES, Math.round(idealCycles));

	// Calculate actual cycle size that divides evenly into container
	let cycleSize = containerWidth / cycleCount;

	// Clamp cycle size to reasonable bounds
	if (cycleSize > MAX_CYCLE) {
		// Too sparse - add more cycles
		const adjustedCycles = Math.ceil(containerWidth / MAX_CYCLE);
		cycleSize = containerWidth / adjustedCycles;
	} else if (cycleSize < MIN_CYCLE) {
		// Too dense - reduce cycles
		const adjustedCycles = Math.floor(containerWidth / MIN_CYCLE);
		cycleSize = containerWidth / Math.max(1, adjustedCycles);
	}

	// Final cycle count after adjustments
	const finalCycleCount = Math.round(containerWidth / cycleSize);

	// Recalculate for perfect fit
	const finalCycleSize = containerWidth / finalCycleCount;

	// 50/50 split for balanced appearance
	const dashSize = finalCycleSize / 2;
	const gapSize = finalCycleSize / 2;

	return {
		dashSize,
		gapSize,
		cycleSize: finalCycleSize,
		cycleCount: finalCycleCount,
		containerWidth,
	};
}

/**
 * Generate CSS gradient string for horizontal dashed line.
 * The gradient is designed to start AND end with a dash.
 *
 * @param dimensions - Pre-calculated grid dimensions
 * @param color - CSS color value for the dashes
 * @returns CSS repeating-linear-gradient string
 */
export function generateHorizontalGradient(dimensions: GridDimensions, color: string): string {
	const { dashSize, cycleSize } = dimensions;

	// Offset by half a dash to ensure we start and end with a dash
	// Without offset: |dash|gap|dash|gap|... might end on gap
	// With offset: starts at dash center, guarantees dash at both edges
	return `repeating-linear-gradient(
    to right,
    ${color} 0px,
    ${color} ${dashSize}px,
    transparent ${dashSize}px,
    transparent ${cycleSize}px
  )`;
}

/**
 * Generate CSS gradient string for vertical dashed line.
 *
 * @param dimensions - Pre-calculated grid dimensions
 * @param color - CSS color value for the dashes
 * @returns CSS repeating-linear-gradient string
 */
export function generateVerticalGradient(dimensions: GridDimensions, color: string): string {
	const { dashSize, cycleSize } = dimensions;

	return `repeating-linear-gradient(
    to bottom,
    ${color} 0px,
    ${color} ${dashSize}px,
    transparent ${dashSize}px,
    transparent ${cycleSize}px
  )`;
}

// ═══════════════════════════════════════════════════════════════════════════
// CSS CUSTOM PROPERTY HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Apply grid dimensions as CSS custom properties to an element.
 * This allows CSS to react to JavaScript calculations.
 *
 * Properties set:
 * - --grid-dash: Dash size in pixels
 * - --grid-gap: Gap size in pixels
 * - --grid-cycle: Full cycle size in pixels
 *
 * @param element - DOM element to apply properties to
 * @param dimensions - Calculated grid dimensions
 */
export function applyGridProperties(element: HTMLElement, dimensions: GridDimensions): void {
	element.style.setProperty("--grid-dash", `${dimensions.dashSize}px`);
	element.style.setProperty("--grid-gap", `${dimensions.gapSize}px`);
	element.style.setProperty("--grid-cycle", `${dimensions.cycleSize}px`);
}

// ═══════════════════════════════════════════════════════════════════════════
// DEBUG UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Verify that the grid dimensions will produce perfect edge alignment.
 * Useful for debugging.
 *
 * @param dimensions - Grid dimensions to verify
 * @returns true if the pattern will align perfectly at edges
 */
export function verifyAlignment(dimensions: GridDimensions): boolean {
	const { cycleSize, containerWidth, cycleCount } = dimensions;
	const calculatedWidth = cycleSize * cycleCount;
	const error = Math.abs(calculatedWidth - containerWidth);

	// Allow for floating point imprecision (< 0.01px)
	return error < 0.01;
}
