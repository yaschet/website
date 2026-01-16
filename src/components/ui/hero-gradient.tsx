"use client";

import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useRef, useState } from "react";
import { useReveal } from "../providers/reveal-provider";
import { springs } from "@/src/lib/physics";

/**
 * @component HeroGradient
 * @description
 * High-performance, aesthetically refined background glow designed to provide
 * visual depth and a premium atmosphere for the hero section of the homepage.
 */

interface HeroGradientProps {
	/** Optional additional class names for positioning or container overrides. */
	className?: string;
}

export function HeroGradient({ className = "" }: HeroGradientProps) {
	const { resolvedTheme } = useTheme();
	const { phase } = useReveal();
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const [mounted, setMounted] = useState(false);

	const isDark = resolvedTheme === "dark";
	const isEnabled = phase >= 0;

	/**
	 * @method drawPixels
	 * @description
	 * Renders a retro CRT/pixelated screen pattern using the Canvas API.
	 * Evokes 1990s high-tech monitors when zoomed in.
	 *
	 * GRID HARMONIZATION:
	 * Uses 16px spacing to align with the Swiss Grid system (9px dash + 7px gap = 16px cycle).
	 * Calculates the container offset so dots align with the centered max-w-3xl container.
	 */
	const drawDots = useCallback(() => {
		const canvas = canvasRef.current;
		const container = containerRef.current;
		if (!canvas || !container) return;

		const ctx = canvas.getContext("2d", { alpha: true });
		if (!ctx) return;

		const dpr = window.devicePixelRatio || 1;
		const rect = container.getBoundingClientRect();
		const drawHeight = Math.max(rect.height, window.innerHeight * 1.2);

		canvas.width = rect.width * dpr;
		canvas.height = drawHeight * dpr;
		ctx.scale(dpr, dpr);

		ctx.clearRect(0, 0, rect.width, drawHeight);

		// Grid-aligned retro CRT settings
		// DOT_SPACING must be a divisor of GRID_CYCLE (16) to maintain vertical alignment
		// Options: 1, 2, 4, 8, 16 - using 4px for dense retro CRT effect
		const GRID_CYCLE = 16; // Swiss Grid cycle
		const DOT_SPACING = 4; // Dense CRT grid (4 dots per grid cycle)
		const MAX_CONTAINER_WIDTH = 768;
		const pixelSize = 1.5; // Small dots for authentic CRT feel

		// Calculate the offset to align with the centered max-w-3xl container
		const containerLeft = Math.max(0, (rect.width - MAX_CONTAINER_WIDTH) / 2);
		const offsetX = containerLeft % DOT_SPACING;

		// Vertical offset: align with first horizontal grid line at nav bottom (118px)
		const NAV_HEIGHT = 118;
		const offsetY = (NAV_HEIGHT + 1) % DOT_SPACING;

		// CRT dots - subtle retro texture
		ctx.fillStyle = isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.035)";

		// Square pixels for authentic CRT feel
		for (let x = offsetX; x < rect.width; x += DOT_SPACING) {
			for (let y = offsetY; y < drawHeight; y += DOT_SPACING) {
				ctx.fillRect(x, y, pixelSize, pixelSize);
			}
		}
	}, [isDark]);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (mounted) {
			requestAnimationFrame(drawDots);
		}
	}, [mounted, drawDots]);

	useEffect(() => {
		window.addEventListener("resize", drawDots);
		return () => window.removeEventListener("resize", drawDots);
	}, [drawDots]);

	if (!mounted) {
		return null;
	}

	return (
		<motion.div
			ref={containerRef}
			initial={{ opacity: 0 }}
			animate={isEnabled ? { opacity: 1 } : { opacity: 0 }}
			transition={springs.ambient}
			className={`pointer-events-none absolute inset-x-0 top-0 overflow-hidden ${className}`}
			aria-hidden="true"
			style={{
				height: "120vh",
				maskImage:
					"linear-gradient(to bottom, transparent 0%, black 5%, black 40%, transparent 100%)",
				WebkitMaskImage:
					"linear-gradient(to bottom, transparent 0%, black 5%, black 40%, transparent 100%)",
			}}
		>
			{/* LAYERED ATMOSPHERIC DIFFUSION */}
			<motion.div
				initial={{ opacity: 0, scale: 0.8 }}
				animate={isEnabled ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
				transition={{ ...springs.ambient, delay: 0.2 }}
				className="absolute inset-0"
			>
				{/* Primary Atmospheric Orb */}
				<div
					className="absolute"
					style={{
						width: "80%",
						height: "55%",
						left: "50%",
						top: "3%",
						transform: "translateX(-50%)",
						borderRadius: "100%",
						backgroundColor: "var(--accent-500)",
						opacity: isDark ? 0.1 : 0.06,
						filter: "blur(150px)",
					}}
				/>

				{/* Secondary Depth Orb */}
				<div
					className="absolute"
					style={{
						width: "60%",
						height: "40%",
						left: "50%",
						top: "8%",
						transform: "translateX(-50%)",
						borderRadius: "100%",
						backgroundColor: "var(--accent-400)",
						opacity: isDark ? 0.08 : 0.05,
						filter: "blur(120px)",
					}}
				/>

				{/* Tertiary Ambient Core */}
				<div
					className="absolute"
					style={{
						width: "40%",
						height: "25%",
						left: "50%",
						top: "12%",
						transform: "translateX(-50%)",
						borderRadius: "100%",
						backgroundColor: "var(--accent-300)",
						opacity: isDark ? 0.06 : 0.04,
						filter: "blur(80px)",
					}}
				/>
			</motion.div>

			{/* TEXTURE OVERLAY */}
			<motion.canvas
				ref={canvasRef}
				initial={{ opacity: 0 }}
				animate={isEnabled ? { opacity: 1 } : { opacity: 0 }}
				transition={{ duration: 1.2, delay: 0.5 }}
				className="absolute inset-0 h-full w-full"
				style={{ zIndex: 1 }}
			/>
		</motion.div>
	);
}
