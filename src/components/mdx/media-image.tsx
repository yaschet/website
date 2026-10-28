"use client";

import { MediaGallery } from "@/src/components/ui/media-gallery";
import { resolveAsset } from "@/src/lib/assets";

interface MediaImageProps {
	src: string;
	alt?: string;
	width?: number;
	height?: number;
	caption?: string;
	className?: string;
	priority?: boolean;
}

/** Article images reuse the gallery's keyboard-operable, focus-managed expanded viewer. */
export function MediaImage({
	src,
	alt = "",
	width,
	height,
	caption,
	className,
	priority = false,
}: MediaImageProps) {
	const asset = resolveAsset(src);
	const ratio =
		typeof asset === "string"
			? `${width ?? 1200}/${height ?? 800}`
			: `${asset.width}/${asset.height}`;
	return (
		<figure data-breakout="true" className="media-breakout mb-(--portfolio-space-group)">
			<MediaGallery
				items={[{ kind: "image", src: asset, alt, caption: caption ?? alt }]}
				altPrefix={alt || "Case-study image"}
				aspectRatio={ratio}
				showArrows={false}
				showProgress={false}
				showCounter={false}
				enableKeyboard={false}
				expandable
				prioritizeFirstImage={priority}
				className={className}
				sizes="(max-width: 768px) 100vw, 896px"
			/>
			{(caption || alt) && (
				<figcaption className="mt-(--portfolio-space-tight) text-[13px]/5 text-muted-foreground">
					{caption || alt}
				</figcaption>
			)}
		</figure>
	);
}
