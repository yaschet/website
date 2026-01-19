/**
 * Physics Animation Constants
 *
 * Spring parameters for animations.
 * All values are tuned for 60fps GPU-accelerated transforms.
 *
 * @module physics
 * @description
 * Central configuration for animation constants.
 * Ensures consistent motion values across the application.
 *
 * @example
 * import { springs, stagger, distances } from "@/src/lib/physics";
 *
 * <motion.div transition={springs.responsive} />
 */

// ═══════════════════════════════════════════════════════════════════════════
// MATHEMATICAL CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

/** Golden Ratio constant */
export const PHI = 1.618033988749895;

/** Inverse Golden Ratio - for decelerating progressions */
export const PHI_INVERSE = 1 / PHI; // ≈ 0.618

// ═══════════════════════════════════════════════════════════════════════════
// SPRING PRESETS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Spring Configurations
 *
 * - mass: Inertia of the element.
 * - stiffness: How "tight" the spring is (higher = faster overall)
 * - damping: How quickly oscillation stops (higher = less bounce)
 *
 * Critical damping ≈ 2 * sqrt(stiffness * mass)
 * Under-damped = bounce | Over-damped = sluggish
 */
export const springs = {
	/**
	 * Micro-interactions (hover, press, focus)
	 * High stiffness, low mass.
	 */
	snappy: {
		type: "spring" as const,
		mass: 0.3,
		stiffness: 700,
		damping: 30,
	},

	/**
	 * Button micro-interactions (hover, press)
	 * Critical damping.
	 * Critical damping = 2 * sqrt(stiffness * mass) = 2 * sqrt(400 * 0.3) ≈ 22
	 * Standard under-damped spring.
	 */
	button: {
		type: "spring" as const,
		mass: 0.3,
		stiffness: 400,
		damping: 20,
	},

	/**
	 * UI reveals (content appearing, modals)
	 * High stiffness, moderate damping.
	 */
	responsive: {
		type: "spring" as const,
		mass: 0.5,
		stiffness: 400,
		damping: 28,
	},

	/**
	 * Content reveals (text, sections)
	 * Lower stiffness, higher mass.
	 */
	gentle: {
		type: "spring" as const,
		mass: 0.7,
		stiffness: 280,
		damping: 26,
	},

	/**
	 * Layout animations (shared layout, morphing)
	 * Smooth stiffness/damping ratio.
	 */
	layout: {
		type: "spring" as const,
		mass: 0.6,
		stiffness: 350,
		damping: 30,
	},

	/**
	 * Background/ambient elements
	 * Very low stiffness.
	 */
	ambient: {
		type: "spring" as const,
		mass: 1.0,
		stiffness: 120,
		damping: 22,
	},

	/**
	 * Playful/celebratory (use sparingly)
	 * Lower damping = more oscillation
	 */
	bouncy: {
		type: "spring" as const,
		mass: 0.4,
		stiffness: 400,
		damping: 15,
	},

	/**
	 * Text character reveals
	 * Fast response for list items.
	 */
	text: {
		type: "spring" as const,
		mass: 0.35,
		stiffness: 500,
		damping: 28,
	},

	/**
	 * Blur clearing (used alongside position springs)
	 * Should resolve slightly faster than position
	 */
	blur: {
		type: "spring" as const,
		mass: 0.25,
		stiffness: 600,
		damping: 32,
	},
	/**
	 * Data glitch/swap (for coordinates, dates)
	 * High stiffness (500).
	 */
	glitch: {
		type: "spring" as const,
		mass: 0.2,
		stiffness: 600,
		damping: 25,
	},
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// LAYERED BUTTON TRANSITIONS (animations.dev standard)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Button Animation Variant
 *
 * - Scale: Fast transition.
 * - Y: Moderate transition.
 * - Shadow: Slow fade-in as a secondary effect
 *
 * Standard micro-interaction.
 */
export const buttonTransition = {
	// Scale transition
	scale: {
		type: "spring" as const,
		mass: 0.25,
		stiffness: 500,
		damping: 22, // Critical ≈ 22, perfectly damped
	},
	// Y position is the "hero" — slightly more mass, slower settle
	y: {
		type: "spring" as const,
		mass: 0.4,
		stiffness: 350,
		damping: 24,
	},
	// Shadow fades in as a "secondary effect" — slowest, heaviest
	boxShadow: {
		type: "spring" as const,
		mass: 0.6,
		stiffness: 200,
		damping: 28,
	},
	// Default for any other animated properties
	default: {
		type: "spring" as const,
		mass: 0.3,
		stiffness: 400,
		damping: 20,
	},
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// STAGGER SEQUENCES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Stagger Intervals
 *
 * Base delays for sequential element reveals.
 * Uses golden ratio (φ) for staggering.
 */
export const stagger = {
	/** Fast interval */
	char: 0.02,

	/** Word-by-word text reveals */
	word: 0.035,

	/** List items, cards, small elements */
	item: 0.05,

	/** Section-level reveals */
	section: 0.08,

	/**
	 * φ-based progression (accelerating)
	 * Each subsequent delay is shorter, creating a "cascade" effect
	 * Good for: Hero text, feature lists, nav items
	 */
	phi: (index: number, baseDelay = 0.04): number => baseDelay * PHI_INVERSE ** (index * 0.6),

	/**
	 * Inverse φ progression (decelerating)
	 * Each subsequent delay is longer, creating a "settling" effect
	 * Good for: Loading states, "appearing from afar"
	 */
	phiReverse: (index: number, baseDelay = 0.03): number => baseDelay * PHI ** (index * 0.4),

	/**
	 * Linear with φ-derived base
	 * Consistent interval but derived from golden ratio
	 */
	phiLinear: 0.04 * PHI_INVERSE, // ≈ 0.025s
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// MOTION DISTANCES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Reveal Distances
 *
 * How far elements travel during their entrance animation.
 * Measured in pixels. Use with y, x, or custom properties.
 *
 * Optimal: Just enough to be perceptible, not enough to distract.
 */
export const distances = {
	/** Micro (tooltips, badges, hover states) */
	micro: 6,

	/** Small (text reveals, buttons, inline elements) */
	small: 12,

	/** Medium (section reveals, cards) */
	medium: 20,

	/** Large (hero elements, modals, overlays) */
	large: 32,

	/** Large interval (full-page reveals) */
	xl: 48,
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// BLUR VALUES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Blur Intensities
 *
 * For "fade-in-blur" effects. Higher values increase blur radius.
 * GPU-accelerated via CSS filter.
 */
export const blur = {
	/** Subtle hint of blur */
	subtle: "blur(4px)",

	/** Standard text/content blur */
	normal: "blur(8px)",

	/** High blur radius */
	heavy: "blur(16px)",

	/** Cleared state */
	none: "blur(0px)",
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// DURATION FALLBACKS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Duration Hints (for non-spring animations ONLY)
 *
 * Only use for CSS transitions that can't use springs:
 * - color
 * - background-color
 * - border-color
 * - box-shadow
 *
 * All transform/opacity animations should use springs.
 */
export const durations = {
	instant: 0.1,
	fast: 0.15,
	normal: 0.25,
	slow: 0.4,
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type SpringPreset = keyof typeof springs;
export type StaggerPreset = keyof Omit<typeof stagger, "phi" | "phiReverse">;
export type DistancePreset = keyof typeof distances;
