/**
 * MediaGallery component.
 *
 * @remarks
 * MDX wrapper for the shared MediaGallery with caption support.
 * Features:
 * - Click arrows or swipe to navigate
 * - Direct dragging and animated expanded viewing
 * - Shared navigation controls
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

import { useMemo, useState } from "react";
import { MediaGallery as BaseMediaGallery } from "@/src/components/ui/media-gallery";
import type { GalleryMediaSource } from "@/src/lib/gallery-media";

interface MediaGalleryProps {
	images?: string[];
	items?: GalleryMediaSource[];
	captions?: string[];
	caption?: string;
	aspectRatio?: string;
	className?: string;
	altPrefix?: string;
	breakout?: boolean;
	sizes?: string;
	prioritizeFirstImage?: boolean;
}

export function MediaGallery({
	images = [],
	items,
	captions,
	caption,
	aspectRatio = "16/9",
	className,
	altPrefix,
	breakout = true,
	sizes = "(max-width: 768px) 100vw, 768px",
	prioritizeFirstImage = false,
}: MediaGalleryProps) {
	const [activeIndex, setActiveIndex] = useState(0);
	const galleryItems = useMemo<GalleryMediaSource[]>(() => {
		if (items?.length) {
			return items.map((item, index) => ({
				...item,
				caption: captions?.[index] || item.caption || caption,
			}));
		}
		return images.map((src, index) => ({
			kind: "image",
			src,
			alt: captions?.[index] || `Gallery media ${index + 1}`,
			caption: captions?.[index] || caption,
		}));
	}, [caption, captions, images, items]);
	const itemCount = galleryItems.length;

	if (itemCount === 0) return null;

	// Get current media caption
	const currentCaption = galleryItems[activeIndex]?.caption;
	const first = galleryItems[0];
	const galleryLabel =
		altPrefix ||
		caption ||
		(first?.kind === "mux-video" ? first.title || first.alt : first?.alt);

	return (
		<figure
			data-slot="media-panel"
			data-breakout={breakout ? "true" : undefined}
			className={breakout ? "media-breakout mb-(--portfolio-space-group)" : "m-0"}
		>
			<BaseMediaGallery
				items={galleryItems}
				altPrefix={galleryLabel || "Gallery media"}
				aspectRatio={aspectRatio}
				showArrows={itemCount > 1}
				showProgress={itemCount > 1}
				showCounter={itemCount > 1}
				onIndexChange={setActiveIndex}
				className={className}
				prioritizeFirstImage={prioritizeFirstImage}
				expandable
				sizes={sizes}
				quality={75}
			/>

			{/* Caption */}
			{currentCaption && (
				<figcaption
					className={`text-left text-[0.8125rem]/5 text-muted-foreground ${breakout ? "mt-(--portfolio-space-tight)" : "px-(--portfolio-box-pad-mobile) py-3 sm:px-8"}`}
				>
					{currentCaption}
				</figcaption>
			)}
		</figure>
	);
}
