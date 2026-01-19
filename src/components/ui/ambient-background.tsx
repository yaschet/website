/**
 * Atmospheric background management system.
 *
 * @remarks
 * Renders a subtle background effect using canvas or CSS.
 * slowly oscillating radial gradients and a procedural noise grain.
 * Uses GPU-accelerated CSS animations for zero-overhead persistence.
 *
 * @example
 * ```tsx
 * // Placed at root layout level
 * <AmbientBackground />
 * ```
 *
 * @public
 */

"use client";

export function AmbientBackground() {
	return (
		<div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
			{/* Primary orb - slow float */}
			<div
				className="absolute h-[600px] w-[600px] animate-float-slow rounded-full opacity-30 blur-[120px] dark:opacity-20"
				style={{
					background:
						"radial-gradient(circle, var(--color-cyan-400) 0%, transparent 70%)",
					top: "10%",
					right: "-10%",
				}}
			/>

			{/* Secondary orb - slower float, offset timing */}
			<div
				className="absolute h-[500px] w-[500px] animate-float-slower rounded-full opacity-20 blur-[100px] dark:opacity-15"
				style={{
					background:
						"radial-gradient(circle, var(--color-violet-400) 0%, transparent 70%)",
					bottom: "20%",
					left: "-5%",
				}}
			/>

			{/* Subtle noise texture overlay */}
			<div
				className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
				style={{
					backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
				}}
			/>
		</div>
	);
}
