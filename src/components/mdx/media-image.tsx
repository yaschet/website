/**
 * MediaImage component.
 *
 * @remarks
 * Image with zoom functionality.
 * Features:
 * - Pre-loads full-resolution image for instant lightbox
 * - Dynamic aspect ratio from static imports
 * - Subtle corner hint on hover (Swiss design)
 * - Native Next.js blur placeholder support
 *
 * @example
 * ```tsx
 * <MediaImage src="/img.png" />
 * ```
 *
 * @public
 */

"use client";

import { MagnifyingGlassPlus } from "@phosphor-icons/react/dist/ssr";
import { AnimatePresence, motion } from "framer-motion";
import type { StaticImageData } from "next/image";
import NextImage from "next/image";
import { useCallback, useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { resolveAsset } from "@/src/lib/assets";
import { cn, springs } from "@/src/lib/index";

interface MediaImageProps {
	src: string;
	alt?: string;
	width?: number;
	height?: number;
	caption?: string;
	className?: string;
	/** Load immediately (for above-the-fold images) */
	priority?: boolean;
}

export function MediaImage({
	src: rawSrc,
	alt = "",
	width: propWidth,
	height: propHeight,
	caption,
	className,
	priority = false,
}: MediaImageProps) {
	const layoutId = useId();
	const [isOpen, setIsOpen] = useState(false);
	const [isPreloaded, setIsPreloaded] = useState(false);
	const [mounted, setMounted] = useState(false);

	// Resolve asset and extract data from static imports
	const src = resolveAsset(rawSrc);
	const isStatic = typeof src !== "string";

	// Extract actual dimensions from static imports, or use props/defaults
	const staticData = isStatic ? (src as StaticImageData) : null;
	const actualWidth = staticData?.width ?? propWidth ?? 1200;
	const actualHeight = staticData?.height ?? propHeight ?? 800;
	const blurDataURL = staticData?.blurDataURL ?? null;

	// Calculate aspect ratio from actual dimensions
	const aspectRatio = actualWidth / actualHeight;

	// Get the actual source URL for preloading
	const srcUrl = isStatic ? staticData?.src : (src as string);

	// Preload handling: Only when user intends to view (Hover)
	// This prevents the browser from downloading massive images on page load
	const handleInteraction = useCallback(() => {
		if (srcUrl && !isPreloaded) {
			const img = new window.Image();
			img.src = srcUrl;
			img.onload = () => setIsPreloaded(true);
		}
	}, [srcUrl, isPreloaded]);

	useEffect(() => {
		setMounted(true);
	}, []);

	const close = useCallback(() => {
		setIsOpen(false);
		document.body.style.overflow = "";
	}, []);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape" && isOpen) {
				close();
			}
		};

		if (isOpen) {
			document.addEventListener("keydown", handleKeyDown);
			document.body.style.overflow = "hidden";
		}

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
			if (isOpen) {
				document.body.style.overflow = "";
			}
		};
	}, [isOpen, close]);

	return (
		<>
			<figure
				data-breakout="true"
				className="media-breakout group mb-(--portfolio-space-group)"
			>
				<motion.div
					layoutId={layoutId}
					onClick={() => setIsOpen(true)}
					onMouseEnter={handleInteraction}
					onFocus={handleInteraction}
					transition={springs.layout}
					className={cn(
						"relative w-full cursor-zoom-in overflow-hidden",
						"border border-surface-200 bg-surface-100 dark:border-surface-800 dark:bg-surface-900",
						// Subtle scale on hover
						"transition-transform duration-300 ease-out hover:scale-[1.01]",
						className,
					)}
					style={{
						aspectRatio,
						// PERF: Isolate layout and paint to prevent main-thread blocking reflows
						contain: "layout paint",
					}}
				>
					<NextImage
						src={src}
						alt={alt}
						fill
						sizes="(max-width: 768px) 100vw, 768px"
						className="size-full object-cover"
						placeholder={blurDataURL ? "blur" : "empty"}
						blurDataURL={blurDataURL ?? undefined}
						priority={priority}
						decoding="async"
						quality={85}
					/>

					{/* Hover Hint: Subtle corner badge (Swiss design) */}
					<div
						className={cn(
							"absolute right-3 bottom-3 z-20",
							"flex items-center gap-1.5 px-2 py-1",
							"border border-surface-200 bg-white/95 dark:border-surface-700 dark:bg-surface-900/95",
							"font-mono text-[10px] text-surface-600 uppercase tracking-widest dark:text-surface-400",
							"opacity-0 transition-opacity duration-200 group-hover:opacity-100",
						)}
					>
						<MagnifyingGlassPlus size={12} weight="bold" />
						<span>Zoom</span>
					</div>
				</motion.div>

				{(caption || alt) && (
					<figcaption className="mt-(--portfolio-space-tight) text-left font-mono text-surface-500 text-xs dark:text-surface-400">
						{caption || alt}
					</figcaption>
				)}
			</figure>

			{mounted &&
				createPortal(
					<AnimatePresence>
						{isOpen && (
							<>
								{/* Backdrop */}
								<motion.div
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
									transition={{ duration: 0.2 }}
									onClick={close}
									// OPTIMIZATION: Removed blur for 240Hz lightbox entry
									className="fixed inset-0 z-[9998] cursor-zoom-out bg-black/98"
									aria-hidden="true"
								/>

								{/* Lightbox Container */}
								<div
									className="fixed inset-0 z-[9999] flex cursor-zoom-out items-center justify-center"
									onClick={close}
									onKeyDown={(e) => e.key === "Escape" && close()}
									role="dialog"
									aria-label="Enlarged image"
									aria-modal="true"
								>
									<motion.div
										layoutId={layoutId}
										transition={springs.layout}
										className="pointer-events-auto relative overflow-hidden bg-surface-900"
										style={{
											// Use viewport-relative sizing that respects aspect ratio
											width: `min(92vw, 92vh * ${aspectRatio})`,
											height: `min(92vh, 92vw / ${aspectRatio})`,
											aspectRatio,
										}}
									>
										<NextImage
											src={src}
											alt={alt}
											fill
											sizes="95vw"
											className="size-full object-contain"
											priority // Load immediately when lightbox opens
										/>
									</motion.div>
								</div>

								{/* Caption */}
								{(caption || alt) && (
									<motion.div
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: 10 }}
										transition={springs.gentle}
										className="pointer-events-none fixed bottom-6 left-1/2 z-[10000] -translate-x-1/2 border border-surface-700 bg-surface-900/95 px-4 py-2 font-mono text-surface-100 text-xs"
									>
										{caption || alt}
									</motion.div>
								)}

								{/* Close hint */}
								<motion.div
									initial={{ opacity: 0 }}
									animate={{ opacity: 0.4 }}
									exit={{ opacity: 0 }}
									transition={{ delay: 0.3 }}
									className="pointer-events-none fixed top-6 right-6 z-[10000] font-mono text-white text-xs uppercase tracking-wider"
								>
									ESC to close
								</motion.div>
							</>
						)}
					</AnimatePresence>,
					document.body,
				)}
		</>
	);
}
