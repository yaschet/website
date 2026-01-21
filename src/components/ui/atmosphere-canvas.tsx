/**
 * Atmosphere Canvas — Dynamic Sky Background.
 *
 * @remarks
 * Renders a time-aware sky atmosphere inspired by the blue hour / Fajr prayer time.
 * Single unified canvas - no overlay pacing, no green-screen effect.
 *
 * Architecture:
 * 1. Single canvas rendering sky gradient + clouds in one pass
 * 2. Procedural cloud shapes via fractal noise (no CSS transforms)
 * 3. Slow, organic drift animation (GPU-friendly, throttled)
 * 4. Time-aware color palette (dawn, day, dusk, night)
 *
 * Performance:
 * - 25% resolution canvas upscaled via CSS
 * - Throttled RAF loop (24fps for clouds, imperceptible)
 * - Pre-computed gradient, only clouds animate
 * - Single composite pass (no layer gaps)
 *
 * @example
 * ```tsx
 * <AtmosphereCanvas className="absolute inset-0 -z-10" />
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
const RESOLUTION_SCALE = 0.2;

/** Animation frame interval in ms (24fps = 42ms) */
const FRAME_INTERVAL = 42;

/** Cloud drift speed (pixels per second at full resolution) */
const DRIFT_SPEED = 0.015;

/** Cloud density (0-1, higher = more clouds) */
const CLOUD_DENSITY = 0.4;

/** Cloud softness (blur factor) */
const CLOUD_SOFTNESS = 0.6;

// ═══════════════════════════════════════════════════════════════════════════
// SKY PALETTES — Time-based color schemes
// ═══════════════════════════════════════════════════════════════════════════

interface SkyPalette {
	/** Top of sky gradient */
	zenith: [number, number, number];
	/** Horizon color */
	horizon: [number, number, number];
	/** Cloud highlight color */
	cloudLight: [number, number, number];
	/** Cloud shadow color */
	cloudShadow: [number, number, number];
	/** Overall atmosphere tint */
	atmosphereTint: [number, number, number];
}

/**
 * Fajr / Blue Hour palette (5:00-6:30 AM)
 * The sacred twilight before sunrise - deep blues transitioning to soft warmth
 */
const PALETTE_FAJR: SkyPalette = {
	zenith: [25, 35, 65], // Deep twilight blue
	horizon: [85, 95, 130], // Soft steel blue
	cloudLight: [140, 150, 180], // Silvery blue
	cloudShadow: [45, 55, 85], // Deep shadow blue
	atmosphereTint: [70, 85, 120], // Overall blue cast
};

/**
 * Dawn palette (6:30-8:00 AM)
 * Golden hour beginning - warmth entering the blue
 */
const PALETTE_DAWN: SkyPalette = {
	zenith: [65, 100, 145], // Clear morning blue
	horizon: [180, 160, 150], // Warm horizon
	cloudLight: [255, 245, 235], // Warm white
	cloudShadow: [100, 110, 140], // Blue shadow
	atmosphereTint: [130, 150, 180], // Clear blue
};

/**
 * Day palette (8:00 AM - 5:00 PM)
 * Clear sky blue
 */
const PALETTE_DAY: SkyPalette = {
	zenith: [85, 140, 200], // Sky blue
	horizon: [175, 210, 235], // Light horizon
	cloudLight: [255, 255, 255], // Pure white
	cloudShadow: [180, 195, 215], // Light shadow
	atmosphereTint: [150, 190, 230], // Clear atmosphere
};

/**
 * Dusk palette (5:00-7:00 PM)
 * Golden hour - warm light
 */
const PALETTE_DUSK: SkyPalette = {
	zenith: [70, 90, 140], // Deepening blue
	horizon: [220, 160, 130], // Warm orange horizon
	cloudLight: [255, 220, 190], // Golden clouds
	cloudShadow: [90, 80, 100], // Purple shadow
	atmosphereTint: [150, 130, 140], // Warm cast
};

/**
 * Night palette (7:00 PM - 5:00 AM)
 * Deep blue night sky
 */
const PALETTE_NIGHT: SkyPalette = {
	zenith: [12, 18, 30], // Deep night
	horizon: [25, 35, 55], // Dark horizon
	cloudLight: [45, 55, 75], // Moonlit cloud
	cloudShadow: [15, 20, 35], // Deep shadow
	atmosphereTint: [20, 28, 45], // Night tint
};

