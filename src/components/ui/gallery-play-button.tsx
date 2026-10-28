"use client";

import { RiPlayLine } from "@remixicon/react";
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
			icon={<RiPlayLine className="size-4" />}
			loading={loading}
			className={cn(
				"portfolio-media-material pointer-events-auto border-surface-700",
				className,
			)}
			disabled={disabled}
			aria-busy={loading || undefined}
			aria-label={duration ? `Play ${duration} video` : "Play video"}
			{...props}
		>
			<span>Play{duration ? " " : null}</span>
			{duration && (
				<>
					<span aria-hidden="true" className="h-4 w-px bg-surface-600" />
					<span className="font-sans text-sm/5 text-surface-300 tabular-nums">
						{duration}
					</span>
				</>
			)}
		</Button>
	);
}
