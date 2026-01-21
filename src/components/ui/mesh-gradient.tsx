"use client";

/**
 * Mesh Gradient Canvas — Pixel-Perfect Ambient Background
 *
 * @module mesh-gradient
 * @description
 * Canvas-based mesh gradient that shares SwissGrid's coordinate system.
 * Uses identical Math.round() logic for sub-pixel alignment.
 *
 * Architecture:
 * 1. Canvas renders at exact SwissGrid bounds (same Math.round)
 * 2. Simplex noise for organic color blending
 * 3. Edge fade to transparent (no hard borders)
 * 4. Theme-reactive color palette
 *
 * Performance:
 * - Pre-computed gradient texture (no per-frame noise calc)
 * - Renders once on mount/resize/theme change
 * - GPU-accelerated opacity animation
 * - Respects prefers-reduced-motion
 */

import { motion, useReducedMotion } from "framer-motion";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { cn } from "@/lib/utils";
import { useReveal } from "@/src/components/providers/reveal-provider";
import { springs } from "@/src/lib/index";
import { useSwissGrid } from "./swiss-grid-canvas";

// ═══════════════════════════════════════════════════════════════════════════
// CONTEXT - Exposes theme state to UI components
// ═══════════════════════════════════════════════════════════════════════════

interface MeshGradientContextValue {
	/** Whether the current background needs light text */
	needsLightText: boolean;
	/** Whether dark mode is active */
	isDark: boolean;
}

const MeshGradientContext = createContext<MeshGradientContextValue | null>(null);

/**
 * Hook to access mesh gradient state for UI adaptation.
 * Returns null if used outside of MeshGradient.
 */
export function useMeshGradient(): MeshGradientContextValue | null {
	return useContext(MeshGradientContext);
}

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

/** Canvas resolution scale (0.5 = half resolution for performance) */
const RESOLUTION_SCALE = 0.5;

/** Edge fade distance in pixels (gradient fades to transparent at edges) */
const EDGE_FADE = 60;

/** Color blend falloff power (higher = sharper color transitions) */
const BLEND_POWER = 2.2;

/** Noise warp intensity (0-1, how much noise distorts the gradient) */
const WARP_INTENSITY = 0.15;

// ═══════════════════════════════════════════════════════════════════════════
// SIMPLEX NOISE — Deterministic 2D implementation
// ═══════════════════════════════════════════════════════════════════════════

/**
 * 2D Simplex noise for organic gradient morphing.
 * Deterministic based on seed.
 */
class SimplexNoise {
	private perm: Uint8Array;
	private grad3: number[][];

	constructor(seed = 0) {
		this.grad3 = [
			[1, 1, 0],
			[-1, 1, 0],
			[1, -1, 0],
			[-1, -1, 0],
			[1, 0, 1],
			[-1, 0, 1],
			[1, 0, -1],
			[-1, 0, -1],
			[0, 1, 1],
			[0, -1, 1],
			[0, 1, -1],
			[0, -1, -1],
		];

		const p = new Uint8Array(256);
		for (let i = 0; i < 256; i++) p[i] = i;

		let s = seed;
		for (let i = 255; i > 0; i--) {
			s = (s * 16807) % 2147483647;
			const j = s % (i + 1);
			[p[i], p[j]] = [p[j], p[i]];
		}

		this.perm = new Uint8Array(512);
		for (let i = 0; i < 512; i++) this.perm[i] = p[i & 255];
	}

