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
	 * @method drawDots
	 * @description
	 * Renders a low-contrast pixel-grid pattern using the Canvas API.
	 */
	const drawDots = useCallback(() => {
		const canvas = canvasRef.current;
		const container = containerRef.current;
		if (!canvas || !container) return;

		const ctx = canvas.getContext("2d", { alpha: true });
		if (!ctx) return;

		const dpr = window.devicePixelRatio || 1;
		const rect = container.getBoundingClientRect();
		// Ensure height is consistent with the container style
		const drawHeight = Math.max(rect.height, window.innerHeight * 1.2);

		canvas.width = rect.width * dpr;
		canvas.height = drawHeight * dpr;
		ctx.scale(dpr, dpr);

		ctx.clearRect(0, 0, rect.width, drawHeight);

		const dotSize = 1;
		const spacing = 12; // Increased spacing for a cleaner "grid" feel

		// Extremely low alpha values for subtle texture
		ctx.fillStyle = isDark ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.03)";

		for (let x = 0; x < rect.width; x += spacing) {
			for (let y = 0; y < drawHeight; y += spacing) {
				ctx.beginPath();
				ctx.arc(x, y, dotSize / 2, 0, Math.PI * 2);
				ctx.fill();
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
