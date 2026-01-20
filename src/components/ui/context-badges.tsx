/**
 * Specialized status indicators for location and temporal context.
 *
 * @remarks
 * - Balanced padding and layout.
 * - Animations managed by RevealProvider.
 *
 * @example
 * ```tsx
 * <LocationBadge />
 * <TimeBadge />
 * ```
 *
 * @public
 */

"use client";

import { Clock } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { CountryFlagMA, SquareFlag } from "react-square-flags";

import { cn, springs } from "@/src/lib/index";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS - Swiss Grid Mathematics
// ─────────────────────────────────────────────────────────────────────────────

/** Badge height - matches the padding unit for perfect squares */
const BADGE_HEIGHT = 28; // px
const INSIGNIA_SIZE = 28; // px - square, fills edge-to-edge
const CONTENT_PADDING = 8; // px - X = Y for Swiss balance

// ─────────────────────────────────────────────────────────────────────────────
// SHARED STYLES
// ─────────────────────────────────────────────────────────────────────────────

/** Base badge container - no horizontal padding, that's per-zone */
const badgeBaseClasses = cn(
	"group relative flex items-center",
	"rounded-[var(--radius)]",
	"border border-surface-200/80 dark:border-surface-800/80",
	// OPTIMIZATION: Removed blur (Swiss Design: Opacity > Blur)
	"bg-white/95 dark:bg-surface-950/95",
	"shadow-lg shadow-surface-900/5 dark:shadow-surface-950/50",
	"font-medium text-surface-600 text-xs dark:text-surface-400",
	"pointer-events-auto cursor-default select-none",
);

/** Insignia zone - edge-mounted, no padding, clips flag to bounds */
const insigniaClasses = cn(
	"flex shrink-0 items-center justify-center overflow-hidden",
	"rounded-l-[var(--radius)]",
	"bg-surface-100/50 dark:bg-surface-800/50",
);

/** Content zone - balanced padding */
const contentClasses = cn("flex items-center");

const tooltipClasses = cn(
	"pointer-events-none absolute top-full left-1/2 z-10 mt-2 -translate-x-1/2 whitespace-nowrap",
	"px-2 py-1.5 font-bold text-xs",
	"bg-white dark:bg-surface-900",
	"text-surface-700 dark:text-surface-300",
	"border border-surface-200 dark:border-surface-800",
	"rounded-none shadow-md",
);

// ─────────────────────────────────────────────────────────────────────────────
// LOCATION BADGE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * LocationBadge
 *
 * Displays current location as a Swiss status badge.
 *
 * @param props - Optional className for sizing in layout contexts.
 * @returns The location badge element.
 */
export function LocationBadge({ className }: { className?: string }) {
	const [isHovered, setIsHovered] = useState(false);

	return (
		<motion.div
			initial={{ opacity: 0, y: -4 }}
			animate={{ opacity: 1, y: 0 }}
			transition={springs.responsive}
			className={cn(badgeBaseClasses, className)}
			style={{ height: BADGE_HEIGHT }}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			{/* Insignia Zone - Flag bleeds to edge like a banner */}
			<div
				className={insigniaClasses}
				style={{ width: INSIGNIA_SIZE, height: INSIGNIA_SIZE }}
			>
				<SquareFlag flag={CountryFlagMA} size={`${INSIGNIA_SIZE}px`} />
			</div>

			{/* Content Zone - Balanced padding */}
			<div className={contentClasses} style={{ padding: CONTENT_PADDING }}>
				<span className="leading-none">Rabat, Morocco</span>
			</div>

			{/* Tooltip */}
			<AnimatePresence>
				{isHovered && (
					<motion.div
						initial={{ opacity: 0, y: 4, scale: 0.98 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: 4, scale: 0.98 }}
						transition={{ duration: 0.15, ease: "easeOut" }}
						className={tooltipClasses}
					>
						Open to Remote
					</motion.div>
				)}
			</AnimatePresence>
		</motion.div>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// TIME BADGE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * TimeBadge
 *
 * Displays the current time in UTC+1 as a Swiss status badge.
 *
 * @param props - Optional className for sizing in layout contexts.
 * @returns The time badge element.
 */
export function TimeBadge({ className }: { className?: string }) {
	const [time, setTime] = useState<string>("");
	const [mounted, setMounted] = useState(false);
	const [isHovered, setIsHovered] = useState(false);

	useEffect(() => {
		setMounted(true);
		const updateTime = () => {
			const now = new Date();
			setTime(
				now.toLocaleTimeString("en-US", {
					hour: "2-digit",
					minute: "2-digit",
					hour12: false,
					timeZone: "Africa/Casablanca",
				}),
			);
		};
		updateTime();
		const interval = setInterval(updateTime, 1000);
		return () => clearInterval(interval);
	}, []);

	// SSR hydration safety — render nothing until mounted
	// This prevents opacity-0 rendering artifacts on page load
	if (!mounted) {
		return null;
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: -4 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ ...springs.responsive, delay: 0.1 }}
			className={cn(badgeBaseClasses, className)}
			style={{ height: BADGE_HEIGHT }}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			role="status"
			aria-label={`Current time ${time}, Timezone UTC+1`}
		>
			{/* Insignia Zone - Icon edge-mounted */}
			<div
				className={insigniaClasses}
				style={{ width: INSIGNIA_SIZE, height: INSIGNIA_SIZE }}
			>
				<Clock weight="duotone" className="size-4" />
			</div>

			{/* Content Zone - Balanced padding */}
			<div className={cn(contentClasses, "min-w-0 flex-1 justify-center px-2")}>
				<span className="font-mono text-xs tabular-nums leading-none">{time}</span>
			</div>

			{/* Tooltip */}
			<AnimatePresence>
				{isHovered && (
					<motion.div
						initial={{ opacity: 0, y: 4, scale: 0.98 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: 4, scale: 0.98 }}
						transition={{ duration: 0.15, ease: "easeOut" }}
						className={tooltipClasses}
					>
						UTC+1
					</motion.div>
				)}
			</AnimatePresence>
		</motion.div>
	);
}