	noise2D(x: number, y: number): number {
		const F2 = 0.5 * (Math.sqrt(3) - 1);
		const G2 = (3 - Math.sqrt(3)) / 6;

		const s = (x + y) * F2;
		const i = Math.floor(x + s);
		const j = Math.floor(y + s);

		const t = (i + j) * G2;
		const x0 = x - (i - t);
		const y0 = y - (j - t);

		const [i1, j1] = x0 > y0 ? [1, 0] : [0, 1];
		const x1 = x0 - i1 + G2;
		const y1 = y0 - j1 + G2;
		const x2 = x0 - 1 + 2 * G2;
		const y2 = y0 - 1 + 2 * G2;

		const ii = i & 255;
		const jj = j & 255;
		const gi0 = this.perm[ii + this.perm[jj]] % 12;
		const gi1 = this.perm[ii + i1 + this.perm[jj + j1]] % 12;
		const gi2 = this.perm[ii + 1 + this.perm[jj + 1]] % 12;

		let n0 = 0,
			n1 = 0,
			n2 = 0;
		let t0 = 0.5 - x0 * x0 - y0 * y0;
		if (t0 >= 0) {
			t0 *= t0;
			n0 = t0 * t0 * (this.grad3[gi0][0] * x0 + this.grad3[gi0][1] * y0);
		}
		let t1 = 0.5 - x1 * x1 - y1 * y1;
		if (t1 >= 0) {
			t1 *= t1;
			n1 = t1 * t1 * (this.grad3[gi1][0] * x1 + this.grad3[gi1][1] * y1);
		}
		let t2 = 0.5 - x2 * x2 - y2 * y2;
		if (t2 >= 0) {
			t2 *= t2;
			n2 = t2 * t2 * (this.grad3[gi2][0] * x2 + this.grad3[gi2][1] * y2);
		}

		return 70 * (n0 + n1 + n2);
	}

	fbm(x: number, y: number, octaves = 3): number {
		let value = 0;
		let amp = 1;
		let freq = 1;
		let max = 0;
		for (let i = 0; i < octaves; i++) {
			value += amp * this.noise2D(x * freq, y * freq);
			max += amp;
			amp *= 0.5;
			freq *= 2;
		}
		return value / max;
	}
}

// ═══════════════════════════════════════════════════════════════════════════
// COLOR CONTROL POINTS — Vivid spotlight-style gradient
// ═══════════════════════════════════════════════════════════════════════════

interface ColorPoint {
	/** X position (0-1) */
	x: number;
	/** Y position (0-1) */
	y: number;
	/** RGB color [r, g, b] */
	color: [number, number, number];
	/** Influence radius (0-1) */
	radius: number;
	/** Weight multiplier */
	weight: number;
}

/**
 * Light mode: Vercel-style atmospheric haze.
 * Single color family (cool gray-blue) with subtle warm accent.
 * Minimal, clean, barely-there.
 */
const LIGHT_COLORS: ColorPoint[] = [
	// Primary glow: upper area, cool gray with blue undertone
	{ x: 0.5, y: 0.2, color: [240, 242, 248], radius: 0.9, weight: 1.0 },
	// Warm accent: subtle warmth to prevent sterile feel
	{ x: 0.75, y: 0.35, color: [250, 248, 245], radius: 0.6, weight: 0.5 },
];

/**
 * Dark mode: Linear-style deep atmospheric glow.
 * Single color family (deep blue-gray) radiating from top.
 * Clean, sophisticated, not colorful.
 */
const DARK_COLORS: ColorPoint[] = [
	// Primary glow: upper area, deep blue-gray atmosphere
	{ x: 0.5, y: 0.15, color: [22, 26, 35], radius: 0.85, weight: 1.0 },
	// Secondary depth: adds dimension without color clash
	{ x: 0.3, y: 0.4, color: [18, 22, 30], radius: 0.7, weight: 0.6 },
];

/** Base background colors: pure achromatic */
const BASE_LIGHT: [number, number, number] = [250, 250, 250];
const BASE_DARK: [number, number, number] = [10, 10, 12];

// ═══════════════════════════════════════════════════════════════════════════
// GRADIENT RENDERER
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Render mesh gradient to canvas with edge fade.
 * Uses noise-warped color blending for organic look.
 */
