"use client";

import { useTheme } from "next-themes";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * @component HeroGradient
 * @description
 * High-performance, aesthetically refined background glow designed to provide
 * visual depth and a premium atmosphere for the hero section of the homepage.
 *
 * Technical design considerations:
 * 1. Performance: Utilizes native CSS GPU-accelerated filters (blur) and an optimized
 *    Canvas2D context for the dot pattern to ensure 60fps scrolling.
 * 2. Visual Integrity: Employs a multi-layered radial falloff strategy to simulate
 *    natural atmospheric diffusion (cloud-like) instead of standard linear gradients.
 * 3. Color Theory: Integrates directly with the Evil Martians Harmony color system via
 *    CSS variables, ensuring theme-aware semantic color compliance.
 */

interface HeroGradientProps {
	/** Optional additional class names for positioning or container overrides. */
	className?: string;
}

export function HeroGradient({ className = "" }: HeroGradientProps) {
	const { resolvedTheme } = useTheme();
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const [mounted, setMounted] = useState(false);

	// Theme resolution is deferred to mount to avoid hydration mismatches between SSR and Client.
	const isDark = resolvedTheme === "dark";

	/**
	 * @method drawDots
	 * @description
	 * Renders a low-contrast pixel-grid pattern using the Canvas API.
	 * This provides a subtle "trame" effect that adds tactile texture to the gradient areas.
	 */
	const drawDots = useCallback(() => {
		const canvas = canvasRef.current;
		const container = containerRef.current;
		if (!canvas || !container) return;

		const ctx = canvas.getContext("2d", { alpha: true });
		if (!ctx) return;

		// Handle high-DPI displays (retina) for crisp pixel rendering.
		const dpr = window.devicePixelRatio || 1;
		const rect = container.getBoundingClientRect();
		canvas.width = rect.width * dpr;
		canvas.height = rect.height * dpr;
		ctx.scale(dpr, dpr);

		ctx.clearRect(0, 0, rect.width, rect.height);

		const dotSize = 1;
		const spacing = 2;

		// Utilize extremely low alpha values to ensure the pattern is felt rather than explicitly seen.
		ctx.fillStyle = isDark ? "rgba(255, 255, 255, 0.02)" : "rgba(255, 255, 255, 0.3)";

		for (let x = 0; x < rect.width; x += spacing) {
			for (let y = 0; y < rect.height; y += spacing) {
				ctx.fillRect(x, y, dotSize, dotSize);
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
		<div
			ref={containerRef}
			className={`pointer-events-none absolute inset-x-0 top-0 overflow-hidden ${className}`}
			aria-hidden="true"
			style={{
				/**
				 * @property maskImage
				 * @description
				 * Implements a sophisticated clipping mask that creates a "void" effect at the edges.
				 * This prevents the blurred elements from bleeding into the layout boundaries,
				 * ensuring the gradient feels contained and premium.
				 */
				height: "120vh",
				maskImage: `
          linear-gradient(to bottom, transparent 0%, black 5%, black 40%, transparent 100%)
        `,
				WebkitMaskImage: `
          linear-gradient(to bottom, transparent 0%, black 5%, black 40%, transparent 100%)
        `,
			}}
		>
			{/* 
        LAYERED ATMOSPHERIC DIFFUSION 
        We use three distinct orbs with varying sizes, blurs, and opacities to 
        create a non-linear color falloff that simulates real-world lighting.
      */}

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

			{/* 
        TEXTURE OVERLAY
        Renders on top of the gradients to provide structural definition.
      */}
			<canvas
				ref={canvasRef}
				className="absolute inset-0 h-full w-full"
				style={{ zIndex: 1 }}
			/>
		</div>
	);
}
