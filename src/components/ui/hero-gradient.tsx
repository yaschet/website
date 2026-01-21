/**
 * Hero Mesh Gradient — Canvas Noise Shader Implementation.
 *
 * @remarks
 * Organic mesh gradient using canvas-based simplex noise.
 *
 * Architecture:
 * 1. Canvas 2D with procedural simplex noise (RAF loop)
 * 2. Multi-hue color field interpolation (not discrete blobs)
 * 3. Animated noise offset for organic morphing
 * 4. Film grain overlay via noise layer
 * 5. Hard-clipped to container bounds (overflow:hidden, no masks)
 *
 * Performance:
 * - 35% resolution rendering upscaled via CSS (smooth interpolation)
 * - Noise-based pixel manipulation on ImageData
 * - RAF with delta time for consistent animation speed
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
const RESOLUTION_SCALE = 0.35;

/** Animation speed (noise offset per second) */
const ANIMATION_SPEED = 0.08;

/** Grain intensity (0-1) */
const GRAIN_INTENSITY = 0.035;

/** Color blend falloff power (higher = sharper edges) */
const BLEND_POWER = 2.0;

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

export function HeroGradient({ className = "" }: HeroGradientProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const animationRef = useRef<number>(0);
	const noiseRef = useRef<SimplexNoise | null>(null);
	const timeRef = useRef(0);

	const { resolvedTheme } = useTheme();
	const { phase } = useReveal();
	const [mounted, setMounted] = useState(false);
	const prefersReducedMotion = useReducedMotion();

	const isDark = resolvedTheme === "dark";
	const isEnabled = phase >= 2;

	useEffect(() => {
		noiseRef.current = new SimplexNoise(42);
		setMounted(true);
	}, []);

	/**
	 * Render mesh gradient using noise-distorted color fields.
	 */
	const render = useCallback(
		(time: number) => {
			const canvas = canvasRef.current;
			const container = containerRef.current;
			const noise = noiseRef.current;
			if (!canvas || !container || !noise) return;

			const rect = container.getBoundingClientRect();
			const width = Math.floor(rect.width * RESOLUTION_SCALE);
			const height = Math.floor(rect.height * RESOLUTION_SCALE);
			if (width <= 0 || height <= 0) return;

			if (canvas.width !== width || canvas.height !== height) {
				canvas.width = width;
				canvas.height = height;
			}

			const ctx = canvas.getContext("2d", { willReadFrequently: true });
			if (!ctx) return;

			const imageData = ctx.createImageData(width, height);
			const data = imageData.data;
			const colors = isDark ? DARK_COLORS : LIGHT_COLORS;
			const baseColor: [number, number, number] = isDark ? [18, 18, 22] : [253, 253, 254];
			const animOffset = prefersReducedMotion ? 0 : time * ANIMATION_SPEED;

			for (let py = 0; py < height; py++) {
				for (let px = 0; px < width; px++) {
					const idx = (py * width + px) * 4;
					const nx = px / width;
					const ny = py / height;

					// Noise-warped coordinates
					const noiseX = noise.fbm(nx * 2.5 + animOffset, ny * 2.5 + animOffset * 0.6, 3);
					const noiseY = noise.fbm(
						nx * 2.5 + 50 + animOffset * 0.7,
						ny * 2.5 + 50 + animOffset,
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

					// Film grain
					const grain = (noise.noise2D(px * 0.8, py * 0.8 + time * 8) * 0.5 + 0.5) * 255;
					r = r * (1 - GRAIN_INTENSITY) + grain * GRAIN_INTENSITY;
					g = g * (1 - GRAIN_INTENSITY) + grain * GRAIN_INTENSITY;
					b = b * (1 - GRAIN_INTENSITY) + grain * GRAIN_INTENSITY;

					data[idx] = Math.round(Math.max(0, Math.min(255, r)));
					data[idx + 1] = Math.round(Math.max(0, Math.min(255, g)));
					data[idx + 2] = Math.round(Math.max(0, Math.min(255, b)));
					data[idx + 3] = 255;
				}
			}

			ctx.putImageData(imageData, 0, 0);
		},
		[isDark, prefersReducedMotion],
	);

	// Animation loop
	useEffect(() => {
		if (!mounted || !isEnabled) return;

		let lastTime = performance.now();
		const animate = (currentTime: number) => {
			const deltaTime = (currentTime - lastTime) / 1000;
			lastTime = currentTime;
			if (!prefersReducedMotion) timeRef.current += deltaTime;
			render(timeRef.current);
			animationRef.current = requestAnimationFrame(animate);
		};

		render(timeRef.current);
		if (!prefersReducedMotion) animationRef.current = requestAnimationFrame(animate);

		return () => {
			if (animationRef.current) cancelAnimationFrame(animationRef.current);
		};
	}, [mounted, isEnabled, render, prefersReducedMotion]);

	// Resize handler
	useEffect(() => {
		if (!mounted) return;
		const handleResize = () => render(timeRef.current);
		window.addEventListener("resize", handleResize, { passive: true });
		return () => window.removeEventListener("resize", handleResize);
	}, [mounted, render]);

	if (!mounted) return null;

	return (
		<div
			ref={containerRef}
			className={`overflow-hidden ${className}`}
			aria-hidden="true"
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
				className="h-full w-full"
				style={{ willChange: "transform, opacity" }}
			>
				<canvas
					ref={canvasRef}
					className="h-full w-full"
					style={{ imageRendering: "auto" }}
				/>
			</motion.div>
		</div>
	);
}
