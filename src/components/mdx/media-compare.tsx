"use client";

/**
 * MediaCompare - Before/After Comparison Slider
 *
 * @module media-compare
 * @description
 * Drag-based comparison slider for before/after images.
 * Uses Framer Motion for smooth dragging with spring physics.
 *
 * Usage in MDX:
 * ```mdx
 * <Compare
 *   before="/images/before.png"
 *   after="/images/after.png"
 *   caption="Translation quality improvement"
 * />
 * ```
 */

import { motion, useMotionValue, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef, useState } from "react";
import { cn } from "@/src/lib/utils";

interface MediaCompareProps {
	before: string;
	after: string;
	beforeAlt?: string;
	afterAlt?: string;
	caption?: string;
	className?: string;
}

export function MediaCompare({
	before,
	after,
	beforeAlt = "Before",
	afterAlt = "After",
	caption,
	className,
}: MediaCompareProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [isDragging, setIsDragging] = useState(false);

	// Position as percentage (0-100)
	const position = useMotionValue(50);

	// Transform to clip-path percentage
	const clipPath = useTransform(position, (val) => `inset(0 ${100 - val}% 0 0)`);

	const handleMove = (clientX: number) => {
		if (!containerRef.current) return;

		const rect = containerRef.current.getBoundingClientRect();
		const x = clientX - rect.left;
		const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
		position.set(percentage);
	};

	const handleMouseMove = (e: React.MouseEvent) => {
		if (!isDragging) return;
		handleMove(e.clientX);
	};

	const handleTouchMove = (e: React.TouchEvent) => {
		if (!isDragging) return;
		handleMove(e.touches[0].clientX);
	};

	return (
		<figure className="mb-8">
			<div
				ref={containerRef}
				className={cn(
					"group relative aspect-video w-full cursor-ew-resize select-none overflow-hidden",
					"border border-surface-200 dark:border-surface-800",
					className,
				)}
				onMouseDown={() => setIsDragging(true)}
				onMouseUp={() => setIsDragging(false)}
				onMouseLeave={() => setIsDragging(false)}
				onMouseMove={handleMouseMove}
				onTouchStart={() => setIsDragging(true)}
				onTouchEnd={() => setIsDragging(false)}
				onTouchMove={handleTouchMove}
			>
				{/* After Image (Background) */}
				<div className="absolute inset-0">
					<Image
						src={after}
						alt={afterAlt}
						fill
						sizes="(max-width: 768px) 100vw, 768px"
						className="object-cover"
					/>
				</div>

				{/* Before Image (Clipped) */}
				<motion.div className="absolute inset-0" style={{ clipPath }}>
					<Image
						src={before}
						alt={beforeAlt}
						fill
						sizes="(max-width: 768px) 100vw, 768px"
						className="object-cover"
					/>
				</motion.div>

				{/* Divider Line */}
				<motion.div
					className="absolute top-0 z-10 h-full w-0.5 bg-white shadow-lg"
					style={{ left: useTransform(position, (val) => `${val}%`) }}
				>
					{/* Handle */}
					<div className="absolute left-1/2 top-1/2 flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-surface-900/80 shadow-lg backdrop-blur-sm transition-transform hover:scale-110">
						<svg
							width="16"
							height="16"
							viewBox="0 0 16 16"
							fill="none"
							className="text-white"
						>
							<path
								d="M5 3L2 8L5 13"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
							<path
								d="M11 3L14 8L11 13"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</div>
				</motion.div>

				{/* Labels (appear on hover) */}
				<div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-between px-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
					<span className="rounded bg-black/60 px-2 py-1 font-mono text-xs text-white backdrop-blur-sm">
						Before
					</span>
					<span className="rounded bg-black/60 px-2 py-1 font-mono text-xs text-white backdrop-blur-sm">
						After
					</span>
				</div>
			</div>

			{/* Caption */}
			{caption && (
				<figcaption className="mt-3 text-center font-mono text-xs text-muted-foreground">
					{caption}
				</figcaption>
			)}
		</figure>
	);
}
