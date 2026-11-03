"use client";

import { RiPlayFill } from "@remixicon/react";
import type { ComponentPropsWithoutRef } from "react";
import { Button } from "@/src/components/ui/button";
import { StateSwap } from "@/src/components/ui/state-swap";
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
			icon={<RiPlayFill className="portfolio-gallery-play-glyph size-5" />}
			iconPosition="start"
			loading={loading}
			className={cn(
				"portfolio-media-material portfolio-action-link portfolio-gallery-play pointer-events-auto",
				className,
			)}
			disabled={disabled}
			aria-busy={loading || undefined}
			aria-label={
				loading ? "Loading video" : duration ? `Play ${duration} video` : "Play video"
			}
			{...props}
		>
			<span className="portfolio-gallery-play-label">
				<StateSwap
					kind="text"
					sizing="content"
					value={loading ? "loading" : "idle"}
					items={{
						idle: (
							<span className="inline-flex items-center gap-2">
								<span className="portfolio-gallery-play-action">
									Play{duration ? " " : null}
								</span>
								{duration && (
									<span className="portfolio-gallery-play-duration">
										{duration}
									</span>
								)}
							</span>
						),
						loading: "Loading…",
					}}
				/>
			</span>
		</Button>
	);
}
