import type { ReactNode } from "react";
import { cn } from "@/src/lib/index";

export type ReelDirection = "right" | "left" | "up-right" | "down";

/** Reels inside a `data-reel-trigger` control without changing its glyph chamber or name. */
export function ReelIcon({
	children,
	direction = "right",
	blur = true,
	className,
}: {
	children: ReactNode;
	direction?: ReelDirection;
	blur?: boolean;
	className?: string;
}) {
	return (
		<span
			className={cn("portfolio-reel-icon", className)}
			data-direction={direction}
			data-blur={blur || undefined}
			aria-hidden="true"
		>
			<span data-reel-out="">{children}</span>
			<span data-reel-in="">{children}</span>
		</span>
	);
}