/**
 * MarqueeBadge
 *
 * Displays a looping text marquee using the Swiss badge styling.
 * Uses measured DOM width for pixel-perfect seamless looping.
 *
 * @param props - items: Array of strings to cycle through.
 * @returns The marquee badge element.
 */
export function MarqueeBadge({ items, className }: { items: string[]; className?: string }) {
	const [mounted, setMounted] = useState(false);
	const [contentWidth, setContentWidth] = useState(0);
	const [containerWidth, setContainerWidth] = useState(0);
	const contentRef = useRef<HTMLDivElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const trackRef = useRef<HTMLDivElement>(null);
	const animationRef = useRef<Animation | null>(null);

	useEffect(() => {
		setMounted(true);
	}, []);

	// Measure dimensions
	useEffect(() => {
		if (mounted) {
			if (contentRef.current) {
				setContentWidth(contentRef.current.offsetWidth);
			}
			if (containerRef.current) {
				setContainerWidth(containerRef.current.offsetWidth);
			}

			const handleResize = () => {
				if (containerRef.current) {
					setContainerWidth(containerRef.current.offsetWidth);
				}
			};
			window.addEventListener("resize", handleResize);
			return () => window.removeEventListener("resize", handleResize);
		}
	}, [mounted, items]);

	// Calculate how many copies we need to cover the container + one buffer scroll
	const numCopies =
		contentWidth > 0 && containerWidth > 0
			? Math.max(2, Math.ceil((containerWidth + contentWidth) / contentWidth) + 1)
			: 2;

	// Total distance to translate is the width of one full cycle
	const translateDistance = contentWidth;

	// Speed: pixels per second
	const speed = 50;
	const duration = translateDistance > 0 ? translateDistance / speed : 10;

	// WAAPI Animation Logic for "Intelligent Ticker" (Pause on Hover)
	useEffect(() => {
		if (!mounted || translateDistance === 0 || !trackRef.current) return;

		// Cleanup previous animation
		if (animationRef.current) {
			animationRef.current.cancel();
		}

		// Create new animation: 0 -> -translateX
		const animation = trackRef.current.animate(
			[{ transform: "translateX(0)" }, { transform: `translateX(-${translateDistance}px)` }],
			{
				duration: duration * 1000, // ms
				iterations: Number.POSITIVE_INFINITY,
				easing: "linear",
			},
		);

		animationRef.current = animation;

		return () => {
			animation.cancel();
		};
	}, [mounted, translateDistance, duration]);

	// SSR hydration safety
	if (!mounted) {
		return null;
	}

	const Separator = () => (
		<span className="inline-block px-4 text-surface-400 select-none">•</span>
	);

	return (
		<motion.div
			initial={{ opacity: 0, y: -4 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ ...springs.responsive, delay: 0.05 }}
			className={cn(badgeBaseClasses, "overflow-hidden", className)}
			style={{ height: BADGE_HEIGHT }}
			ref={containerRef}
			// Interaction: Pause on Hover (Psychology: User Agency)
			onMouseEnter={() => animationRef.current?.pause()}
			onMouseLeave={() => animationRef.current?.play()}
		>
			<div className="relative h-full w-full overflow-hidden px-2">
				<div className="absolute inset-y-0 left-0 flex items-center" ref={trackRef}>
					{/* First instance with ref for measurement - This constitutes ONE complete cycle */}
					<div ref={contentRef} className="flex items-center">
						{items.map((item, i) => (
							<div key={`item-${item}-${i}`} className="flex items-center">
								<span className="cursor-default whitespace-nowrap font-medium text-xs leading-none">
									{item}
								</span>
								<Separator />
							</div>
						))}
					</div>

					{/* Dynamically generated copies */}
					{Array.from({ length: numCopies - 1 }).map((_, copyIndex) => (
						<div
							key={`copy-${copyIndex}`}
							aria-hidden="true"
							className="flex items-center"
						>
							{items.map((item, itemIndex) => (
								<div
									key={`copy-item-${copyIndex}-${item}-${itemIndex}`}
									className="flex items-center"
								>
									<span className="cursor-default whitespace-nowrap font-medium text-xs leading-none">
										{item}
									</span>
									<Separator />
								</div>
							))}
						</div>
					))}
				</div>
			</div>
		</motion.div>
	);
}
