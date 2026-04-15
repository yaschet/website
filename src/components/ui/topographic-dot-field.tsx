"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
	computeGridAxis,
	type DotGridLength,
	type DotGridOrigin,
	resolveLength,
} from "./dot-grid-metrics";

/**
 * Props for TopographicDotField.
 *
 * @param className - Optional CSS class applied to the root container.
 * @param step - Grid step size (CSS length or px number).
 * @param minInset - Minimum inset from container edges.
 * @param radius - Dot radius in px.
 * @param origin - Grid alignment strategy.
 * @param speed - Animation speed multiplier.
 */
interface TopographicDotFieldProps {
	className?: string;
	step?: DotGridLength;
	minInset?: DotGridLength;
	radius?: number;
	origin?: DotGridOrigin;
	speed?: number;
}

type RGB = [number, number, number];

interface Tone {
	alpha: number;
	color: RGB;
}

interface Palette {
	base: Tone;
	levels: Tone[];
}

interface DotPoint {
	normalizedX: number;
	normalizedY: number;
	x: number;
	y: number;
}

/** One pre-baked animation frame: one Path2D per dot brightness level. */
interface PreparedFrame {
	paths: Path2D[];
}

interface PreparedField {
	frameCount: number;
	frames: PreparedFrame[];
	palette: Palette;
}

interface VoidConfig {
	baseX: number;
	baseY: number;
	coreRadius: number;
	haloRadius: number;
	orbitX: number;
	orbitY: number;
	outerRadius: number;
	phase: number;
	speedX: number;
	speedY: number;
	strength: number;
}

const TAU = Math.PI * 2;
const LOOP_DURATION = 18;
const FRAME_COUNT = 72;
const LEVEL_COUNT = 4;
/** Frames built per idle chunk to avoid jank during preparation. */
const CHUNK_SIZE = 8;

const DARK_VOID_CONFIGS: VoidConfig[] = [
	{
		baseX: 0.84,
		baseY: 0.16,
		coreRadius: 0.078,
		haloRadius: 0.178,
		orbitX: 0.05,
		orbitY: 0.066,
		outerRadius: 0.35,
		phase: 0.3,
		speedX: 1.04,
		speedY: 0.9,
		strength: 1.36,
	},
	{
		baseX: 1.03,
		baseY: 0.69,
		coreRadius: 0.102,
		haloRadius: 0.23,
		orbitX: 0.042,
		orbitY: 0.058,
		outerRadius: 0.42,
		phase: 1.32,
		speedX: 0.82,
		speedY: 1.04,
		strength: 1.5,
	},
	{
		baseX: 0.76,
		baseY: 1.03,
		coreRadius: 0.086,
		haloRadius: 0.188,
		orbitX: 0.066,
		orbitY: 0.05,
		outerRadius: 0.34,
		phase: 2.38,
		speedX: 1.14,
		speedY: 0.86,
		strength: 1.12,
	},
	{
		baseX: 0.21,
		baseY: -0.1,
		coreRadius: 0.052,
		haloRadius: 0.116,
		orbitX: 0.03,
		orbitY: 0.034,
		outerRadius: 0.2,
		phase: 3.4,
		speedX: 0.72,
		speedY: 0.8,
		strength: 0.26,
	},
];

const LIGHT_VOID_CONFIGS: VoidConfig[] = [
	{
		baseX: 0.82,
		baseY: 0.17,
		coreRadius: 0.066,
		haloRadius: 0.148,
		orbitX: 0.038,
		orbitY: 0.056,
		outerRadius: 0.3,
		phase: 0.44,
		speedX: 0.94,
		speedY: 0.84,
		strength: 0.94,
	},
	{
		baseX: 0.98,
		baseY: 0.72,
		coreRadius: 0.088,
		haloRadius: 0.192,
		orbitX: 0.034,
		orbitY: 0.052,
		outerRadius: 0.34,
		phase: 1.66,
		speedX: 0.8,
		speedY: 0.98,
		strength: 1.02,
	},
	{
		baseX: 0.72,
		baseY: 1.04,
		coreRadius: 0.074,
		haloRadius: 0.164,
		orbitX: 0.05,
		orbitY: 0.042,
		outerRadius: 0.29,
		phase: 2.9,
		speedX: 1.02,
		speedY: 0.8,
		strength: 0.74,
	},
	{
		baseX: 0.18,
		baseY: 0.14,
		coreRadius: 0.05,
		haloRadius: 0.108,
		orbitX: 0.02,
		orbitY: 0.03,
		outerRadius: 0.18,
		phase: 3.6,
		speedX: 0.7,
		speedY: 0.76,
		strength: 0.22,
	},
];

