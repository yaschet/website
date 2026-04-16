"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn, tweens } from "@/src/lib/index";

interface HoverTooltipProps {
	visible: boolean;
	children: ReactNode;
	className?: string;
}

export function HoverTooltip({ visible, children, className }: HoverTooltipProps) {
	return (
		<AnimatePresence>
			{visible && (
				<motion.div
					initial={{ opacity: 0, y: 4, scale: 0.98 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					exit={{ opacity: 0, y: 2, scale: 0.99 }}
					transition={tweens.interactionFast}
					className={cn(
						"pointer-events-none absolute bottom-full left-1/2 z-30 mb-1.5 -translate-x-1/2 whitespace-nowrap",
						"border border-surface-200 bg-white px-2.5 py-1.5",
						"font-medium text-[11px] text-surface-700 uppercase leading-none tracking-[0.08em]",
						"shadow-sm dark:border-surface-800 dark:bg-surface-900 dark:text-surface-300",
						className,
					)}
				>
					{children}
				</motion.div>
			)}
		</AnimatePresence>
	);
}
