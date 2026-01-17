"use client";

import { Clock, Globe } from "@phosphor-icons/react";
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
// LOCATION BADGE: Context & Availability
// ─────────────────────────────────────────────────────────────────────────────

export function LocationBadge() {
	const { phase } = useReveal();
	const isEnabled = phase >= 1;
	const [isHovered, setIsHovered] = useState(false);

	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.9 }}
			animate={isEnabled ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
			transition={{ ...springs.responsive, delay: 0.15 }}
			className={badgeClasses}
			onHoverStart={() => setIsHovered(true)}
			onHoverEnd={() => setIsHovered(false)}
			role="status"
			aria-label="Location and Availability"
		>
			<div className="relative flex items-center gap-2">
				{/* Icon Swap: Flag → Globe */}
				<div className="relative size-3.5 overflow-hidden rounded-[1px]">
					<AnimatePresence mode="wait">
						{isHovered ? (
							<motion.div
								key="globe-icon"
								initial={{ opacity: 0, scale: 0.8 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.8 }}
								transition={{ duration: 0.15 }}
								className="absolute inset-0 flex items-center justify-center"
							>
								<Globe
									weight="bold"
									className="size-full text-surface-900 dark:text-surface-100"
								/>
							</motion.div>
						) : (
							<motion.div
								key="flag-icon"
								initial={{ opacity: 0, scale: 0.8 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.8 }}
								transition={{ duration: 0.15 }}
								className="absolute inset-0 flex items-center justify-center"
							>
								{/* Moroccan Flag - Premium SVG via flag-icons */}
								<span
									className="fi fi-ma size-full"
									role="img"
									aria-label="Moroccan flag"
								/>
							</motion.div>
						)}
					</AnimatePresence>
				</div>

				{/* Text Swap - Zero Layout Shift Architecture */}
				<div className="relative h-4 overflow-hidden">
					{/* Phantom Element: Reserves space for the widest possible text */}
					<span
						className="invisible block whitespace-nowrap font-medium leading-4"
						aria-hidden="true"
					>
						Open to Remote
					</span>

					{/* Absolute Overlay: The actual animating content */}
					<div className="absolute inset-0 flex items-center">
						<AnimatePresence mode="popLayout" initial={false}>
							{isHovered ? (
								<motion.span
									key="status"
									initial={{ y: 12, opacity: 0 }}
									animate={{ y: 0, opacity: 1 }}
									exit={{ y: -12, opacity: 0 }}
									transition={springs.snappy}
									className="block w-full whitespace-nowrap font-medium text-surface-900 dark:text-surface-50 leading-4 text-center"
								>
									Open to Remote
								</motion.span>
							) : (
								<motion.span
									key="city"
									initial={{ y: -12, opacity: 0 }}
									animate={{ y: 0, opacity: 1 }}
									exit={{ y: 12, opacity: 0 }}
									transition={springs.snappy}
									className="block w-full whitespace-nowrap leading-4 text-center"
								>
									Rabat, Morocco
								</motion.span>
							)}
						</AnimatePresence>
					</div>
				</div>
			</div>
		</motion.div>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// TIME BADGE: Local Time & Timezone Context
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
			// Time: "14:30"
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
			role="status"
			aria-label="Local time and timezone"
		>
			<div className="relative flex items-center gap-2">
				{/* Icon Swap */}
				<div className="relative size-3.5">
					<AnimatePresence mode="wait">
						{isHovered ? (
							<motion.div
								key="tz-icon"
								initial={{ opacity: 0, scale: 0.5, rotateX: -90 }}
								animate={{ opacity: 1, scale: 1, rotateX: 0 }}
								exit={{ opacity: 0, scale: 0.5, rotateX: 90 }}
								transition={{ duration: 0.2 }}
								className="absolute inset-0"
							>
								<Clock
									weight="bold"
									className="size-full text-surface-900 dark:text-surface-100"
								/>
							</motion.div>
						) : (
							<motion.div
								key="time-icon"
								initial={{ opacity: 0, scale: 0.5, rotateX: -90 }}
								animate={{ opacity: 1, scale: 1, rotateX: 0 }}
								exit={{ opacity: 0, scale: 0.5, rotateX: 90 }}
								transition={{ duration: 0.2 }}
								className="absolute inset-0"
							>
								<Clock weight="duotone" className="size-full" />
							</motion.div>
						)}
					</AnimatePresence>
				</div>

				{/* Text Swap - Zero Layout Shift Architecture */}
				<div className="relative h-4 overflow-hidden">
					{/* Phantom Element: Reserves space for strict width preservation */}
					{/* Longest possible time string is "00:00" or "UTC+1" - 5 chars approx */}
					<span
						className="invisible block whitespace-nowrap font-mono text-xs tabular-nums leading-4"
						aria-hidden="true"
					>
						00:00
					</span>

					{/* Absolute Overlay */}
					<div className="absolute inset-0 flex items-center justify-center">
						<AnimatePresence mode="popLayout" initial={false}>
							{isHovered ? (
								<motion.span
									key="tz"
									initial={{ y: 12, opacity: 0 }}
									animate={{ y: 0, opacity: 1 }}
									exit={{ y: -12, opacity: 0 }}
									transition={springs.snappy}
									className="block w-full whitespace-nowrap font-medium text-surface-900 dark:text-surface-50 leading-4 text-center"
								>
									UTC+1
								</motion.span>
							) : (
								<motion.span
									key="time"
									initial={{ y: -12, opacity: 0 }}
									animate={{ y: 0, opacity: 1 }}
									exit={{ y: 12, opacity: 0 }}
									transition={springs.snappy}
									className="block w-full whitespace-nowrap font-mono text-xs tabular-nums leading-4 text-center"
								>
									{time}
								</motion.span>
							)}
						</AnimatePresence>
					</div>
				</div>
			</div>
		</motion.div>
	);
}