const FALLBACK_DARK_PALETTE: Palette = {
	base: { color: [228, 228, 231], alpha: 0.018 },
	levels: [
		{ color: [113, 113, 122], alpha: 0.088 },
		{ color: [71, 88, 153], alpha: 0.15 },
		{ color: [92, 141, 232], alpha: 0.24 },
		{ color: [191, 219, 254], alpha: 0.43 },
	],
};

const FALLBACK_LIGHT_PALETTE: Palette = {
	base: { color: [219, 234, 254], alpha: 0.02 },
	levels: [
		{ color: [191, 219, 254], alpha: 0.062 },
		{ color: [147, 197, 253], alpha: 0.102 },
		{ color: [96, 165, 250], alpha: 0.156 },
		{ color: [59, 130, 246], alpha: 0.228 },
	],
};

function clamp(value: number, min: number, max: number) {
	return Math.min(max, Math.max(min, value));
}

function smoothstep(edge0: number, edge1: number, value: number) {
	const normalized = clamp((value - edge0) / (edge1 - edge0), 0, 1);
	return normalized * normalized * (3 - 2 * normalized);
}

function gaussian(
	x: number,
	y: number,
	centerX: number,
	centerY: number,
	radiusX: number,
	radiusY: number,
) {
	const dx = (x - centerX) / radiusX;
	const dy = (y - centerY) / radiusY;
	return Math.exp(-(dx * dx + dy * dy));
}

function fieldDistance(x: number, y: number, centerX: number, centerY: number, aspect: number) {
	const dx = (x - centerX) * aspect;
	const dy = y - centerY;
	return Math.hypot(dx, dy);
}

function parseRgbColor(value: string, fallback: RGB): RGB {
	const match = value.match(/rgba?\(([^)]+)\)/i);
	if (!match) return fallback;

	const channels = match[1]
		.split(/[\s,/]+/)
		.filter(Boolean)
		.slice(0, 3)
		.map((channel) => Number.parseFloat(channel));

	if (channels.length !== 3 || channels.some((channel) => Number.isNaN(channel))) {
		return fallback;
	}

	return [
		clamp(Math.round(channels[0]), 0, 255),
		clamp(Math.round(channels[1]), 0, 255),
		clamp(Math.round(channels[2]), 0, 255),
	];
}

function resolveCssColor(node: HTMLElement, value: string, fallback: RGB): RGB {
	const probe = document.createElement("div");
	probe.style.position = "absolute";
	probe.style.visibility = "hidden";
	probe.style.pointerEvents = "none";
	probe.style.color = value;

	node.appendChild(probe);
	const resolved = getComputedStyle(probe).color;
	node.removeChild(probe);

	return parseRgbColor(resolved, fallback);
}

function resolvePalette(node: HTMLElement, isDark: boolean): Palette {
	const fallback = isDark ? FALLBACK_DARK_PALETTE : FALLBACK_LIGHT_PALETTE;

	return {
		base: {
			color: resolveCssColor(
				node,
				isDark ? "var(--color-surface-200)" : "var(--color-accent-100)",
				fallback.base.color,
			),
			alpha: fallback.base.alpha,
		},
		levels: [
			{
				color: resolveCssColor(
					node,
					isDark ? "var(--color-surface-500)" : "var(--color-accent-200)",
					fallback.levels[0].color,
				),
				alpha: fallback.levels[0].alpha,
			},
			{
				color: resolveCssColor(
					node,
					isDark ? "var(--color-accent-700)" : "var(--color-accent-300)",
					fallback.levels[1].color,
				),
				alpha: fallback.levels[1].alpha,
			},
			{
				color: resolveCssColor(
					node,
					isDark ? "var(--color-accent-500)" : "var(--color-accent-400)",
					fallback.levels[2].color,
				),
				alpha: fallback.levels[2].alpha,
			},
			{
				color: resolveCssColor(
					node,
					isDark ? "var(--color-accent-300)" : "var(--color-accent-500)",
					fallback.levels[3].color,
				),
				alpha: fallback.levels[3].alpha,
			},
		],
	};
}

