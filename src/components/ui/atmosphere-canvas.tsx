"use client";

/**
 * Atmosphere Canvas - Time-Reactive Ambient Sky
 *
 * @module atmosphere-canvas
 * @description
 * Aesthetic sky background with soft, organic cloud formations.
 * Uses radial gradients and canvas blur for natural softness.
 *
 * Visual approach:
 * - Soft gradient-based cloud puffs
 * - Canvas filter blur for organic edges
 * - Time-of-day color adaptation
 * - Theme-aware rendering
 */

import { useTheme } from "next-themes";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SunCalc from "suncalc";
import { cn } from "@/lib/utils";
import { useSwissGrid } from "./swiss-grid-canvas";

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

/** Geographic coordinates for Morocco */
const LAT = 34.0333;
const LON = -5.0;

/** Animation settings */
const TARGET_FPS = 30;
const FRAME_DURATION = 1000 / TARGET_FPS;

/** Cloud movement speed (pixels per second) */
const DRIFT_SPEED = 12;

// ═══════════════════════════════════════════════════════════════════════════
// SIMPLEX NOISE - Clean implementation
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Attempt: OpenSimplex 2D noise for smooth, organic patterns.
 */
class SimplexNoise {
	private perm: Uint8Array;
	private permMod12: Uint8Array;

