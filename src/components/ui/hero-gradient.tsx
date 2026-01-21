/**
 * Hero Mesh Gradient — GPU-Accelerated Noise Shader.
 *
 * @remarks
 * Organic mesh gradient using pre-computed noise textures.
 *
 * Architecture:
 * 1. Pre-computed noise texture (computed once, reused)
 * 2. CSS transform-based animation (GPU composited)
 * 3. Grain overlay via separate cached layer
 * 4. Hard-clipped to max-w-3xl container bounds
 *
 * Performance:
 * - Pre-computed base gradient texture (no per-frame noise calc)
 * - CSS transforms for animation (GPU layer, 240fps capable)
 * - Throttled grain updates (separate RAF at 30fps)
 * - Respects prefers-reduced-motion
 *
 * @example
 * ```tsx
 * <HeroGradient className="absolute inset-0" />
 * ```
 *
 * @public
 */

"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useRef, useState } from "react";
import { distances } from "@/src/lib/index";
import { useReveal } from "../providers/reveal-provider";

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

/** Canvas resolution scale (lower = better perf, upscaled by CSS) */
const RESOLUTION_SCALE = 0.25;

/** Number of gradient layers for parallax depth */
const LAYER_COUNT = 3;

/** Layer IDs for stable React keys */
const LAYER_IDS = ["layer-base", "layer-mid", "layer-top"] as const;

/** Layer animation speeds (relative) */
const LAYER_SPEEDS = [1, 0.6, 0.35];

/** Grain intensity (0-1) */
const GRAIN_INTENSITY = 0.03;

/** Grain update interval in ms (30fps = 33ms) */
const GRAIN_INTERVAL = 33;

/** Color blend falloff power (higher = sharper edges) */
const BLEND_POWER = 2.0;

/** CSS animation duration in seconds */
const ANIMATION_DURATION = 25;

// ═══════════════════════════════════════════════════════════════════════════
// SIMPLEX NOISE — Fast 2D implementation (Stefan Gustavson)
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
// COLOR CONTROL POINTS — Asymmetric mesh gradient
// ═══════════════════════════════════════════════════════════════════════════

interface ColorPoint {
	x: number;
	y: number;
	color: [number, number, number];
	radius: number;
	weight: number;
}

const LIGHT_COLORS: ColorPoint[] = [
	{ x: 0.12, y: 0.18, color: [248, 232, 230], radius: 0.75, weight: 1.0 },
	{ x: 0.88, y: 0.12, color: [255, 248, 238], radius: 0.65, weight: 0.85 },
	{ x: 0.08, y: 0.78, color: [238, 242, 252], radius: 0.6, weight: 0.65 },
	{ x: 0.55, y: 0.32, color: [252, 238, 235], radius: 0.55, weight: 0.95 },
	{ x: 0.75, y: 0.65, color: [255, 250, 245], radius: 0.7, weight: 0.55 },
];

const DARK_COLORS: ColorPoint[] = [
	{ x: 0.12, y: 0.18, color: [48, 28, 32], radius: 0.75, weight: 1.0 },
	{ x: 0.88, y: 0.12, color: [52, 42, 28], radius: 0.65, weight: 0.85 },
	{ x: 0.08, y: 0.78, color: [22, 28, 48], radius: 0.6, weight: 0.65 },
	{ x: 0.55, y: 0.32, color: [58, 32, 38], radius: 0.55, weight: 0.95 },
	{ x: 0.75, y: 0.65, color: [38, 32, 30], radius: 0.7, weight: 0.55 },
];

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface HeroGradientProps {
	className?: string;
}

const revealSpring = {
	type: "spring" as const,
	mass: 0.9,
	stiffness: 180,
	damping: 26,
};

/**
 * Render a single gradient layer to canvas.
 * Called once per layer on mount/resize/theme change.
 */
