/**
 * Physics-First Animation System
 *
 * Spring parameters derived from real-world physics principles.
 * All values are tuned for 60fps GPU-accelerated transforms.
 *
 * @module physics
 * @description
 * This is the single source of truth for all motion in the application.
 * Every animation should import from here to ensure visual consistency
 * and a unified "feel" across the interface.
 *
 * @example
 * import { springs, stagger, distances } from "@/src/lib/physics";
 *
 * <motion.div transition={springs.responsive} />
 */

// ═══════════════════════════════════════════════════════════════════════════
// MATHEMATICAL CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

/** Golden Ratio - the mathematical foundation for natural visual rhythm */
export const PHI = 1.618033988749895;

/** Inverse Golden Ratio - for decelerating progressions */
export const PHI_INVERSE = 1 / PHI; // ≈ 0.618

// ═══════════════════════════════════════════════════════════════════════════
// SPRING PRESETS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Spring Configurations
 *
 * Named after their perceived "weight" or "feel":
 * - snappy: UI controls, hover states, buttons
 * - responsive: Content reveals, modals, panels
 * - gentle: Hero text, ambient motion
 * - layout: Shared layout animations, morphing
 * - ambient: Background elements, ultra-subtle
 * - bouncy: Playful emphasis (use sparingly)
 *
 * Physics breakdown:
 * - mass: How "heavy" the element feels (lower = faster start)
 * - stiffness: How "tight" the spring is (higher = faster overall)
 * - damping: How quickly oscillation stops (higher = less bounce)
 *
 * Critical damping ≈ 2 * sqrt(stiffness * mass)
 * Under-damped = bounce | Over-damped = sluggish
 */
export const springs = {
  /**
   * Micro-interactions (hover, press, focus)
   * Feels instant but has physical "push back"
   */
  snappy: {
    type: "spring" as const,
    mass: 0.3,
    stiffness: 700,
    damping: 30,
  },

  /**
   * Precision button interactions (Swiss-level control)
   * No bounce, no overshoot — just controlled, deliberate motion.
   * Like a precision instrument clicking into place.
   */
  precision: {
    type: "spring" as const,
    mass: 0.2,
    stiffness: 500,
    damping: 40, // High damping = no oscillation
  },

  /**
   * UI reveals (content appearing, modals)
   * Fast attack, smooth settle
   */
  responsive: {
    type: "spring" as const,
    mass: 0.5,
    stiffness: 400,
    damping: 28,
  },

  /**
   * Content reveals (text, sections)
   * Elegant entrance, slightly more mass
   */
  gentle: {
    type: "spring" as const,
    mass: 0.7,
    stiffness: 280,
    damping: 26,
  },

  /**
   * Layout animations (shared layout, morphing)
   * Smooth and interconnected feeling
   */
  layout: {
    type: "spring" as const,
    mass: 0.6,
    stiffness: 350,
    damping: 30,
  },

  /**
   * Background/ambient elements
   * Ultra-smooth, almost imperceptible entry
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
   * Must be snappy to keep up with staggered children
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
   * Ultra-fast, electronic feel
   */
  glitch: {
    type: "spring" as const,
    mass: 0.2,
    stiffness: 600,
    damping: 25,
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// STAGGER SEQUENCES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Stagger Intervals
 *
 * Base delays for sequential element reveals.
 * Uses golden ratio (φ) for advanced orchestration.
 */
export const stagger = {
  /** Ultra-fast character-by-character (typewriter effect) */
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
  phi: (index: number, baseDelay = 0.04): number =>
    baseDelay * PHI_INVERSE ** (index * 0.6),

  /**
   * Inverse φ progression (decelerating)
   * Each subsequent delay is longer, creating a "settling" effect
   * Good for: Loading states, "appearing from afar"
   */
  phiReverse: (index: number, baseDelay = 0.03): number =>
    baseDelay * PHI ** (index * 0.4),

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

  /** Extra large (full-page reveals, dramatic entrances) */
  xl: 48,
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// BLUR VALUES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Blur Intensities
 *
 * For "fade-in-blur" effects. Higher = more dramatic but slower to clear.
 * GPU-accelerated via CSS filter.
 */
export const blur = {
  /** Subtle hint of blur */
  subtle: "blur(4px)",

  /** Standard text/content blur */
  normal: "blur(8px)",

  /** Heavy blur for dramatic reveals */
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