function renderGradient(
	canvas: HTMLCanvasElement,
	width: number,
	height: number,
	noise: SimplexNoise,
	colors: ColorPoint[],
	baseColor: [number, number, number],
	edgeFade: number,
): void {
	if (width <= 0 || height <= 0) return;

	canvas.width = width;
	canvas.height = height;

	const ctx = canvas.getContext("2d", { alpha: true });
	if (!ctx) return;

	const imageData = ctx.createImageData(width, height);
	const data = imageData.data;

	// Pre-calculate edge fade distances (scaled to canvas resolution)
	const fadeLeft = edgeFade * RESOLUTION_SCALE;
	const fadeRight = width - edgeFade * RESOLUTION_SCALE;
	const fadeTop = edgeFade * RESOLUTION_SCALE;
	const fadeBottom = height - edgeFade * RESOLUTION_SCALE;

	for (let py = 0; py < height; py++) {
		for (let px = 0; px < width; px++) {
			const idx = (py * width + px) * 4;
			const nx = px / width;
			const ny = py / height;

			// Noise-warped coordinates for organic shapes
			const noiseX = noise.fbm(nx * 2.5, ny * 2.5, 3);
			const noiseY = noise.fbm(nx * 2.5 + 50, ny * 2.5 + 50, 3);
			const warpedX = nx + noiseX * WARP_INTENSITY;
			const warpedY = ny + noiseY * WARP_INTENSITY;

			// Blend colors from all control points
			let r = 0,
				g = 0,
				b = 0,
				totalWeight = 0;

			for (const point of colors) {
				const dx = warpedX - point.x;
				const dy = warpedY - point.y;
				const dist = Math.sqrt(dx * dx + dy * dy);

				// Add noise variation to radius for organic edges
				const noiseVar = noise.noise2D(nx * 4 + point.x * 8, ny * 4 + point.y * 8);
				const adjustedRadius = point.radius * (1 + noiseVar * 0.2);

				const falloff = Math.max(0, 1 - dist / adjustedRadius);
				const weight = falloff ** BLEND_POWER * point.weight;

				r += point.color[0] * weight;
				g += point.color[1] * weight;
				b += point.color[2] * weight;
				totalWeight += weight;
			}

			// Blend with base color based on total influence
			if (totalWeight > 0) {
				r /= totalWeight;
				g /= totalWeight;
				b /= totalWeight;
				const influence = Math.min(1, totalWeight);
				r = baseColor[0] * (1 - influence) + r * influence;
				g = baseColor[1] * (1 - influence) + g * influence;
				b = baseColor[2] * (1 - influence) + b * influence;
			} else {
				[r, g, b] = baseColor;
			}

			// Calculate edge fade alpha (smooth gradient to transparent at edges)
			let alpha = 1;

			// Left edge fade
			if (px < fadeLeft) {
				alpha *= px / fadeLeft;
			}
			// Right edge fade
			if (px > fadeRight) {
				alpha *= (width - px) / (width - fadeRight);
			}
			// Top edge fade
			if (py < fadeTop) {
				alpha *= py / fadeTop;
			}
			// Bottom edge fade
			if (py > fadeBottom) {
				alpha *= (height - py) / (height - fadeBottom);
			}

			// Apply smoothstep for softer fade
			alpha = alpha * alpha * (3 - 2 * alpha);

			data[idx] = Math.round(Math.max(0, Math.min(255, r)));
			data[idx + 1] = Math.round(Math.max(0, Math.min(255, g)));
			data[idx + 2] = Math.round(Math.max(0, Math.min(255, b)));
			data[idx + 3] = Math.round(alpha * 255);
		}
	}

	ctx.putImageData(imageData, 0, 0);
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface MeshGradientProps {
	className?: string;
	/** Children that will receive mesh gradient context */
	children?: React.ReactNode;
}

/**
 * Canvas-based mesh gradient with pixel-perfect SwissGrid alignment.
 * Exposes theme state to children via context.
 *
 * @example
 * <MeshGradient className="absolute inset-0">
 *   <HeroContent />
 * </MeshGradient>
 */
export function MeshGradient({ className, children }: MeshGradientProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const noiseRef = useRef<SimplexNoise | null>(null);
	const [mounted, setMounted] = useState(false);
	const [isDark, setIsDark] = useState(false);
	const swissGrid = useSwissGrid();

	// Initialize noise generator
	useEffect(() => {
		noiseRef.current = new SimplexNoise(42);
		setMounted(true);
	}, []);

	// Theme detection
	useEffect(() => {
		if (typeof window === "undefined") return;

		const checkDark = () => {
			const isDarkMode = document.documentElement.classList.contains("dark");
			setIsDark(isDarkMode);
		};

		checkDark();

		const observer = new MutationObserver(checkDark);
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["class"],
		});

		return () => observer.disconnect();
	}, []);

	// Context value
	const contextValue = useMemo<MeshGradientContextValue>(
		() => ({
			needsLightText: isDark,
			isDark,
		}),
		[isDark],
	);

	// Get EXACT bounds from SwissGrid (same Math.round as grid uses)
	const containerBounds = swissGrid?.containerBounds;

	// Render gradient when bounds/theme change
	const renderCanvas = useCallback(() => {
		const canvas = canvasRef.current;
		const container = containerRef.current;
		const noise = noiseRef.current;
		if (!canvas || !container || !noise || !containerBounds) return;

		// Use EXACT same rounding as SwissGrid
		const width = Math.round(containerBounds.width);
		const height = container.clientHeight;
		if (width <= 0 || height <= 0) return;

		// Scale for performance
		const scaledWidth = Math.round(width * RESOLUTION_SCALE);
		const scaledHeight = Math.round(height * RESOLUTION_SCALE);

		const colors = isDark ? DARK_COLORS : LIGHT_COLORS;
		const baseColor = isDark ? BASE_DARK : BASE_LIGHT;

		renderGradient(canvas, scaledWidth, scaledHeight, noise, colors, baseColor, EDGE_FADE);
	}, [containerBounds, isDark]);

	// Render on mount and when dependencies change
	useEffect(() => {
		if (!mounted || !containerBounds) return;
		renderCanvas();
	}, [mounted, containerBounds, renderCanvas]);

	// Re-render on resize
	useEffect(() => {
		if (!mounted) return;

		const handleResize = () => {
			requestAnimationFrame(renderCanvas);
		};

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, [mounted, renderCanvas]);

	// Container positioning — EXACT same logic as SwissGrid
	const containerStyle = useMemo(() => {
		if (!containerBounds) return {};
		// Use EXACT same Math.round as SwissGrid for pixel-perfect alignment
		return {
			left: Math.round(containerBounds.left),
			width: Math.round(containerBounds.width),
			top: 0,
			bottom: 0,
		};
	}, [containerBounds]);

	// Reveal phase integration
	const { phase } = useReveal();
	const shouldReduceMotion = useReducedMotion();

	// Gradient reveals at phase 1 (with primary content)
	const isRevealed = phase >= 1;

	// Only show when we have proper bounds from SwissGrid
	const hasBounds = !!containerBounds;
	const isReady = mounted && hasBounds;

	return (
		<MeshGradientContext.Provider value={contextValue}>
			<motion.div
				ref={containerRef}
				initial={{ opacity: 0 }}
				animate={isRevealed && isReady ? { opacity: 1 } : { opacity: 0 }}
				transition={shouldReduceMotion ? { duration: 0 } : springs.gentle}
				className={cn("pointer-events-none absolute z-1", className)}
				style={containerStyle}
				aria-hidden="true"
			>
				<canvas
					ref={canvasRef}
					className="h-full w-full"
					style={{
						display: "block",
						imageRendering: "auto",
					}}
				/>
			</motion.div>
			{children}
		</MeshGradientContext.Provider>
	);
}

export default MeshGradient;