function renderGradientLayer(
	canvas: HTMLCanvasElement,
	width: number,
	height: number,
	noise: SimplexNoise,
	colors: ColorPoint[],
	baseColor: [number, number, number],
	layerOffset: number,
): void {
	if (width <= 0 || height <= 0) return;

	if (canvas.width !== width || canvas.height !== height) {
		canvas.width = width;
		canvas.height = height;
	}

	const ctx = canvas.getContext("2d", { alpha: true });
	if (!ctx) return;

	const imageData = ctx.createImageData(width, height);
	const data = imageData.data;

	for (let py = 0; py < height; py++) {
		for (let px = 0; px < width; px++) {
			const idx = (py * width + px) * 4;
			const nx = px / width;
			const ny = py / height;

			// Noise-warped coordinates (pre-computed, static per layer)
			const noiseX = noise.fbm(nx * 2.5 + layerOffset, ny * 2.5 + layerOffset * 0.6, 3);
			const noiseY = noise.fbm(
				nx * 2.5 + 50 + layerOffset * 0.7,
				ny * 2.5 + 50 + layerOffset,
				3,
			);
			const warpedX = nx + noiseX * 0.18;
			const warpedY = ny + noiseY * 0.18;

			let r = 0,
				g = 0,
				b = 0,
				totalWeight = 0;

			for (const point of colors) {
				const dx = warpedX - point.x;
				const dy = warpedY - point.y;
				const dist = Math.sqrt(dx * dx + dy * dy);
				const noiseVar = noise.noise2D(nx * 4 + point.x * 8, ny * 4 + point.y * 8);
				const adjustedRadius = point.radius * (1 + noiseVar * 0.25);
				const falloff = Math.max(0, 1 - dist / adjustedRadius);
				const weight = falloff ** BLEND_POWER * point.weight;

				r += point.color[0] * weight;
				g += point.color[1] * weight;
				b += point.color[2] * weight;
				totalWeight += weight;
			}

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

			data[idx] = Math.round(Math.max(0, Math.min(255, r)));
			data[idx + 1] = Math.round(Math.max(0, Math.min(255, g)));
			data[idx + 2] = Math.round(Math.max(0, Math.min(255, b)));
			data[idx + 3] = 255;
		}
	}

	ctx.putImageData(imageData, 0, 0);
}

/**
 * Render grain overlay to a separate canvas.
 * Updated at lower framerate for performance.
 */
function renderGrain(
	canvas: HTMLCanvasElement,
	width: number,
	height: number,
	noise: SimplexNoise,
	time: number,
): void {
	if (width <= 0 || height <= 0) return;

	if (canvas.width !== width || canvas.height !== height) {
		canvas.width = width;
		canvas.height = height;
	}

	const ctx = canvas.getContext("2d", { alpha: true });
	if (!ctx) return;

	const imageData = ctx.createImageData(width, height);
	const data = imageData.data;

	for (let py = 0; py < height; py++) {
		for (let px = 0; px < width; px++) {
			const idx = (py * width + px) * 4;
			const grain = (noise.noise2D(px * 0.5 + time * 5, py * 0.5) * 0.5 + 0.5) * 255;
			data[idx] = grain;
			data[idx + 1] = grain;
			data[idx + 2] = grain;
			data[idx + 3] = Math.round(GRAIN_INTENSITY * 255);
		}
	}

	ctx.putImageData(imageData, 0, 0);
}