function toneToCanvas(color: RGB, alpha: number) {
	return `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`;
}

/**
 * Evaluates the scalar field at normalized coordinates (0–1) for a given animation phase.
 *
 * @param normalizedX - Horizontal position in [0, 1].
 * @param normalizedY - Vertical position in [0, 1].
 * @param aspect - Width / height of the render area.
 * @param phase - Animation phase in radians.
 * @param isDark - Whether the dark theme is active.
 * @returns Shaped field value in [0, 1].
 */
function sampleField(
	normalizedX: number,
	normalizedY: number,
	aspect: number,
	phase: number,
	isDark: boolean,
) {
	const configs = isDark ? DARK_VOID_CONFIGS : LIGHT_VOID_CONFIGS;
	const driftScale = isDark ? 1 : 0.84;
	const driftX =
		0.022 *
		driftScale *
		(Math.sin(TAU * (normalizedY * 0.84 + normalizedX * 0.24) + phase * 0.84) +
			0.55 * Math.cos(TAU * (normalizedX * 1.32 - normalizedY * 0.42) - phase * 1.06));
	const driftY =
		0.02 *
		driftScale *
		(Math.cos(TAU * (normalizedX * 0.78 - normalizedY * 0.18) + phase * 0.72) +
			0.5 * Math.sin(TAU * (normalizedY * 1.06 + normalizedX * 0.34) - phase * 0.94));

	const x = normalizedX + driftX;
	const y = normalizedY + driftY;

	let value = 0;

	for (const config of configs) {
		const centerX =
			config.baseX + config.orbitX * Math.sin(phase * config.speedX + config.phase);
		const centerY =
			config.baseY + config.orbitY * Math.cos(phase * config.speedY + config.phase * 1.17);

		const distance = fieldDistance(x, y, centerX, centerY, aspect);
		const core =
			Math.exp(-(distance * distance) / (config.coreRadius * config.coreRadius)) * 1.2;
		const halo = Math.exp(-(distance * distance) / (config.haloRadius * config.haloRadius));
		const outer = Math.exp(-(distance * distance) / (config.outerRadius * config.outerRadius));
		const ring = Math.max(0, halo - core * 0.74) * (isDark ? 1.3 : 1.28);
		const envelope = outer * (isDark ? 0.3 : 0.34);

		value += (ring + envelope - core * (isDark ? 1.04 : 0.88)) * config.strength;
	}

	const ridge =
		0.18 * Math.sin(TAU * (x * 0.94 + y * 0.19) + Math.sin(phase * 0.72) * 0.85) +
		0.15 * Math.cos(TAU * (y * 0.68 - x * 0.26) - Math.cos(phase * 0.88) * 1.05) +
		0.08 * Math.sin(TAU * ((x + y) * 0.62) + phase * 0.56);
	const turbulence =
		0.09 * Math.sin(TAU * (x * 2.24 - y * 1.76) + phase * 1.42) +
		0.06 * Math.cos(TAU * (x * 3.08 + y * 2.42) - phase * 1.18);

	value = (isDark ? 0.165 : 0.17) + value * (isDark ? 0.52 : 0.5) + ridge * (isDark ? 1.08 : 0.9);

	const contourMask = smoothstep(0.18, 0.74, clamp(value, 0, 1));
	value += turbulence * contourMask * (isDark ? 0.22 : 0.14);

	const rightBias = smoothstep(0.38, 0.9, normalizedX);
	const upperRightBloom = gaussian(normalizedX, normalizedY, 0.8, 0.2, 0.23, 0.26);
	const midRightBloom = gaussian(normalizedX, normalizedY, 0.72, 0.48, 0.2, 0.26);
	const lowerRightBloom = gaussian(normalizedX, normalizedY, 0.88, 0.78, 0.26, 0.31);
	const lowerEdgeBloom = gaussian(normalizedX, normalizedY, 0.58, 0.96, 0.34, 0.16);
	const textQuietZone = gaussian(
		normalizedX,
		normalizedY,
		isDark ? 0.27 : 0.28,
		0.48,
		isDark ? 0.31 : 0.34,
		isDark ? 0.38 : 0.44,
	);

	value *= 0.8 + rightBias * (isDark ? 0.52 : 0.54);
	value += upperRightBloom * (isDark ? 0.2 : 0.22);
	value += midRightBloom * (isDark ? 0.12 : 0.14);
	value += lowerRightBloom * (isDark ? 0.16 : 0.16);
	value += lowerEdgeBloom * (isDark ? 0.06 : 0.08);
	value *= 1 - textQuietZone * (isDark ? 0.74 : 0.78);

	const normalized = clamp(value, 0, 1);
	const shaped = isDark
		? smoothstep(0.07, 0.9, normalized) ** 1.04
		: smoothstep(0.08, 0.68, normalized) ** 0.94;
	return shaped;
}

