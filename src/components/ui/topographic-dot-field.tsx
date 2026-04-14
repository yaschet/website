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

interface TopographicDotFieldProps {
	className?: string;
	step?: DotGridLength;
	minInset?: DotGridLength;
	radius?: number;
	origin?: DotGridOrigin;
	speed?: number;
}

type RGB = [number, number, number];

interface Palette {
	base: RGB;
	baseAlpha: number;
	dim: RGB;
	soft: RGB;
	core: RGB;
	peak: RGB;
}

const TAU = Math.PI * 2;
const LOOP_DURATION = 16;

const FALLBACK_DARK_PALETTE: Palette = {
	base: [228, 228, 231],
	baseAlpha: 0.024,
	dim: [113, 113, 122],
	soft: [30, 64, 175],
	core: [37, 99, 235],
	peak: [96, 165, 250],
};

const FALLBACK_LIGHT_PALETTE: Palette = {
	base: [63, 63, 70],
	baseAlpha: 0.014,
	dim: [113, 113, 122],
	soft: [30, 64, 175],
	core: [29, 78, 216],
	peak: [37, 99, 235],
};

function clamp(value: number, min: number, max: number) {
	return Math.min(max, Math.max(min, value));
}

function smoothstep(edge0: number, edge1: number, value: number) {
	const normalized = clamp((value - edge0) / (edge1 - edge0), 0, 1);
	return normalized * normalized * (3 - 2 * normalized);
}

function mixColor(from: RGB, to: RGB, amount: number): RGB {
	return [
		from[0] + (to[0] - from[0]) * amount,
		from[1] + (to[1] - from[1]) * amount,
		from[2] + (to[2] - from[2]) * amount,
	];
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
		base: resolveCssColor(
			node,
			isDark ? "var(--color-surface-200)" : "var(--color-surface-700)",
			fallback.base,
		),
		baseAlpha: fallback.baseAlpha,
		dim: resolveCssColor(
			node,
			isDark ? "var(--color-surface-500)" : "var(--color-surface-500)",
			fallback.dim,
		),
		soft: resolveCssColor(
			node,
			isDark ? "var(--color-accent-900)" : "var(--color-accent-900)",
			fallback.soft,
		),
		core: resolveCssColor(
			node,
			isDark ? "var(--color-accent-600)" : "var(--color-accent-700)",
			fallback.core,
		),
		peak: resolveCssColor(
			node,
			isDark ? "var(--color-accent-400)" : "var(--color-accent-500)",
			fallback.peak,
		),
	};
}

function sampleField(normalizedX: number, normalizedY: number, aspect: number, phase: number) {
	const x = (normalizedX - 0.5) * aspect * 2.2;
	const y = (normalizedY - 0.5) * 2.4;

	const warpX =
		Math.sin(y * 2.1 + Math.sin(phase) * 1.2) * 0.38 +
		Math.cos(x * 1.35 - Math.cos(phase) * 1.1) * 0.24;
	const warpY =
		Math.cos(x * 2.4 - Math.sin(phase * 0.9) * 1.1) * 0.32 +
		Math.sin(y * 1.55 + Math.cos(phase * 0.8) * 1.3) * 0.2;

	const qx = x + warpX;
	const qy = y + warpY;

	const bandA = Math.sin(qx * 2.5 + Math.cos(phase) * 1.9);
	const bandB = Math.cos(qy * 2.2 + Math.sin(phase * 0.95) * 1.7);
	const bandC = Math.sin((qx + qy) * 1.55 - Math.cos(phase * 0.7) * 1.2);
	const bandD = Math.cos((qx - qy) * 1.9 + Math.sin(phase * 1.25) * 0.95);

	let field = bandA * 0.34 + bandB * 0.29 + bandC * 0.22 + bandD * 0.15;
	field = field * 0.5 + 0.5;
	field = smoothstep(0.14, 0.78, field);
	field = field ** 1.18;

	return Math.floor(field * 6) / 6;
}

function getDotAppearance(field: number, palette: Palette) {
	if (field < 0.08) return null;

	const dim = smoothstep(0.08, 0.24, field);
	const soft = smoothstep(0.24, 0.44, field);
	const core = smoothstep(0.44, 0.72, field);
	const peak = smoothstep(0.8, 1.0, field);

	let color = palette.dim;
	color = mixColor(color, palette.soft, soft);
	color = mixColor(color, palette.core, core);
	color = mixColor(color, palette.peak, peak);

	const alpha = clamp(dim * 0.09 + soft * 0.12 + core * 0.18 + peak * 0.08, 0, 0.58);
	return { color, alpha };
}

