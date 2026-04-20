/**
 * MediaGallery component.
 *
 * @remarks
 * MDX wrapper for the shared MediaGallery with caption support.
 * Features:
 * - Click arrows or swipe to navigate
 * - Spring physics for slide transitions
 * - Always-visible dot indicators
 * - Touch/swipe support for mobile
 * - Keyboard navigation (arrow keys)
 * - Per-item captions
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
import { MediaGallery as BaseMediaGallery } from "@/src/components/ui/media-gallery";
import type { GalleryMediaSource } from "@/src/lib/gallery-media";

interface MediaGalleryProps {
	images?: string[];
	items?: GalleryMediaSource[];
	captions?: string[];
	caption?: string;
	aspectRatio?: string;
	className?: string;
}

export function MediaGallery({
	images = [],
	items,
	captions,
	caption,
	aspectRatio = "16/9",
	className,
}: MediaGalleryProps) {
	const [activeIndex, setActiveIndex] = useState(0);
	const itemCount = items?.length ?? images.length;

	if (itemCount === 0) return null;

	// Get current media caption
	const currentCaption =
		captions?.[activeIndex] || (items?.[activeIndex]?.caption ?? undefined) || caption;

	return (
		<figure data-breakout="true" className="media-breakout mb-(--portfolio-space-group)">
			<BaseMediaGallery
				items={items}
				images={images}
				alts={captions}
				altPrefix="Gallery media"
				aspectRatio={aspectRatio}
				showArrows={itemCount > 1}
				showProgress={itemCount > 1}
				showCounter={itemCount > 1}
				onIndexChange={setActiveIndex}
				className={className}
				expandable
				sizes="(max-width: 768px) 100vw, 768px"
				quality={75}
			/>

			{/* Caption */}
			{currentCaption && (
				<figcaption className="mt-(--portfolio-space-tight) text-left font-mono text-surface-500 text-xs dark:text-surface-400">
					{currentCaption}
				</figcaption>
			)}
		</figure>
	);
}
