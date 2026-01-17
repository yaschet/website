"use client";

import { Calendar, Clock, Crosshair, MapPin } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

import { useReveal } from "@/src/components/providers/reveal-provider";
import { springs } from "@/src/lib/physics";
import { cn } from "@/src/lib/utils";

// Match FloatingNav visual system but with added interactive capabilities
const badgeClasses = cn(
	"group relative z-20 flex items-center justify-center overflow-hidden",
	"px-3 py-1.5 rounded-[var(--radius)]",
	"border border-surface-200/80 dark:border-surface-800/80",
	"bg-white/90 dark:bg-surface-950/90 backdrop-blur-xl",
	"shadow-lg shadow-surface-900/5 dark:shadow-surface-950/50",
	"text-xs font-medium text-surface-600 dark:text-surface-400",
	"cursor-default select-none transition-colors pointer-events-auto",
	"hover:bg-surface-50 dark:hover:bg-surface-900",
	"hover:text-surface-900 dark:hover:text-surface-100",
);

// ─────────────────────────────────────────────────────────────────────────────
// LOCATION BADGE: Reveals Precise Coordinates on Hover
// ─────────────────────────────────────────────────────────────────────────────

export function LocationBadge() {
	const { phase } = useReveal();
	const isEnabled = phase >= 1;
	const [isHovered, setIsHovered] = useState(false);

	// Rabat, Morocco Coordinates
	const city = "Rabat, Morocco";
	const coords = "34.0209° N, 6.8416° W";

	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.9 }}
			animate={isEnabled ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
			transition={{ ...springs.responsive, delay: 0.15 }}
			className={badgeClasses}
			onHoverStart={() => setIsHovered(true)}
			onHoverEnd={() => setIsHovered(false)}
			layout
			role="status"
			aria-label={`Location: ${city}`}
		>
			<motion.div layout className="relative flex items-center gap-2">
				{/* Icon Swap */}
				<div className="relative size-3.5">
					<AnimatePresence mode="wait">
						{isHovered ? (
							<motion.div
								key="coords-icon"
								initial={{ opacity: 0, scale: 0.5 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.5 }}
								transition={{ duration: 0.2 }}
								className="absolute inset-0"
							>
								<Crosshair weight="bold" className="size-full" />
							</motion.div>
						) : (
							<motion.div
								key="city-icon"
								initial={{ opacity: 0, scale: 0.5 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.5 }}
								transition={{ duration: 0.2 }}
								className="absolute inset-0"
							>
								<MapPin weight="duotone" className="size-full" />
							</motion.div>
						)}
					</AnimatePresence>
				</div>

				{/* Text Swap */}
				<motion.div layout className="relative h-4 overflow-hidden">
					<AnimatePresence mode="popLayout" initial={false}>
						{isHovered ? (
							<motion.span
								key="coords"
								initial={{ y: 20, opacity: 0 }}
								animate={{ y: 0, opacity: 1 }}
								exit={{ y: -20, opacity: 0 }}
								transition={springs.glitch}
								className="block whitespace-nowrap font-mono text-[10px] tracking-wide tabular-nums leading-4"
							>
								{coords}
							</motion.span>
						) : (
							<motion.span
								key="city"
								initial={{ y: -20, opacity: 0 }}
								animate={{ y: 0, opacity: 1 }}
								exit={{ y: 20, opacity: 0 }}
								transition={springs.glitch}
								className="block whitespace-nowrap leading-4"
							>
								{city}
							</motion.span>
						)}
					</AnimatePresence>
				</motion.div>
			</motion.div>
		</motion.div>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// TIME BADGE: Reveals Date on Hover
// ─────────────────────────────────────────────────────────────────────────────

export function TimeBadge() {
	const { phase } = useReveal();
	const isEnabled = phase >= 1;
	const [time, setTime] = useState<string>("");
	const [date, setDate] = useState<string>("");
	const [mounted, setMounted] = useState(false);
	const [isHovered, setIsHovered] = useState(false);

	useEffect(() => {
		setMounted(true);
		const updateTime = () => {
			const now = new Date();
			// Time: "14:30"
			setTime(
				now.toLocaleTimeString("en-US", {
					hour: "2-digit",
					minute: "2-digit",
					hour12: false,
					timeZone: "Africa/Casablanca",
				}),
			);
			// Date: "Fri, Oct 24"
			setDate(
				now.toLocaleDateString("en-US", {
					weekday: "short",
					month: "short",
					day: "numeric",
					timeZone: "Africa/Casablanca",
				}),
			);
		};

		updateTime();
		const interval = setInterval(updateTime, 1000);
		return () => clearInterval(interval);
	}, []);

	if (!mounted) {
		return (
			<div className={badgeClasses}>
				<span className="opacity-0">00:00</span>
			</div>
		);
	}

	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.9 }}
			animate={isEnabled ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
			transition={{ ...springs.responsive, delay: 0.2 }}
			className={badgeClasses}
			onHoverStart={() => setIsHovered(true)}
			onHoverEnd={() => setIsHovered(false)}
			layout
			role="status"
			aria-label="Current time in Rabat"
		>
			<motion.div layout className="relative flex items-center gap-2">
				{/* Icon Swap */}
				<div className="relative size-3.5">
					<AnimatePresence mode="wait">
						{isHovered ? (
							<motion.div
								key="date-icon"
								initial={{ opacity: 0, scale: 0.5 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.5 }}
								transition={{ duration: 0.2 }}
								className="absolute inset-0"
							>
								<Calendar weight="bold" className="size-full" />
							</motion.div>
						) : (
							<motion.div
								key="time-icon"
								initial={{ opacity: 0, scale: 0.5 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.5 }}
								transition={{ duration: 0.2 }}
								className="absolute inset-0"
							>
								<Clock weight="duotone" className="size-full" />
							</motion.div>
						)}
					</AnimatePresence>
				</div>

				{/* Text Swap */}
				<motion.div layout className="relative h-4 overflow-hidden">
					<AnimatePresence mode="popLayout" initial={false}>
						{isHovered ? (
							<motion.span
								key="date"
								initial={{ y: 20, opacity: 0 }}
								animate={{ y: 0, opacity: 1 }}
								exit={{ y: -20, opacity: 0 }}
								transition={springs.glitch}
								className="block whitespace-nowrap text-[10px] uppercase tracking-wide leading-4"
							>
								{date}
							</motion.span>
						) : (
							<motion.span
								key="time"
								initial={{ y: -20, opacity: 0 }}
								animate={{ y: 0, opacity: 1 }}
								exit={{ y: 20, opacity: 0 }}
								transition={springs.glitch}
								className="block whitespace-nowrap font-mono text-xs tabular-nums leading-4"
							>
								{time}
							</motion.span>
						)}
					</AnimatePresence>
				</motion.div>
			</motion.div>
		</motion.div>
	);
}