/**
 * Maps a scalar field value to a dot brightness level index (0–3), or -1 if below threshold.
 *
 * @param field - Field value in [0, 1].
 * @param isDark - Whether the dark theme is active.
 * @returns Level index or -1.
 */
function getFieldLevel(field: number, isDark: boolean) {
	const thresholds = isDark ? [0.15, 0.3, 0.52, 0.76] : [0.18, 0.34, 0.5, 0.66];

	for (let index = thresholds.length - 1; index >= 0; index -= 1) {
		if (field >= thresholds[index]) return index;
	}

	return -1;
}

/**
 * Draws the static base dot grid (all dots at base alpha) onto a canvas context.
 *
 * @param context - Target 2D context.
 * @param dots - Dot positions.
 * @param size - Dot square size in px.
 * @param tone - Color and alpha for the base layer.
 */
function drawBaseDots(
	context: CanvasRenderingContext2D,
	dots: DotPoint[],
	size: number,
	tone: Tone,
) {
	context.fillStyle = toneToCanvas(tone.color, tone.alpha);
	const half = size / 2;

	for (const dot of dots) {
		context.fillRect(Math.round(dot.x - half), Math.round(dot.y - half), size, size);
	}
}

/**
 * Builds a single animation frame's Path2D objects (one per brightness level).
 * No canvas allocation — pure geometry.
 *
 * @param dots - All dot positions.
 * @param radius - Dot square size in px.
 * @param aspect - Width / height of the render area.
 * @param phase - Animation phase in radians.
 * @param isDark - Whether the dark theme is active.
 * @returns Array of Path2D, one per level.
 */
function buildFrame(
	dots: DotPoint[],
	radius: number,
	aspect: number,
	phase: number,
	isDark: boolean,
): PreparedFrame {
	const paths = Array.from({ length: LEVEL_COUNT }, () => new Path2D());
	const half = radius / 2;

	for (const dot of dots) {
		const field = sampleField(dot.normalizedX, dot.normalizedY, aspect, phase, isDark);
		const level = getFieldLevel(field, isDark);

		if (level < 0) continue;

		paths[level]?.rect(Math.round(dot.x - half), Math.round(dot.y - half), radius, radius);
	}

	return { paths };
}

/**
 * Builds all animation frames asynchronously in idle chunks, calling back with each batch.
 * Returns a cancel function.
 *
 * @param dots - All dot positions.
 * @param radius - Dot square size in px.
 * @param aspect - Width / height.
 * @param isDark - Theme flag.
 * @param frameCount - Total frames to build.
 * @param onFrame - Called with (frameIndex, frame) as each frame is ready.
 * @param onDone - Called when all frames are ready.
 * @returns Cancel function.
 */
function buildFramesAsync(
	dots: DotPoint[],
	radius: number,
	aspect: number,
	isDark: boolean,
	frameCount: number,
	onFrame: (index: number, frame: PreparedFrame) => void,
	onDone: () => void,
): () => void {
	let cancelled = false;
	let frameIndex = 0;

	function processChunk() {
		if (cancelled) return;

		const end = Math.min(frameIndex + CHUNK_SIZE, frameCount);
		while (frameIndex < end) {
			const phase = (frameIndex / frameCount) * TAU;
			const frame = buildFrame(dots, radius, aspect, phase, isDark);
			onFrame(frameIndex, frame);
			frameIndex += 1;
		}

		if (frameIndex < frameCount) {
			if (typeof requestIdleCallback !== "undefined") {
				requestIdleCallback(processChunk, { timeout: 100 });
			} else {
				setTimeout(processChunk, 0);
			}
		} else {
			onDone();
		}
	}

	if (typeof requestIdleCallback !== "undefined") {
		requestIdleCallback(processChunk, { timeout: 100 });
	} else {
		setTimeout(processChunk, 0);
	}

	return () => {
		cancelled = true;
	};
}