function drawDots(
	context: CanvasRenderingContext2D,
	dots: { x: number; y: number }[],
	size: number,
	color: RGB,
	alpha: number,
) {
	context.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`;
	const half = size / 2;

	for (const dot of dots) {
		context.fillRect(Math.round(dot.x - half), Math.round(dot.y - half), size, size);
	}
}

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
	const [metrics, setMetrics] = useState({
		width: 0,
		height: 0,
		step: typeof step === "number" ? step : 18,
		minInset: typeof minInset === "number" ? minInset : 12,
		dpr: 1,
	});

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

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const updateMetrics = () => {
			const rect = container.getBoundingClientRect();
			const nextDpr = window.devicePixelRatio || 1;
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
							width: Math.round(rect.width),
							height: Math.round(rect.height),
							step: nextStep,
							minInset: nextMinInset,
							dpr: nextDpr,
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

	const dots = useMemo(() => {
		if (metrics.width <= 0 || metrics.height <= 0) return [];

		const columns = computeGridAxis(metrics.width, metrics.step, metrics.minInset, origin);
		const rows = computeGridAxis(metrics.height, metrics.step, metrics.minInset, origin);

		return Array.from({ length: rows.count * columns.count }, (_, index) => {
			const row = Math.floor(index / columns.count);
			const column = index % columns.count;

			return {
				x: columns.offset + column * metrics.step,
				y: rows.offset + row * metrics.step,
			};
		});
	}, [metrics.height, metrics.minInset, metrics.step, metrics.width, origin]);

	useEffect(() => {
		const container = containerRef.current;
		const canvas = canvasRef.current;
		if (!container || !canvas || metrics.width <= 0 || metrics.height <= 0 || dots.length === 0)
			return;

		const baseLayer = baseLayerRef.current ?? document.createElement("canvas");
		baseLayerRef.current = baseLayer;
		baseLayer.width = Math.round(metrics.width * metrics.dpr);
		baseLayer.height = Math.round(metrics.height * metrics.dpr);

		const context = baseLayer.getContext("2d", { alpha: true });
		if (!context) return;

		context.setTransform(metrics.dpr, 0, 0, metrics.dpr, 0, 0);
		context.clearRect(0, 0, metrics.width, metrics.height);

		const palette = resolvePalette(container, isDark);
		drawDots(context, dots, radius, palette.base, palette.baseAlpha);
	}, [dots, isDark, metrics.dpr, metrics.height, metrics.width, radius]);

	useEffect(() => {
		const container = containerRef.current;
		const canvas = canvasRef.current;
		const baseLayer = baseLayerRef.current;
		if (
			!container ||
			!canvas ||
			!baseLayer ||
			metrics.width <= 0 ||
			metrics.height <= 0 ||
			dots.length === 0
		)
			return;

		canvas.width = Math.round(metrics.width * metrics.dpr);
		canvas.height = Math.round(metrics.height * metrics.dpr);

		const context = canvas.getContext("2d", { alpha: true });
		if (!context) return;

		const aspect = metrics.width / Math.max(metrics.height, 1);
		const palette = resolvePalette(container, isDark);
		let frameId = 0;
		let startTime = 0;

		const draw = (now: number) => {
			if (startTime === 0) startTime = now;

			const elapsed = shouldReduceMotion ? 0 : ((now - startTime) / 1000) * speed;
			const phase = (elapsed / LOOP_DURATION) * TAU;

			context.setTransform(1, 0, 0, 1, 0, 0);
			context.clearRect(0, 0, canvas.width, canvas.height);
			context.drawImage(baseLayer, 0, 0);
			context.setTransform(metrics.dpr, 0, 0, metrics.dpr, 0, 0);

			for (const dot of dots) {
				const field = sampleField(
					dot.x / metrics.width,
					dot.y / metrics.height,
					aspect,
					phase,
				);
				const appearance = getDotAppearance(field, palette);
				if (!appearance) continue;

				context.fillStyle = `rgba(${appearance.color[0]}, ${appearance.color[1]}, ${appearance.color[2]}, ${appearance.alpha})`;
				context.fillRect(
					Math.round(dot.x - radius / 2),
					Math.round(dot.y - radius / 2),
					radius,
					radius,
				);
			}

			if (!shouldReduceMotion) frameId = window.requestAnimationFrame(draw);
		};

		draw(0);

		return () => {
			window.cancelAnimationFrame(frameId);
		};
	}, [
		dots,
		isDark,
		metrics.dpr,
		metrics.height,
		metrics.width,
		radius,
		shouldReduceMotion,
		speed,
	]);

	return (
		<div ref={containerRef} className={cn("absolute inset-0", className)}>
			<canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
		</div>
	);
}