/**
 * Dark mode palette - subtle, muted atmosphere
 */
const PALETTE_DARK: SkyPalette = {
	zenith: [15, 18, 25], // Near black
	horizon: [25, 30, 40], // Dark gray-blue
	cloudLight: [40, 45, 55], // Subtle highlight
	cloudShadow: [12, 15, 22], // Deep shadow
	atmosphereTint: [18, 22, 30], // Dark tint
};

/**
 * Get sky palette based on current hour.
 */
function getPaletteForHour(hour: number, isDark: boolean): SkyPalette {
	if (isDark) return PALETTE_DARK;

	// Fajr: 5:00-6:30
	if (hour >= 5 && hour < 6.5) return PALETTE_FAJR;
	// Dawn: 6:30-8:00
	if (hour >= 6.5 && hour < 8) return PALETTE_DAWN;
	// Day: 8:00-17:00
	if (hour >= 8 && hour < 17) return PALETTE_DAY;
	// Dusk: 17:00-19:00
	if (hour >= 17 && hour < 19) return PALETTE_DUSK;
	// Night: 19:00-5:00
	return PALETTE_NIGHT;
}

// ═══════════════════════════════════════════════════════════════════════════
// SIMPLEX NOISE — Organic cloud shapes
// ═══════════════════════════════════════════════════════════════════════════

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

	/**
	 * Fractal Brownian Motion for cloud-like shapes.
	 */
	fbm(x: number, y: number, octaves = 4): number {
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
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface AtmosphereCanvasProps {
	className?: string;
}

const revealSpring = {
	type: "spring" as const,
	mass: 0.9,
	stiffness: 180,
	damping: 26,
};

/**
 * Render complete sky scene to canvas (gradient + clouds in one pass).
 */
function renderAtmosphere(
	canvas: HTMLCanvasElement,
	width: number,
	height: number,
	noise: SimplexNoise,
	palette: SkyPalette,
	time: number,
): void {
	if (width <= 0 || height <= 0) return;

	if (canvas.width !== width || canvas.height !== height) {
		canvas.width = width;
		canvas.height = height;
	}

	const ctx = canvas.getContext("2d", { alpha: false });
	if (!ctx) return;

	const imageData = ctx.createImageData(width, height);
	const data = imageData.data;

	// Drift offset for cloud movement
	const driftX = time * DRIFT_SPEED;
	const driftY = time * DRIFT_SPEED * 0.3;

	for (let py = 0; py < height; py++) {
		// Normalized Y (0 = top, 1 = bottom)
		const ny = py / height;

		// Sky gradient interpolation (zenith to horizon)
		// Use eased curve for more natural sky gradient
		const gradientT = ny ** 0.7;
		const skyR = palette.zenith[0] + (palette.horizon[0] - palette.zenith[0]) * gradientT;
		const skyG = palette.zenith[1] + (palette.horizon[1] - palette.zenith[1]) * gradientT;
		const skyB = palette.zenith[2] + (palette.horizon[2] - palette.zenith[2]) * gradientT;

		for (let px = 0; px < width; px++) {
			const idx = (py * width + px) * 4;
			const nx = px / width;

			// Cloud noise at multiple scales
			const cloudNoise1 = noise.fbm(nx * 2 + driftX, ny * 1.5 + driftY, 4);
			const cloudNoise2 = noise.fbm(nx * 4 + driftX * 1.5, ny * 3 + driftY * 0.8, 3);
			const cloudNoise3 = noise.fbm(nx * 1 + driftX * 0.5, ny * 0.8 + driftY * 1.2, 2);

			// Combine noise layers for cloud shape
			let cloudValue = cloudNoise1 * 0.5 + cloudNoise2 * 0.3 + cloudNoise3 * 0.2;

			// Apply density threshold (creates distinct cloud shapes vs. haze)
			const threshold = 1 - CLOUD_DENSITY;
			cloudValue = Math.max(0, (cloudValue - threshold) / (1 - threshold));

			// Soften cloud edges
			cloudValue = cloudValue ** CLOUD_SOFTNESS;

			// Clouds are more visible near horizon (atmospheric perspective)
			const horizonFade = ny ** 0.5;
			cloudValue *= 0.3 + horizonFade * 0.7;

			// Cloud lighting (use noise for variation)
			const lightNoise = noise.noise2D(nx * 3 + 100, ny * 2 + 100) * 0.5 + 0.5;
			const cloudR =
				palette.cloudShadow[0] +
				(palette.cloudLight[0] - palette.cloudShadow[0]) * lightNoise;
			const cloudG =
				palette.cloudShadow[1] +
				(palette.cloudLight[1] - palette.cloudShadow[1]) * lightNoise;
			const cloudB =
				palette.cloudShadow[2] +
				(palette.cloudLight[2] - palette.cloudShadow[2]) * lightNoise;

			// Blend sky and clouds
			const r = skyR * (1 - cloudValue) + cloudR * cloudValue;
			const g = skyG * (1 - cloudValue) + cloudG * cloudValue;
			const b = skyB * (1 - cloudValue) + cloudB * cloudValue;

			// Apply subtle atmosphere tint
			const tintStrength = 0.1;
			const finalR = r * (1 - tintStrength) + palette.atmosphereTint[0] * tintStrength;
			const finalG = g * (1 - tintStrength) + palette.atmosphereTint[1] * tintStrength;
			const finalB = b * (1 - tintStrength) + palette.atmosphereTint[2] * tintStrength;

			data[idx] = Math.round(Math.max(0, Math.min(255, finalR)));
			data[idx + 1] = Math.round(Math.max(0, Math.min(255, finalG)));
			data[idx + 2] = Math.round(Math.max(0, Math.min(255, finalB)));
			data[idx + 3] = 255;
		}
	}

	ctx.putImageData(imageData, 0, 0);
}

export function AtmosphereCanvas({ className = "" }: AtmosphereCanvasProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const noiseRef = useRef<SimplexNoise | null>(null);
	const timeRef = useRef(0);
	const rafRef = useRef<number>(0);
	const lastFrameRef = useRef(0);

	const { resolvedTheme } = useTheme();
	const { phase } = useReveal();
	const [mounted, setMounted] = useState(false);
	const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
	const prefersReducedMotion = useReducedMotion();

	const isDark = resolvedTheme === "dark";
	const isEnabled = phase >= 2;

	// Get current hour for time-based palette
	const currentHour = new Date().getHours() + new Date().getMinutes() / 60;
	const palette = getPaletteForHour(currentHour, isDark);

	useEffect(() => {
		noiseRef.current = new SimplexNoise(42);
		setMounted(true);
	}, []);

	// Measure container
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

	// Animation loop (throttled)
	useEffect(() => {
		if (!mounted || !isEnabled) return;

		const canvas = canvasRef.current;
		const noise = noiseRef.current;
		if (!canvas || !noise || dimensions.width === 0) return;

		const animate = (currentTime: number) => {
			// Throttle to target frame rate
			if (currentTime - lastFrameRef.current >= FRAME_INTERVAL) {
				lastFrameRef.current = currentTime;

				if (!prefersReducedMotion) {
					timeRef.current += FRAME_INTERVAL / 1000;
				}

				renderAtmosphere(
					canvas,
					dimensions.width,
					dimensions.height,
					noise,
					palette,
					timeRef.current,
				);
			}

			rafRef.current = requestAnimationFrame(animate);
		};

		// Initial render
		renderAtmosphere(canvas, dimensions.width, dimensions.height, noise, palette, 0);
		rafRef.current = requestAnimationFrame(animate);

		return () => {
			if (rafRef.current) cancelAnimationFrame(rafRef.current);
		};
	}, [mounted, isEnabled, dimensions, palette, prefersReducedMotion]);

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
				style={{ contain: "layout style" }}
			>
				<motion.div
					initial={{
						opacity: 0,
						scale: 0.98,
						y: prefersReducedMotion ? 0 : -distances.small,
					}}
					animate={
						isEnabled
							? { opacity: 1, scale: 1, y: 0 }
							: {
									opacity: 0,
									scale: 0.98,
									y: prefersReducedMotion ? 0 : -distances.small,
								}
					}
					transition={prefersReducedMotion ? { duration: 0 } : revealSpring}
					className="h-full w-full"
					style={{ willChange: "transform, opacity" }}
				>
					{/* Single unified canvas - no layers, no gaps */}
					<canvas
						ref={canvasRef}
						className="h-full w-full"
						style={{
							imageRendering: "auto",
							transform: "translateZ(0)",
						}}
					/>
				</motion.div>
			</div>
		</div>
	);
}
