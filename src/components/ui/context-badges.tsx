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
import { useEffect, useState } from "react";
import { CountryFlagMA, SquareFlag } from "react-square-flags";

import { useReveal } from "@/src/components/providers/reveal-provider";
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
	"group relative z-20 flex items-center",
	"rounded-[var(--radius)]",
	"border border-surface-200/80 dark:border-surface-800/80",
	"bg-white/90 backdrop-blur-xl dark:bg-surface-950/90",
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
	"pointer-events-none absolute top-full left-1/2 z-20 mt-2 -translate-x-1/2 whitespace-nowrap",
	"px-2 py-1.5 font-bold text-xs",
	"bg-white dark:bg-surface-900",
	"text-surface-700 dark:text-surface-300",
	"border border-surface-200 dark:border-surface-800",
	"rounded-none shadow-md",
);

// ─────────────────────────────────────────────────────────────────────────────
// LOCATION BADGE
// ─────────────────────────────────────────────────────────────────────────────

export function LocationBadge() {
	const { phase } = useReveal();
	const isEnabled = phase >= 1;
	const [isHovered, setIsHovered] = useState(false);

	return (
		<motion.div
			initial={{ opacity: 0, y: 8 }}
			animate={isEnabled ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
			transition={springs.responsive}
			className={badgeBaseClasses}
			style={{ height: BADGE_HEIGHT }}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			role="status"
			aria-label="Rabat, Morocco - Open to Remote"
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

export function TimeBadge() {
	const { phase } = useReveal();
	const isEnabled = phase >= 1;
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

	// SSR hydration safety
	if (!mounted) {
		return (
			<div className={badgeBaseClasses} style={{ height: BADGE_HEIGHT }}>
				<div
					className={insigniaClasses}
					style={{ width: INSIGNIA_SIZE, height: INSIGNIA_SIZE }}
				>
					<Clock weight="duotone" className="size-4" />
				</div>
				<div className={contentClasses} style={{ padding: CONTENT_PADDING }}>
					<span className="font-mono text-xs tabular-nums opacity-0">00:00</span>
				</div>
			</div>
		);
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 8 }}
			animate={isEnabled ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
			transition={{ ...springs.responsive, delay: 0.05 }}
			className={badgeBaseClasses}
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
			<div className={contentClasses} style={{ padding: CONTENT_PADDING }}>
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