export function HeroGradient({ className = "" }: HeroGradientProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const layerRefs = useRef<(HTMLCanvasElement | null)[]>([]);
	const grainRef = useRef<HTMLCanvasElement>(null);
	const noiseRef = useRef<SimplexNoise | null>(null);
	const grainTimeRef = useRef(0);
	const grainRafRef = useRef<number>(0);
	const lastGrainUpdateRef = useRef(0);

	const { resolvedTheme } = useTheme();
	const { phase } = useReveal();
	const [mounted, setMounted] = useState(false);
	const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
	const prefersReducedMotion = useReducedMotion();

	const isDark = resolvedTheme === "dark";
	const isEnabled = phase >= 2;

	useEffect(() => {
		noiseRef.current = new SimplexNoise(42);
		setMounted(true);
	}, []);

	// Measure container and trigger re-render of layers
	const updateDimensions = useCallback(() => {
		const container = containerRef.current;
		if (!container) return;
		const rect = container.getBoundingClientRect();
		const width = Math.floor(rect.width * RESOLUTION_SCALE);
		const height = Math.floor(rect.height * RESOLUTION_SCALE);
		setDimensions((prev) =>
			prev.width === width && prev.height === height ? prev : { width, height },
		);
	}, []);

	// Render static gradient layers (only on mount/resize/theme change)
	useEffect(() => {
		if (!mounted || dimensions.width === 0) return;

		const noise = noiseRef.current;
		if (!noise) return;

		const colors = isDark ? DARK_COLORS : LIGHT_COLORS;
		const baseColor: [number, number, number] = isDark ? [18, 18, 22] : [253, 253, 254];

		// Render each layer with different noise offsets
		for (let i = 0; i < LAYER_COUNT; i++) {
			const canvas = layerRefs.current[i];
			if (canvas) {
				renderGradientLayer(
					canvas,
					dimensions.width,
					dimensions.height,
					noise,
					colors,
					baseColor,
					i * 0.5, // Different offset per layer
				);
			}
		}
	}, [mounted, dimensions, isDark]);

	// Grain animation loop (throttled to 30fps)
	useEffect(() => {
		if (!mounted || !isEnabled || prefersReducedMotion) return;

		const noise = noiseRef.current;
		const grainCanvas = grainRef.current;
		if (!noise || !grainCanvas || dimensions.width === 0) return;

		const animate = (currentTime: number) => {
			if (currentTime - lastGrainUpdateRef.current >= GRAIN_INTERVAL) {
				lastGrainUpdateRef.current = currentTime;
				grainTimeRef.current += 0.033;
				renderGrain(
					grainCanvas,
					dimensions.width,
					dimensions.height,
					noise,
					grainTimeRef.current,
				);
			}
			grainRafRef.current = requestAnimationFrame(animate);
		};

		// Initial render
		renderGrain(grainCanvas, dimensions.width, dimensions.height, noise, 0);
		grainRafRef.current = requestAnimationFrame(animate);

		return () => {
			if (grainRafRef.current) cancelAnimationFrame(grainRafRef.current);
		};
	}, [mounted, isEnabled, dimensions, prefersReducedMotion]);

	// Resize observer
	useEffect(() => {
		if (!mounted) return;

		updateDimensions();

		const observer = new ResizeObserver(() => {
			requestAnimationFrame(updateDimensions);
		});

		if (containerRef.current) {
			observer.observe(containerRef.current);
		}

		return () => observer.disconnect();
	}, [mounted, updateDimensions]);

	if (!mounted) return null;

	return (
		<div className={`flex justify-center ${className}`} aria-hidden="true">
			{/* Centered container matching SwissGrid max-w-3xl */}
			<div
				ref={containerRef}
				className="h-full w-full max-w-3xl overflow-hidden"
				style={{ contain: "strict" }}
			>
				<motion.div
					initial={{
						opacity: 0,
						scale: 0.96,
						y: prefersReducedMotion ? 0 : -distances.medium,
					}}
					animate={
						isEnabled
							? { opacity: 1, scale: 1, y: 0 }
							: {
									opacity: 0,
									scale: 0.96,
									y: prefersReducedMotion ? 0 : -distances.medium,
								}
					}
					transition={prefersReducedMotion ? { duration: 0 } : revealSpring}
					className="relative h-full w-full"
					style={{ willChange: "transform, opacity" }}
				>
					{/* Gradient layers — CSS-animated for 240fps */}
					{LAYER_IDS.map((id, i) => (
						<canvas
							key={id}
							ref={(el) => {
								layerRefs.current[i] = el;
							}}
							className="absolute inset-0 h-full w-full"
							style={{
								imageRendering: "auto",
								opacity: 1 - i * 0.25,
								mixBlendMode: i === 0 ? "normal" : "soft-light",
								// CSS animation for GPU-composited movement
								animation: prefersReducedMotion
									? "none"
									: `heroGradientFloat${i} ${ANIMATION_DURATION / LAYER_SPEEDS[i]}s ease-in-out infinite`,
								transform: "translateZ(0)", // Force GPU layer
							}}
						/>
					))}

					{/* Grain overlay — throttled RAF */}
					<canvas
						ref={grainRef}
						className="pointer-events-none absolute inset-0 h-full w-full"
						style={{
							imageRendering: "auto",
							mixBlendMode: "overlay",
							transform: "translateZ(0)",
						}}
					/>
				</motion.div>
			</div>

			{/* CSS Keyframes for GPU animation */}
			<style jsx>{`
				@keyframes heroGradientFloat0 {
					0%, 100% { transform: translateZ(0) translate(0%, 0%) scale(1); }
					25% { transform: translateZ(0) translate(2%, 1%) scale(1.02); }
					50% { transform: translateZ(0) translate(0%, 2%) scale(1); }
					75% { transform: translateZ(0) translate(-2%, 1%) scale(1.02); }
				}
				@keyframes heroGradientFloat1 {
					0%, 100% { transform: translateZ(0) translate(0%, 0%) scale(1.01); }
					33% { transform: translateZ(0) translate(-3%, 2%) scale(1); }
					66% { transform: translateZ(0) translate(2%, -1%) scale(1.03); }
				}
				@keyframes heroGradientFloat2 {
					0%, 100% { transform: translateZ(0) translate(1%, -1%) scale(1); }
					50% { transform: translateZ(0) translate(-1%, 2%) scale(1.02); }
				}
			`}</style>
		</div>
	);
}
