/**
 * MediaGallery component.
 *
 * @remarks
 * MDX wrapper for ImageGallery with caption support.
 * Features:
 * - Click arrows or swipe to navigate
 * - Spring physics for slide transitions
 * - Always-visible dot indicators
 * - Touch/swipe support for mobile
 * - Keyboard navigation (arrow keys)
 * - Per-image captions
 *
 * @example
 * ```tsx
 * <MediaGallery images={["/img1.png", "/img2.png"]} />
 * ```
 *
 * @public
 */

"use client";

import { useState } from "react";
import { ImageGallery } from "@/src/components/ui/image-gallery";

interface MediaGalleryProps {
	images: string[];
	captions?: string[];
	caption?: string;
	aspectRatio?: string;
	className?: string;
}

export function MediaGallery({
	images,
	captions,
	caption,
	aspectRatio = "16/9",
	className,
}: MediaGalleryProps) {
	const [activeIndex, setActiveIndex] = useState(0);

	if (images.length === 0) return null;

	// Get current image caption
	const currentCaption = captions?.[activeIndex] || caption;

	return (
		<figure className="mb-8">
			<ImageGallery
				images={images}
				alts={captions}
				altPrefix="Gallery image"
				aspectRatio={aspectRatio}
				showArrows={images.length > 1}
				showDots={images.length > 1}
				showCounter={images.length > 1}
				onIndexChange={setActiveIndex}
				className={className}
			/>

			{/* Caption */}
			{currentCaption && (
				<figcaption className="mt-3 text-center font-mono text-muted-foreground text-xs">
					{currentCaption}
				</figcaption>
			)}

			{/* Type Label */}
			{images.length > 1 && (
				<div className="absolute top-3 left-3 border border-surface-200 bg-white/95 px-2 py-1 font-mono text-[10px] text-surface-900 uppercase tracking-widest opacity-0 transition-opacity duration-200 group-hover:opacity-100 dark:border-surface-700 dark:bg-surface-900/95 dark:text-surface-100">
					Gallery
				</div>
			)}
		</figure>
	);
}
