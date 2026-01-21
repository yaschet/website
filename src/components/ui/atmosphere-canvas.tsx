"use client";

/**
 * Atmosphere Canvas - Time-Reactive Ambient Sky
 *
 * @module atmosphere-canvas
 * @description
 * Aesthetic sky background with layered cloud formations.
 * Multi-layer rendering with varying blur levels for depth.
 * Distinct day/night atmosphere with smooth transitions.
 *
 * Visual approach:
 * - Layered cloud system (background, mid, foreground)
 * - Progressive blur for atmospheric depth
 * - Dramatic day/night differentiation
 * - Golden hour warm tones
 *
 * UI Integration:
 * - Exposes `needsLightText` via context for UI components to adapt
 * - Sky is TIME-REACTIVE, not theme-reactive
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
import { useReveal } from "@/src/components/providers/reveal-provider";
import { springs } from "@/src/lib/index";
import SunCalc from "suncalc";
import { cn } from "@/lib/utils";
import { useSwissGrid } from "./swiss-grid-canvas";

// ═══════════════════════════════════════════════════════════════════════════
// ATMOSPHERE CONTEXT - Exposes sky state to UI components
// ═══════════════════════════════════════════════════════════════════════════

interface AtmosphereContextValue {
	/** Whether the current sky needs light text (dark sky) or dark text (bright sky) */
	needsLightText: boolean;
	/** Whether it's currently night time */
	isNight: boolean;
}

const AtmosphereContext = createContext<AtmosphereContextValue | null>(null);

/**
 * Hook to access atmosphere state for UI adaptation.
 * Returns null if used outside of AtmosphereCanvas.
 */
export function useAtmosphere(): AtmosphereContextValue | null {
	return useContext(AtmosphereContext);
}

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
const DRIFT_SPEED = 8;

/** Cloud layer configuration */
const CLOUD_LAYERS = [
	{ blur: 80, opacity: 0.3, speed: 0.3, scale: 1.8 }, // Far background - very soft
	{ blur: 50, opacity: 0.4, speed: 0.5, scale: 1.2 }, // Mid layer
	{ blur: 30, opacity: 0.5, speed: 0.8, scale: 0.9 }, // Near foreground
] as const;

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
	isNight: boolean;
	starOpacity: number;
	/** Whether UI text should be light (for dark backgrounds) */
	needsLightText: boolean;
}

/**
 * Returns sky colors based on normalized time position (0-1).
 *
 * IMPORTANT: The sky is TIME-REACTIVE, not theme-reactive.
 * - Night (real time) = dark sky, needs light UI text
 * - Day (real time) = bright sky, needs dark UI text
 *
 * Time mapping:
 * - 0.00-0.22: Deep night (dark sky, stars visible)
 * - 0.22-0.32: Dawn transition (warming up)
 * - 0.32-0.68: Daytime (bright, blue sky)
 * - 0.68-0.78: Dusk transition (golden hour)
 * - 0.78-1.00: Night (dark sky, stars visible)
 *
 * @param normalizedTime - 0 = midnight, 0.5 = noon, 1 = midnight
 * @returns Color palette for current time
 */
