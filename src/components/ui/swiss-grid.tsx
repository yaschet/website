import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * SwissGridBox
 *
 * Server-first structural wrapper for the portfolio's boxed layout.
 * The dashed perimeter is pure CSS so it exists on first paint.
 */
export function SwissGridBox({ children, className }: { children: ReactNode; className?: string }) {
	return (
		<div
			className={cn(
				"portfolio-grid-frame relative w-full overflow-hidden",
				"bg-white transition-colors dark:bg-surface-900/80",
				className,
			)}
		>
			{children}
		</div>
	);
}

/**
 * SwissGridRow
 *
 * Structural row inside a SwissGridBox. Row dividers are handled in CSS by
 * sibling position instead of client-side measurement.
 */
export function SwissGridRow({ children, className }: { children: ReactNode; className?: string }) {
	return <div className={cn("portfolio-grid-row relative", className)}>{children}</div>;
}