	private static readonly GRAD3 = [
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

	constructor(seed = 0) {
		this.perm = new Uint8Array(512);
		this.permMod12 = new Uint8Array(512);

		const p = new Uint8Array(256);
		for (let i = 0; i < 256; i++) p[i] = i;

		// Seed-based shuffle
		let s = seed;
		for (let i = 255; i > 0; i--) {
			s = ((s * 16807) % 2147483647) >>> 0;
			const j = s % (i + 1);
			[p[i], p[j]] = [p[j], p[i]];
		}

		for (let i = 0; i < 512; i++) {
			this.perm[i] = p[i & 255];
			this.permMod12[i] = this.perm[i] % 12;
		}
	}

	private dot2(g: number[], x: number, y: number): number {
		return g[0] * x + g[1] * y;
	}

	/**
	 * 2D Simplex noise
	 * @returns Value in range [-1, 1]
	 */
	noise2D(xin: number, yin: number): number {
		const F2 = 0.5 * (Math.sqrt(3) - 1);
		const G2 = (3 - Math.sqrt(3)) / 6;

		const s = (xin + yin) * F2;
		const i = Math.floor(xin + s);
		const j = Math.floor(yin + s);

		const t = (i + j) * G2;
		const X0 = i - t;
		const Y0 = j - t;
		const x0 = xin - X0;
		const y0 = yin - Y0;

		const i1 = x0 > y0 ? 1 : 0;
		const j1 = x0 > y0 ? 0 : 1;

		const x1 = x0 - i1 + G2;
		const y1 = y0 - j1 + G2;
		const x2 = x0 - 1 + 2 * G2;
		const y2 = y0 - 1 + 2 * G2;

		const ii = i & 255;
		const jj = j & 255;

		let n0 = 0;
		let n1 = 0;
		let n2 = 0;

		let t0 = 0.5 - x0 * x0 - y0 * y0;
		if (t0 >= 0) {
			t0 *= t0;
			const gi0 = this.permMod12[ii + this.perm[jj]];
			n0 = t0 * t0 * this.dot2(SimplexNoise.GRAD3[gi0], x0, y0);
		}

		let t1 = 0.5 - x1 * x1 - y1 * y1;
		if (t1 >= 0) {
			t1 *= t1;
			const gi1 = this.permMod12[ii + i1 + this.perm[jj + j1]];
			n1 = t1 * t1 * this.dot2(SimplexNoise.GRAD3[gi1], x1, y1);
		}

		let t2 = 0.5 - x2 * x2 - y2 * y2;
		if (t2 >= 0) {
			t2 *= t2;
			const gi2 = this.permMod12[ii + 1 + this.perm[jj + 1]];
			n2 = t2 * t2 * this.dot2(SimplexNoise.GRAD3[gi2], x2, y2);
		}

		return 70 * (n0 + n1 + n2);
	}

	/**
	 * Fractal Brownian Motion for natural cloud shapes
	 */
	fbm(x: number, y: number, octaves = 4, lacunarity = 2, gain = 0.5): number {
		let sum = 0;
		let amp = 1;
		let freq = 1;
		let max = 0;

		for (let i = 0; i < octaves; i++) {
			sum += this.noise2D(x * freq, y * freq) * amp;
			max += amp;
			amp *= gain;
			freq *= lacunarity;
		}

		return sum / max;
	}
}

// ═══════════════════════════════════════════════════════════════════════════
// TIME-BASED SKY COLORS
// ═══════════════════════════════════════════════════════════════════════════

interface SkyPalette {
	skyGradientTop: string;
	skyGradientBottom: string;
	cloudColor: string;
	cloudOpacity: number;
}

/**
 * Returns sky colors based on time and theme.
 * Light mode: Soft, warm tones. Dark mode: Deep, cool tones.
 */
function getSkyPalette(normalizedTime: number, isDark: boolean): SkyPalette {
	if (isDark) {
		// Dark mode: Deep navy with subtle time variation
		const nightDepth = 0.5 + Math.sin(normalizedTime * Math.PI) * 0.15;
		return {
			skyGradientTop: `hsl(230, 25%, ${8 + nightDepth * 4}%)`,
			skyGradientBottom: `hsl(230, 20%, ${12 + nightDepth * 6}%)`,
			cloudColor: `hsl(230, 15%, ${20 + nightDepth * 10}%)`,
			cloudOpacity: 0.3 + nightDepth * 0.15,
		};
	}

	// Light mode: Time-reactive sky
	// 0.0-0.25: Night to Dawn (cool to warm)
	// 0.25-0.5: Dawn to Noon (warm to neutral)
	// 0.5-0.75: Noon to Dusk (neutral to warm)
	// 0.75-1.0: Dusk to Night (warm to cool)

	const dawnFactor = Math.max(0, 1 - Math.abs(normalizedTime - 0.25) * 5);
	const duskFactor = Math.max(0, 1 - Math.abs(normalizedTime - 0.75) * 5);
	const goldenFactor = Math.max(dawnFactor, duskFactor);

	// Hue: 220 (blue) -> 35 (warm) during golden hour
	const hue = 220 - goldenFactor * 185;
	// Saturation increases during golden hour
	const sat = 8 + goldenFactor * 20;
	// Lightness: bright during day
	const daylight = Math.sin(normalizedTime * Math.PI);
	const lightTop = 92 - (1 - daylight) * 15;
	const lightBottom = 96 - (1 - daylight) * 10;

	return {
		skyGradientTop: `hsl(${hue}, ${sat}%, ${lightTop}%)`,
		skyGradientBottom: `hsl(${hue}, ${sat * 0.7}%, ${lightBottom}%)`,
		cloudColor: `hsl(${hue}, ${sat * 0.3}%, 99%)`,
		cloudOpacity: 0.7 + goldenFactor * 0.2,
	};
}

// ═══════════════════════════════════════════════════════════════════════════
// SOLAR CALCULATIONS
// ═══════════════════════════════════════════════════════════════════════════

interface SolarData {
	altitude: number;
	normalizedPosition: number;
}

function getSolarData(): SolarData {
	const now = new Date();
	try {
		const sunPosition = SunCalc.getPosition(now, LAT, LON);
		const times = SunCalc.getTimes(now, LAT, LON);

		const t = now.getTime();
		const sunrise = times.sunrise.getTime();
		const sunset = times.sunset.getTime();
		const solarNoon = times.solarNoon.getTime();

		let normalizedPosition = 0.5;

		if (t < sunrise) {
			const midnight = new Date(now);
			midnight.setHours(0, 0, 0, 0);
			normalizedPosition = ((t - midnight.getTime()) / (sunrise - midnight.getTime())) * 0.25;
		} else if (t < solarNoon) {
			normalizedPosition = 0.25 + ((t - sunrise) / (solarNoon - sunrise)) * 0.25;
		} else if (t < sunset) {
			normalizedPosition = 0.5 + ((t - solarNoon) / (sunset - solarNoon)) * 0.25;
		} else {
			const nextMidnight = new Date(now);
			nextMidnight.setDate(now.getDate() + 1);
			nextMidnight.setHours(0, 0, 0, 0);
			normalizedPosition = 0.75 + ((t - sunset) / (nextMidnight.getTime() - sunset)) * 0.25;
		}

		return {
			altitude: sunPosition.altitude,
			normalizedPosition: Math.max(0, Math.min(1, normalizedPosition)),
		};
	} catch {
		return { altitude: Math.PI / 4, normalizedPosition: 0.5 };
	}
}

function createDebugSolarData(hour: number): SolarData {
	const h = ((hour % 24) + 24) % 24;
	const normalizedPosition = h / 24;
	const altitude = Math.sin((h - 6) * (Math.PI / 12)) * (Math.PI / 2.5);
	return { altitude, normalizedPosition };
}

// ═══════════════════════════════════════════════════════════════════════════
// CLOUD PUFF GENERATOR
// ═══════════════════════════════════════════════════════════════════════════

interface CloudPuff {
	x: number; // 0-1 normalized position
	y: number; // 0-1 normalized position
	radius: number; // Base radius multiplier
	opacity: number; // 0-1
	speed: number; // Drift speed multiplier
	seed: number; // For variation
}

/**
 * Generates a set of cloud puffs that form natural-looking cloud formations.
 */
function generateCloudPuffs(count: number, seed: number): CloudPuff[] {
	const puffs: CloudPuff[] = [];
	let s = seed;

	const rand = () => {
		s = ((s * 16807) % 2147483647) >>> 0;
		return s / 2147483647;
	};

	// Create cloud clusters
	const clusterCount = Math.floor(count / 8);

	for (let c = 0; c < clusterCount; c++) {
		// Cluster center - positioned in upper portion (10-40% from top)
		const clusterX = rand();
		const clusterY = 0.1 + rand() * 0.3;
		const clusterSize = 0.15 + rand() * 0.2;

		// Puffs within cluster
		const puffsInCluster = 5 + Math.floor(rand() * 8);
		for (let i = 0; i < puffsInCluster; i++) {
			const angle = rand() * Math.PI * 2;
			const dist = rand() * clusterSize;

			puffs.push({
				x: clusterX + Math.cos(angle) * dist,
				y: clusterY + Math.sin(angle) * dist * 0.5, // Flatter horizontally
				radius: 0.08 + rand() * 0.15,
				opacity: 0.3 + rand() * 0.5,
				speed: 0.5 + rand() * 0.5,
				seed: rand() * 1000,
			});
		}
	}

	return puffs;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface AtmosphereCanvasProps {
	className?: string;
	debugHour?: number;
}

/**
 * Aesthetic sky background with soft cloud formations.
 *
 * @example
 * <AtmosphereCanvas className="absolute inset-0" />
 */
export function AtmosphereCanvas({ className, debugHour }: AtmosphereCanvasProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const [mounted, setMounted] = useState(false);
	const { resolvedTheme } = useTheme();
	const swissGrid = useSwissGrid();

	// Animation state refs
	const animationRef = useRef<number>(0);
	const lastFrameRef = useRef<number>(0);
	const timeRef = useRef<number>(0);
	const noiseRef = useRef<SimplexNoise | null>(null);
	const puffsRef = useRef<CloudPuff[]>([]);
	const solarRef = useRef<SolarData | null>(null);
	const lastSolarUpdateRef = useRef<number>(0);

	// Initialize
	useEffect(() => {
		noiseRef.current = new SimplexNoise(42);
		puffsRef.current = generateCloudPuffs(60, 42);
		setMounted(true);
	}, []);

	const initialSolarData = useMemo(() => {
		if (debugHour !== undefined) return createDebugSolarData(debugHour);
		return getSolarData();
	}, [debugHour]);

	// Render function
	const render = useCallback(
		(timestamp: number) => {
			const canvas = canvasRef.current;
			const container = containerRef.current;
			const noise = noiseRef.current;

			if (!canvas || !container || !noise) {
				animationRef.current = requestAnimationFrame(render);
				return;
			}

			// Frame limiting
			const elapsed = timestamp - lastFrameRef.current;
			if (elapsed < FRAME_DURATION) {
				animationRef.current = requestAnimationFrame(render);
				return;
			}
			lastFrameRef.current = timestamp - (elapsed % FRAME_DURATION);
			timeRef.current += elapsed / 1000;

			// Update solar data every 60 seconds
			const now = Date.now();
			if (now - lastSolarUpdateRef.current > 60000 || !solarRef.current) {
				solarRef.current =
					debugHour !== undefined ? createDebugSolarData(debugHour) : getSolarData();
				lastSolarUpdateRef.current = now;
			}

			// Canvas sizing
			const rect = container.getBoundingClientRect();
			const dpr = Math.min(window.devicePixelRatio, 2);
			const width = Math.floor(rect.width * dpr);
			const height = Math.floor(rect.height * dpr);

			if (width <= 0 || height <= 0) {
				animationRef.current = requestAnimationFrame(render);
				return;
			}

			if (canvas.width !== width || canvas.height !== height) {
				canvas.width = width;
				canvas.height = height;
			}

			const ctx = canvas.getContext("2d", { alpha: false });
			if (!ctx) {
				animationRef.current = requestAnimationFrame(render);
				return;
			}

			// Get palette
			const isDark = resolvedTheme === "dark";
			const palette = getSkyPalette(solarRef.current.normalizedPosition, isDark);

			// Draw sky gradient
			const skyGradient = ctx.createLinearGradient(0, 0, 0, height);
			skyGradient.addColorStop(0, palette.skyGradientTop);
			skyGradient.addColorStop(1, palette.skyGradientBottom);
			ctx.fillStyle = skyGradient;
			ctx.fillRect(0, 0, width, height);

			// Enable blur for soft clouds
			ctx.filter = "blur(40px)";

			// Draw cloud puffs
			const drift = timeRef.current * DRIFT_SPEED;

			for (const puff of puffsRef.current) {
				// Animated position with subtle vertical wave
				const waveY = Math.sin(timeRef.current * 0.3 + puff.seed) * 0.01;
				const noiseOffset = noise.noise2D(puff.seed, timeRef.current * 0.05) * 0.02;

				let px = puff.x + (drift * puff.speed) / width + noiseOffset;
				const py = puff.y + waveY;

				// Wrap around
				px = (((px % 1.4) + 1.4) % 1.4) - 0.2;

				// Screen coordinates
				const sx = px * width;
				const sy = py * height;
				const sr = puff.radius * Math.min(width, height);

				// Radial gradient for soft puff
				const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr);
				const alpha = puff.opacity * palette.cloudOpacity;

				grad.addColorStop(
					0,
					palette.cloudColor.replace(")", `, ${alpha})`).replace("hsl", "hsla"),
				);
				grad.addColorStop(
					0.5,
					palette.cloudColor.replace(")", `, ${alpha * 0.6})`).replace("hsl", "hsla"),
				);
				grad.addColorStop(
					1,
					palette.cloudColor.replace(")", ", 0)").replace("hsl", "hsla"),
				);

				ctx.fillStyle = grad;
				ctx.beginPath();
				ctx.arc(sx, sy, sr, 0, Math.PI * 2);
				ctx.fill();
			}

			// Reset filter
			ctx.filter = "none";

			animationRef.current = requestAnimationFrame(render);
		},
		[resolvedTheme, debugHour],
	);

	// Animation lifecycle
	useEffect(() => {
		if (!mounted) return;
		solarRef.current = initialSolarData;
		animationRef.current = requestAnimationFrame(render);
		return () => {
			if (animationRef.current) cancelAnimationFrame(animationRef.current);
		};
	}, [mounted, render, initialSolarData]);

	// Container positioning from Swiss Grid
	const containerStyle = useMemo(() => {
		if (!swissGrid?.containerBounds) return {};
		const { left, width } = swissGrid.containerBounds;
		return {
			left: Math.round(left),
			width: Math.round(width),
			top: 0,
			bottom: 0,
		};
	}, [swissGrid?.containerBounds]);

	// Fallback background
	const fallbackBg = resolvedTheme === "dark" ? "bg-surface-950" : "bg-surface-50";

	return (
		<div
			ref={containerRef}
			className={cn("pointer-events-none absolute z-[1] overflow-hidden", className)}
			style={containerStyle}
			aria-hidden="true"
		>
			{mounted ? (
				<canvas ref={canvasRef} className="h-full w-full" style={{ display: "block" }} />
			) : (
				<div className={cn("h-full w-full", fallbackBg)} />
			)}
		</div>
	);
}

export default AtmosphereCanvas;