function getSkyPalette(normalizedTime: number): SkyPalette {
	// Calculate time-of-day factors
	const isNight = normalizedTime < 0.22 || normalizedTime > 0.78;
	const isDawn = normalizedTime >= 0.22 && normalizedTime <= 0.32;
	const isDusk = normalizedTime >= 0.68 && normalizedTime <= 0.78;
	const isGoldenHour = isDawn || isDusk;

	// Night factor: 1 at midnight, 0 at noon
	const nightFactor = Math.max(
		0,
		normalizedTime < 0.25
			? 1 - normalizedTime * 4
			: normalizedTime > 0.75
				? (normalizedTime - 0.75) * 4
				: 0,
	);

	// Dawn/dusk warmth factor
	const dawnWarmth = isDawn ? 1 - Math.abs(normalizedTime - 0.27) * 20 : 0;
	const duskWarmth = isDusk ? 1 - Math.abs(normalizedTime - 0.73) * 20 : 0;
	const warmth = Math.max(dawnWarmth, duskWarmth);

	// Night: Dark sky - UI needs light text
	if (isNight) {
		const depthVariation = 0.3 + Math.sin(normalizedTime * Math.PI) * 0.2;
		return {
			skyGradientTop: `hsl(228, 28%, ${6 + depthVariation * 3}%)`,
			skyGradientBottom: `hsl(228, 22%, ${10 + depthVariation * 4}%)`,
			cloudColor: `hsl(225, 15%, ${18 + depthVariation * 8}%)`,
			cloudOpacity: 0.25 + depthVariation * 0.15,
			isNight: true,
			starOpacity: 0.4 + nightFactor * 0.3,
			needsLightText: true,
		};
	}

	// Golden hour (dawn/dusk): Warm tones - still bright enough for dark text
	if (isGoldenHour) {
		const hue = isDawn ? 25 + warmth * 15 : 35 - warmth * 10;
		const sat = 30 + warmth * 40;
		// Higher lightness for warm but bright sky
		const lightness = 75 - warmth * 15;
		return {
			skyGradientTop: `hsl(${hue}, ${sat}%, ${lightness}%)`,
			skyGradientBottom: `hsl(${hue + 10}, ${sat * 0.7}%, ${lightness + 12}%)`,
			cloudColor: `hsl(${hue - 5}, ${sat * 0.4}%, 95%)`,
			cloudOpacity: 0.5 + warmth * 0.2,
			isNight: false,
			starOpacity: 0,
			needsLightText: false, // Bright warm sky, dark text
		};
	}

	// Daytime: Bright sky - UI needs dark text
	const dayProgress = Math.sin((normalizedTime - 0.3) * Math.PI * 2.5);
	return {
		skyGradientTop: `hsl(210, ${15 + dayProgress * 8}%, ${88 - dayProgress * 5}%)`,
		skyGradientBottom: `hsl(210, ${10 + dayProgress * 5}%, ${94 - dayProgress * 2}%)`,
		cloudColor: `hsl(210, 5%, 100%)`,
		cloudOpacity: 0.45 + dayProgress * 0.15,
		isNight: false,
		starOpacity: 0,
		needsLightText: false, // Bright blue sky, dark text
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
	layer: number; // 0=back, 1=mid, 2=front
	stretch: number; // Horizontal stretch factor for organic shapes
}

/**
 * Generates layered cloud puffs with organic shapes.
 * Creates formations that look like real cumulus clouds.
 */
function generateCloudPuffs(count: number, seed: number): CloudPuff[] {
	const puffs: CloudPuff[] = [];
	let s = seed;

	const rand = () => {
		s = ((s * 16807) % 2147483647) >>> 0;
		return s / 2147483647;
	};

	// Create cloud formations for each layer
	for (let layer = 0; layer < CLOUD_LAYERS.length; layer++) {
		const layerConfig = CLOUD_LAYERS[layer];
		const formationsPerLayer = Math.floor(count / (CLOUD_LAYERS.length * 6));

		for (let f = 0; f < formationsPerLayer; f++) {
			// Formation center - upper portion of screen
			const formationX = rand() * 1.2 - 0.1; // Allow slight overflow
			const formationY = 0.05 + rand() * 0.35; // 5-40% from top
			const formationWidth = 0.12 + rand() * 0.18;
			const formationHeight = formationWidth * (0.3 + rand() * 0.3); // Flatter

			// Multiple puffs per formation for organic look
			const puffsInFormation = 4 + Math.floor(rand() * 6);

			for (let i = 0; i < puffsInFormation; i++) {
				// Distribute puffs within formation with bias toward center
				const angle = rand() * Math.PI * 2;
				const distNorm = rand() * rand(); // Bias toward center
				const distX = Math.cos(angle) * distNorm * formationWidth;
				const distY = Math.sin(angle) * distNorm * formationHeight;

				puffs.push({
					x: formationX + distX,
					y: formationY + distY,
					radius: (0.06 + rand() * 0.12) * layerConfig.scale,
					opacity: (0.4 + rand() * 0.4) * layerConfig.opacity,
					speed: (0.4 + rand() * 0.6) * layerConfig.speed,
					seed: rand() * 1000,
					layer,
					stretch: 1.2 + rand() * 0.8, // 1.2-2.0 horizontal stretch
				});
			}
		}
	}

	// Sort by layer for proper rendering order
	return puffs.sort((a, b) => a.layer - b.layer);
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface AtmosphereCanvasProps {
	className?: string;
	debugHour?: number;
	/** Children that will receive atmosphere context */
	children?: React.ReactNode;
}

/**
 * Aesthetic sky background with soft cloud formations.
 * Exposes atmosphere state to children via context.
 *
 * @example
 * <AtmosphereCanvas className="absolute inset-0">
 *   <SiteHero />
 * </AtmosphereCanvas>
 */
export function AtmosphereCanvas({ className, debugHour, children }: AtmosphereCanvasProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const [mounted, setMounted] = useState(false);
	const swissGrid = useSwissGrid();

	// Atmosphere state exposed to UI
	const [atmosphereState, setAtmosphereState] = useState<AtmosphereContextValue>({
		needsLightText: true, // Default to night (safe for dark backgrounds)
		isNight: true,
	});

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

			// Get palette based on TIME (not theme)
			const palette = getSkyPalette(solarRef.current.normalizedPosition);

			// Update atmosphere state for UI consumers (only when it changes)
			setAtmosphereState((prev) => {
				if (
					prev.needsLightText !== palette.needsLightText ||
					prev.isNight !== palette.isNight
				) {
					return { needsLightText: palette.needsLightText, isNight: palette.isNight };
				}
				return prev;
			});

			// Draw sky gradient
			const skyGradient = ctx.createLinearGradient(0, 0, 0, height);
			skyGradient.addColorStop(0, palette.skyGradientTop);
			skyGradient.addColorStop(1, palette.skyGradientBottom);
			ctx.fillStyle = skyGradient;
			ctx.fillRect(0, 0, width, height);

			// Draw stars if night
			if (palette.starOpacity > 0) {
				ctx.filter = "none";
				const starSeed = 12345;
				let ss = starSeed;
				const starRand = () => {
					ss = ((ss * 16807) % 2147483647) >>> 0;
					return ss / 2147483647;
				};

				const starCount = 40;
				for (let i = 0; i < starCount; i++) {
					const sx = starRand() * width;
					const sy = starRand() * height * 0.6; // Only in upper 60%
					const size = 1 + starRand() * 1.5;
					// Twinkling effect
					const twinkle =
						0.5 + Math.sin(timeRef.current * (1 + starRand() * 2) + i) * 0.5;
					const alpha = palette.starOpacity * twinkle * (0.4 + starRand() * 0.6);

					ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
					ctx.beginPath();
					ctx.arc(sx, sy, size * dpr, 0, Math.PI * 2);
					ctx.fill();
				}
			}

			// Draw cloud puffs by layer with progressive blur
			const drift = timeRef.current * DRIFT_SPEED;
			let currentLayer = -1;

			for (const puff of puffsRef.current) {
				// Switch blur level when layer changes
				if (puff.layer !== currentLayer) {
					currentLayer = puff.layer;
					const layerConfig = CLOUD_LAYERS[puff.layer];
					ctx.filter = `blur(${layerConfig.blur}px)`;
				}

				// Animated position with subtle vertical wave
				const waveY = Math.sin(timeRef.current * 0.25 + puff.seed) * 0.008;
				const noiseOffset = noise.noise2D(puff.seed, timeRef.current * 0.04) * 0.015;

				let px = puff.x + (drift * puff.speed) / width + noiseOffset;
				const py = puff.y + waveY;

				// Wrap around
				px = (((px % 1.4) + 1.4) % 1.4) - 0.2;

				// Screen coordinates with horizontal stretch
				const sx = px * width;
				const sy = py * height;
				const baseRadius = puff.radius * Math.min(width, height);
				const radiusX = baseRadius * puff.stretch;
				const radiusY = baseRadius;

				// Radial gradient for soft puff (using ellipse)
				const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, baseRadius);
				const alpha = puff.opacity * palette.cloudOpacity;

				grad.addColorStop(
					0,
					palette.cloudColor.replace(")", `, ${alpha})`).replace("hsl", "hsla"),
				);
				grad.addColorStop(
					0.4,
					palette.cloudColor.replace(")", `, ${alpha * 0.7})`).replace("hsl", "hsla"),
				);
				grad.addColorStop(
					0.7,
					palette.cloudColor.replace(")", `, ${alpha * 0.3})`).replace("hsl", "hsla"),
				);
				grad.addColorStop(
					1,
					palette.cloudColor.replace(")", ", 0)").replace("hsl", "hsla"),
				);

				ctx.fillStyle = grad;
				ctx.beginPath();
				ctx.ellipse(sx, sy, radiusX, radiusY, 0, 0, Math.PI * 2);
				ctx.fill();
			}

			// Reset filter
			ctx.filter = "none";

			animationRef.current = requestAnimationFrame(render);
		},
		[debugHour],
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

	// Reveal phase integration
	const { phase } = useReveal();
	const shouldReduceMotion = useReducedMotion();

	// Canvas reveals at phase 1 (with primary content)
	const isRevealed = phase >= 1;

	// Only show when we have proper bounds from SwissGrid
	const hasBounds = !!swissGrid?.containerBounds;
	const isReady = mounted && hasBounds;

	return (
		<AtmosphereContext.Provider value={atmosphereState}>
			<motion.div
				ref={containerRef}
				initial={{ opacity: 0 }}
				animate={isRevealed && isReady ? { opacity: 1 } : { opacity: 0 }}
				transition={shouldReduceMotion ? { duration: 0 } : springs.gentle}
				className={cn("pointer-events-none absolute z-1 overflow-hidden", className)}
				style={containerStyle}
				aria-hidden="true"
			>
				<canvas
					ref={canvasRef}
					className="h-full w-full"
					style={{ display: "block" }}
				/>
			</motion.div>
			{children}
		</AtmosphereContext.Provider>
	);
}

export default AtmosphereCanvas;