/**
 * Canvas-based topographic dot field animation.
 * Renders a static base lattice immediately and animates brightness levels
 * once frames are ready, built asynchronously off the critical path.
 */
export function TopographicDotField({
	className,
	step = 18,
	minInset = step,
	radius = 2,
	origin = "center",
	speed = 1,
}: TopographicDotFieldProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const baseLayerRef = useRef<HTMLCanvasElement | null>(null);
	const shouldReduceMotion = useReducedMotion();
	const [isDark, setIsDark] = useState(false);
	const [preparedField, setPreparedField] = useState<PreparedField | null>(null);
	const [metrics, setMetrics] = useState({
		dpr: 1,
		height: 0,
		minInset: typeof minInset === "number" ? minInset : 12,
		step: typeof step === "number" ? step : 18,
		width: 0,
	});

	// Track dark mode via class mutation.
	useEffect(() => {
		if (typeof window === "undefined") return;

		const syncTheme = () => {
			setIsDark(document.documentElement.classList.contains("dark"));
		};

		syncTheme();
		const observer = new MutationObserver(syncTheme);
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["class"],
		});

		return () => observer.disconnect();
	}, []);

	// Track container size.
	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const updateMetrics = () => {
			const rect = container.getBoundingClientRect();
			const nextDpr = Math.min(window.devicePixelRatio || 1, 2);
			const nextStep = Math.max(1, resolveLength(container, step, 18));
			const nextMinInset = Math.max(0, resolveLength(container, minInset, 12));

			setMetrics((current) =>
				current.width === Math.round(rect.width) &&
				current.height === Math.round(rect.height) &&
				current.step === nextStep &&
				current.minInset === nextMinInset &&
				current.dpr === nextDpr
					? current
					: {
							dpr: nextDpr,
							height: Math.round(rect.height),
							minInset: nextMinInset,
							step: nextStep,
							width: Math.round(rect.width),
						},
			);
		};

		const observer = new ResizeObserver(updateMetrics);
		observer.observe(container);
		updateMetrics();
		window.addEventListener("resize", updateMetrics, { passive: true });

		return () => {
			observer.disconnect();
			window.removeEventListener("resize", updateMetrics);
		};
	}, [minInset, step]);

	// Compute dot positions from current metrics.
	const dots = useMemo<DotPoint[]>(() => {
		if (metrics.width <= 0 || metrics.height <= 0) return [];

		const columns = computeGridAxis(metrics.width, metrics.step, metrics.minInset, origin);
		const rows = computeGridAxis(metrics.height, metrics.step, metrics.minInset, origin);

		return Array.from({ length: rows.count * columns.count }, (_, index) => {
			const row = Math.floor(index / columns.count);
			const column = index % columns.count;
			const x = columns.offset + column * metrics.step;
			const y = rows.offset + row * metrics.step;

			return {
				normalizedX: x / metrics.width,
				normalizedY: y / metrics.height,
				x,
				y,
			};
		});
	}, [metrics.height, metrics.minInset, metrics.step, metrics.width, origin]);

	// Draw static base grid and kick off async frame preparation.
	useEffect(() => {
		const container = containerRef.current;
		if (!container || metrics.width <= 0 || metrics.height <= 0 || dots.length === 0) {
			setPreparedField(null);
			return;
		}

		const palette = resolvePalette(container, isDark);
		const effectiveRadius = isDark ? radius : radius + 2;

		// Paint the base layer immediately so the lattice is visible before frames are ready.
		const baseLayer = baseLayerRef.current ?? document.createElement("canvas");
		baseLayerRef.current = baseLayer;
		baseLayer.width = Math.round(metrics.width * metrics.dpr);
		baseLayer.height = Math.round(metrics.height * metrics.dpr);

		const baseContext = baseLayer.getContext("2d", { alpha: true });
		if (!baseContext) return;

		baseContext.imageSmoothingEnabled = false;
		baseContext.setTransform(metrics.dpr, 0, 0, metrics.dpr, 0, 0);
		baseContext.clearRect(0, 0, metrics.width, metrics.height);
		drawBaseDots(baseContext, dots, effectiveRadius, palette.base);

		// Invalidate existing prepared field while new frames build.
		setPreparedField(null);

		const aspect = metrics.width / Math.max(metrics.height, 1);
		const frameCount = shouldReduceMotion ? 1 : FRAME_COUNT;

		if (shouldReduceMotion) {
			// Build single static frame synchronously.
			const phase = 0;
			const frame = buildFrame(dots, effectiveRadius, aspect, phase, isDark);
			setPreparedField({ frameCount: 1, frames: [frame], palette });
			return;
		}

		// Allocate frame array up front; slots fill in as idle chunks complete.
		const frames: PreparedFrame[] = new Array(frameCount);

		const cancel = buildFramesAsync(
			dots,
			effectiveRadius,
			aspect,
			isDark,
			frameCount,
			(index, frame) => {
				frames[index] = frame;
			},
			() => {
				// All frames ready — swap in the complete field.
				setPreparedField({ frameCount, frames, palette });
			},
		);

		return cancel;
	}, [dots, isDark, metrics.dpr, metrics.height, metrics.width, radius, shouldReduceMotion]);

	// Render loop: draws base lattice each frame, then animated dot levels on top.
	useEffect(() => {
		const canvas = canvasRef.current;
		const baseLayer = baseLayerRef.current;
		if (!canvas || !baseLayer || metrics.width <= 0 || metrics.height <= 0 || dots.length === 0)
			return;

		canvas.width = Math.round(metrics.width * metrics.dpr);
		canvas.height = Math.round(metrics.height * metrics.dpr);

		const context = canvas.getContext("2d", { alpha: true });
		if (!context) return;

		context.imageSmoothingEnabled = false;
		let frameId = 0;
		let startTime = 0;

		const drawAnimatedFrame = (frameIndex: number, opacity: number) => {
			if (!preparedField) return;
			const frame = preparedField.frames[frameIndex];
			if (!frame || opacity <= 0) return;

			context.setTransform(metrics.dpr, 0, 0, metrics.dpr, 0, 0);

			for (let level = 0; level < preparedField.palette.levels.length; level += 1) {
				const tone = preparedField.palette.levels[level];
				const path = frame.paths[level];
				if (!tone || !path) continue;

				context.fillStyle = toneToCanvas(tone.color, tone.alpha * opacity);
				context.fill(path);
			}
		};

		const paint = (now: number) => {
			if (startTime === 0) startTime = now;

			context.setTransform(1, 0, 0, 1, 0, 0);
			context.clearRect(0, 0, canvas.width, canvas.height);
			context.drawImage(baseLayer, 0, 0);

			if (!preparedField) {
				frameId = window.requestAnimationFrame(paint);
				return;
			}

			if (shouldReduceMotion || preparedField.frameCount === 1) {
				drawAnimatedFrame(0, 1);
				return;
			}

			const elapsed = ((now - startTime) / 1000) * speed;
			const loopProgress = (elapsed % LOOP_DURATION) / LOOP_DURATION;
			const exactFrame = loopProgress * preparedField.frameCount;
			const currentFrame = Math.floor(exactFrame) % preparedField.frameCount;
			const nextFrame = (currentFrame + 1) % preparedField.frameCount;
			const mix = exactFrame - Math.floor(exactFrame);

			drawAnimatedFrame(currentFrame, 1 - mix);
			drawAnimatedFrame(nextFrame, mix);

			frameId = window.requestAnimationFrame(paint);
		};

		frameId = window.requestAnimationFrame(paint);

		return () => {
			window.cancelAnimationFrame(frameId);
		};
	}, [
		dots.length,
		metrics.dpr,
		metrics.height,
		metrics.width,
		preparedField,
		shouldReduceMotion,
		speed,
	]);

	return (
		<div ref={containerRef} className={cn("absolute inset-0", className)}>
			<canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
		</div>
	);
}
