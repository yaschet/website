"use client";

/**
 * MediaGallery - Inline Scrub Gallery
 *
 * @module media-gallery
 * @description
 * Same scrub interaction as hero gallery, usable inline in content.
 *
 * Usage in MDX:
 * ```mdx
 * <Gallery
 *   images={["/img1.png", "/img2.png", "/img3.png"]}
 *   caption="Editor states"
 * />
 * ```
 */

import Image from "next/image";
import { useState, type MouseEvent } from "react";
import { cn } from "@/src/lib/utils";

interface MediaGalleryProps {
	images: string[];
	caption?: string;
	aspectRatio?: string;
	className?: string;
}

export function MediaGallery({
	images,
	caption,
	aspectRatio = "16/9",
	className,
}: MediaGalleryProps) {
	const [activeIndex, setActiveIndex] = useState(0);
	const hasGallery = images.length > 1;

	function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
		if (!hasGallery) return;
		const { left, width } = e.currentTarget.getBoundingClientRect();
		const x = e.clientX - left;
		const newIndex = Math.floor((x / width) * images.length);
		const clampedIndex = Math.max(0, Math.min(newIndex, images.length - 1));
		if (clampedIndex !== activeIndex) {
			setActiveIndex(clampedIndex);
		}
	}

	function handleMouseLeave() {
		setActiveIndex(0);
	}

	if (images.length === 0) return null;

	return (
		<figure className="mb-8">
			<div
				className={cn(
					"group relative w-full overflow-hidden",
					"border border-surface-200 bg-surface-100 dark:border-surface-800 dark:bg-surface-800",
					className,
				)}
				style={{ aspectRatio }}
				onMouseMove={handleMouseMove}
				onMouseLeave={handleMouseLeave}
			>
				{/* Gallery Strip */}
				<div
					className="flex h-full transition-transform duration-300 ease-out will-change-transform"
					style={{
						width: `${images.length * 100}%`,
						transform: `translateX(-${(activeIndex * 100) / images.length}%)`,
					}}
				>
					{images.map((src, i) => (
						<div key={src} className="relative h-full w-full flex-1">
							<Image
								src={src}
								alt={`Gallery image ${i + 1}`}
								fill
								sizes="(max-width: 768px) 100vw, 768px"
								className="object-cover"
							/>
						</div>
					))}
				</div>

				{/* Swiss Ticks */}
				{hasGallery && (
					<div className="absolute inset-x-0 bottom-0 flex gap-0.5 p-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
						{images.map((src, i) => (
							<div
								key={`tick-${src}`}
								className={cn(
									"h-0.5 flex-1 transition-colors duration-200",
									i === activeIndex
										? "bg-surface-900 dark:bg-surface-100"
										: "bg-surface-900/20 dark:bg-surface-100/20",
								)}
							/>
						))}
					</div>
				)}

				{/* Image Counter */}
				<div className="absolute right-3 top-3 rounded bg-black/50 px-2 py-1 font-mono text-[10px] text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
					{activeIndex + 1} / {images.length}
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
