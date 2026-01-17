"use client";

/**
 * MediaImage - Interactive Image with Lightbox
 *
 * @module media-image
 * @description
 * Premium image component with click-to-zoom lightbox.
 * Uses Framer Motion layoutId for shared element transition.
 *
 * Usage in MDX:
 * ```mdx
 * ![Architecture diagram](/images/verto/architecture.png)
 * ```
 * or
 * ```mdx
 * <Image src="/images/verto/architecture.png" alt="Architecture diagram" />
 * ```
 */

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { X } from "@phosphor-icons/react";
import { springs } from "@/src/lib/physics";
import { cn } from "@/src/lib/utils";

interface MediaImageProps {
	src: string;
	alt?: string;
	width?: number;
	height?: number;
	caption?: string;
	className?: string;
}

export function MediaImage({ src, alt = "", width, height, caption, className }: MediaImageProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

	// Generate unique ID for layoutId
	const layoutId = `image-${src.replace(/[^a-zA-Z0-9]/g, "-")}`;

	// Handle keyboard close
	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			if (e.key === "Escape" && isOpen) {
				setIsOpen(false);
			}
		},
		[isOpen],
	);

	useEffect(() => {
		if (isOpen) {
			document.addEventListener("keydown", handleKeyDown);
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
			document.body.style.overflow = "";
		};
	}, [isOpen, handleKeyDown]);

	// Use provided dimensions or defaults
	const imgWidth = width || dimensions.width;
	const imgHeight = height || dimensions.height;

	return (
		<>
			{/* In-content Image */}
			<figure className="group mb-8">
				<motion.div
					layoutId={layoutId}
					onClick={() => setIsOpen(true)}
					className={cn(
						"relative cursor-zoom-in overflow-hidden",
						"border border-surface-200 dark:border-surface-800",
						"transition-shadow duration-300 hover:shadow-lg",
						className,
					)}
					style={{ aspectRatio: `${imgWidth}/${imgHeight}` }}
				>
					<Image
						src={src}
						alt={alt}
						fill
						sizes="(max-width: 768px) 100vw, 768px"
						className="object-cover"
						onLoad={(e) => {
							const img = e.currentTarget;
							if (img.naturalWidth && img.naturalHeight) {
								setDimensions({
									width: img.naturalWidth,
									height: img.naturalHeight,
								});
							}
						}}
					/>

					{/* Hover Overlay */}
					<div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/10 group-hover:opacity-100">
						<span className="rounded-full bg-white/90 px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-surface-900 shadow-lg">
							Click to zoom
						</span>
					</div>
				</motion.div>

				{/* Caption */}
				{(caption || alt) && (
					<figcaption className="mt-3 text-center font-mono text-xs text-muted-foreground">
						{caption || alt}
					</figcaption>
				)}
			</figure>

			{/* Lightbox */}
			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
						className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-8"
						onClick={() => setIsOpen(false)}
					>
						{/* Close Button */}
						<button
							type="button"
							onClick={() => setIsOpen(false)}
							className="absolute right-6 top-6 flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
							aria-label="Close"
						>
							<X size={20} weight="bold" />
						</button>

						{/* Expanded Image */}
						<motion.div
							layoutId={layoutId}
							transition={springs.layout}
							className="relative max-h-[85vh] max-w-[90vw] overflow-hidden"
							style={{ aspectRatio: `${imgWidth}/${imgHeight}` }}
							onClick={(e) => e.stopPropagation()}
						>
							<Image
								src={src}
								alt={alt}
								fill
								sizes="90vw"
								className="object-contain"
								priority
							/>
						</motion.div>

						{/* Caption in Lightbox */}
						{(caption || alt) && (
							<motion.p
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: 10 }}
								transition={{ delay: 0.2 }}
								className="absolute bottom-6 left-1/2 -translate-x-1/2 font-mono text-sm text-white/80"
							>
								{caption || alt}
							</motion.p>
						)}
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}
