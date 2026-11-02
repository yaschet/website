"use client";

import { RiPlayFill } from "@remixicon/react";
import type { ComponentPropsWithoutRef } from "react";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/index";

interface GalleryPlayButtonProps
	extends Omit<ComponentPropsWithoutRef<"button">, "children" | "color"> {
	duration?: string;
	loading?: boolean;
}

/** Keeps the poster action identical before and after the rich gallery loads. */
export function GalleryPlayButton({
	duration,
	loading = false,
	disabled,
	className,
	...props
}: GalleryPlayButtonProps) {
	return (
		<Button
			size="xl"
			variant="soft"
			data-press-motion="surface"
			icon={<RiPlayFill className="size-5" />}
			iconPosition="start"
			loading={loading}
			className={cn(
				"portfolio-media-material portfolio-action-link portfolio-gallery-play pointer-events-auto",
				className,
			)}
			disabled={disabled}
			aria-busy={loading || undefined}
			aria-label={duration ? `Play ${duration} video` : "Play video"}
			{...props}
		>
			<span className="portfolio-gallery-play-label">
				<span className="portfolio-gallery-play-action">Play{duration ? " " : null}</span>
				{duration && <span className="portfolio-gallery-play-duration">{duration}</span>}
			</span>
		</Button>
	);
}
