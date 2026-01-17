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

import { useReducedMotion, useSpring } from "framer-motion";
import {
  createContext,
  type ElementType,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
const CORNER_COLOR_LIGHT = "rgba(0, 0, 0, 1)"; // Strong black
const CORNER_COLOR_DARK = "rgba(255, 255, 255, 1)"; // Strong white

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

  const config: GridConfig = useMemo(
    () => ({
      dashSize,
      gapSize,
      colorLight: COLOR_LIGHT,
      colorDark: COLOR_DARK,
    }),
    [dashSize, gapSize]
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Section Registration
  // ─────────────────────────────────────────────────────────────────────────

  const registerSection = useCallback(
    (id: string, element: HTMLElement | null) => {
      if (element) {
        sectionsRef.current.set(id, element);
      } else {
        sectionsRef.current.delete(id);
      }
    },
    []
  );

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
      // Grid Drawing Sequence:
      // 1. Scaffold (Base layer)
      // 2. Vertical Rails (Main structure)
      // 3. Horizontal Lines (Animated entry)
      // 4. Corner Reinforcements (Intersections)
      // ─────────────────────────────────────────────────────────────────────

      const _verticalProgress = progress;
      const leadProgress = Math.min(progress / 0.7, 1);
      const currentY = height * leadProgress;

      // Get horizontal line Y positions for crosshair alignment
      const horizontalYs = sections.map((s) => s.bottom);

      // PASS 1: Base Scaffold
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
          dashColor,
          false
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
          false
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
            false
          );
        }
        ctx.globalAlpha = 1;
      }

      // PASS 2: Vertical Rails
      if (currentY > 0) {
        drawVerticalRail(
          ctx,
          containerLeft,
          currentY,
          cycle,
          config.dashSize,
          horizontalYs,
          dashColor,
          "transparent"
        );
        drawVerticalRail(
          ctx,
          containerRight,
          currentY,
          cycle,
          config.dashSize,
          horizontalYs,
          dashColor,
          "transparent"
        );
      }

      // PASS 3: Horizontal Lines & Corners
      for (const section of sections) {
        const lineY = section.bottom;
        const trigger = (lineY / height) * 0.7;

        if (progress >= trigger) {
          const lineT = Math.max(0, (progress - trigger) * 4);
          let lineProgress = 0;

          if (lineT < 1) {
            lineProgress = lineT;
          } else {
            // Spring Settle
            const t = (lineT - 1) * 15;
            const lMass = 1.0;
            const lStiff = 180.0;
            const lDamp = 18.0;

            const lOmega = Math.sqrt(lStiff / lMass);
            const lZeta = lDamp / (2 * Math.sqrt(lStiff * lMass));
            const decay = Math.exp(-lZeta * lOmega * t);
            const oscillation = Math.cos(
              lOmega * Math.sqrt(1 - lZeta ** 2) * t
            );

            lineProgress = 1 + decay * 0.04 * oscillation; // 4% max overshoot
          }

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
            cornerColor
          );

          // PASS 4: Corner Stamps
          const drawPhysicalStamp = (ix: number) => {
            const railX = Math.round(ix);
            const ry = Math.round(lineY);

            // Deterministic variance based on coordinates
            const cornerSeed = (railX * 13 + ry * 37) % 100;
            const variance = cornerSeed / 100;

            const mass = 4.5 + variance * 1.0;
            const stiffness = 35.0 + variance * 10.0;
            const damping = 10.0 + variance * 4.0;

            const impactThreshold =
              trigger + (ix / width) * 0.2 + variance * 0.05;
            const dt = Math.max(0, (progress - impactThreshold) * 1800);

            if (dt > 0) {
              const omega = Math.sqrt(stiffness / mass);
              const zeta = damping / (2 * Math.sqrt(stiffness * mass));
              const omega_d = omega * Math.sqrt(1 - zeta * zeta);

              const impactT = 120;
              const isLanded = dt >= impactT;

              let stampScale = 0;
              let rotation = 0;
              let flashAlpha = 0;
              let shadowOffset = 0;
              let shadowAlpha = 0;

              if (!isLanded) {
                const descentPath = dt / impactT;
                stampScale = 1.8 - descentPath * 0.5;
                rotation = 0; // Rigid piston drop (no tilt)
                shadowOffset = (1 - descentPath) * 12;
                shadowAlpha = descentPath * 0.2;
              } else {
                const t = (dt - impactT) / 50;
                const decay = Math.exp(-zeta * omega * t);
                const envelope = decay * 0.3;
                const oscillation = Math.cos(omega_d * t);

                stampScale = 1 + envelope * oscillation;
                rotation = 0; // Rigid piston land (no wobble)
                flashAlpha = decay * 1.0;
                shadowOffset = 0;
                shadowAlpha = 0.18;
              }

              ctx.save();
              const halfBar = CORNER_DASH_SIZE / 2;
              const halfThickness = Math.floor(CORNER_THICKNESS / 2);

              if (shadowAlpha > 0) {
                ctx.save();
                ctx.translate(railX + shadowOffset, ry + shadowOffset);
                ctx.rotate(rotation);
                ctx.scale(stampScale, stampScale);
                ctx.fillStyle = isDark ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.2)";
                ctx.globalAlpha = shadowAlpha;
                ctx.fillRect(
                  -halfThickness,
                  -halfBar,
                  CORNER_THICKNESS,
                  CORNER_DASH_SIZE
                );
                ctx.fillRect(
                  -halfBar,
                  -halfThickness,
                  CORNER_DASH_SIZE,
                  CORNER_THICKNESS
                );
                ctx.restore();
              }

              ctx.save();
              ctx.translate(railX, ry);
              ctx.rotate(rotation);
              ctx.scale(stampScale, stampScale);
              ctx.fillStyle = cornerColor;
              ctx.globalAlpha = 1.0;
              ctx.fillRect(
                -halfThickness,
                -halfBar,
                CORNER_THICKNESS,
                CORNER_DASH_SIZE
              );
              ctx.fillRect(
                -halfBar,
                -halfThickness,
                CORNER_DASH_SIZE,
                CORNER_THICKNESS
              );

              if (flashAlpha > 0.05) {
                ctx.globalCompositeOperation = "lighter";
                ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha * 0.5})`;
                ctx.fillRect(
                  -halfThickness,
                  -halfBar,
                  CORNER_THICKNESS,
                  CORNER_DASH_SIZE
                );
                ctx.fillRect(
                  -halfBar,
                  -halfThickness,
                  CORNER_DASH_SIZE,
                  CORNER_THICKNESS
                );
              }
              ctx.restore();
              ctx.restore();
            }
          };

          drawPhysicalStamp(containerLeft);
          drawPhysicalStamp(containerRight);
        }
      }
      ctx.restore();
    },
    [containerBounds, sections, config, isDark]
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
  }, [drawProgress]);

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
        className="pointer-events-none absolute inset-0 z-[5]"
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
  _cornerColor: string,
  skipCorners = true
): void {
  // Round X position FIRST - this is the definitive column for the vertical line
  const railX = Math.round(x);
  const halfDash = Math.floor(dashSize / 2);
  const halfCornerDash = Math.floor(CORNER_DASH_SIZE / 2);
  const _halfCornerThickness = Math.floor(CORNER_THICKNESS / 2);

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
  _cornerColor: string,
  skipCorners = true
): void {
  // Round positions FIRST
  const lineY = Math.round(y);
  const leftCrosshairX = Math.round(containerLeft);
  const rightCrosshairX = Math.round(containerRight);
  const halfDash = Math.floor(dashSize / 2);
  const halfCornerDash = Math.floor(CORNER_DASH_SIZE / 2);
  const _halfCornerThickness = Math.floor(CORNER_THICKNESS / 2);

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
      const nearestX = Math.round(
        findNearest(currentX, rails) ?? leftCrosshairX
      );
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
    Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev
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
  const sectionId = useRef(
    id ?? `section-${Math.random().toString(36).slice(2)}`
  );

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
