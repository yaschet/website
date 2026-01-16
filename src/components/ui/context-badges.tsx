"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useReveal } from "@/src/components/providers/reveal-provider";
import { springs } from "@/src/lib/physics";

// Match FloatingNav visual system
const badgeClasses =
	"flex items-center justify-center px-3 py-1.5 rounded-full border border-surface-200/80 dark:border-surface-800/80 bg-white/90 dark:bg-surface-950/90 backdrop-blur-xl shadow-lg shadow-surface-900/5 dark:shadow-surface-950/50 text-xs font-medium text-surface-600 dark:text-surface-400 cursor-default select-none";

export function LocationBadge() {
	const { phase } = useReveal();
	const isEnabled = phase >= 1;

	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.9 }}
			animate={isEnabled ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
			transition={{ ...springs.responsive, delay: 0.15 }}
			whileHover={{ scale: 1.05 }}
			whileTap={{ scale: 0.95 }}
			className={badgeClasses}
		>
			Rabat, Morocco
		</motion.div>
	);
}

export function TimeBadge() {
	const { phase } = useReveal();
	const isEnabled = phase >= 1;
	const [time, setTime] = useState<string>("");
	const [mounted, setMounted] = useState(false);

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
			whileHover={{ scale: 1.05 }}
			whileTap={{ scale: 0.95 }}
			className={badgeClasses}
		>
			<span className="tabular-nums">{time}</span>
		</motion.div>
	);
}
