/**
 * Skeleton component for loading states.
 *
 * @remarks
 * Supports rectangular, circle, and text variants.
 *
 * @example
 * ```tsx
 * <Skeleton className="h-4 w-[250px]" />
 * ```
 *
 * @public
 */

import * as React from "react";
import { cn } from "@/src/lib/index";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Fixed width override (CSS value) */
	width?: number | string;
	/** Fixed height override (CSS value) */
	height?: number | string;
	/** Geometric variant mapping */
	variant?: "rectangular" | "circle" | "text";
	/** Optional content to overlay on the skeleton */
	children?: React.ReactNode;
	/** Specific styles for the shimmer layer */
	innerClassName?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Skeleton - Structure placeholder.
 */
const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
	(
		{ children, className, height, innerClassName, variant = "rectangular", width, ...props },
		ref,
	) => {
		const baseClasses = cn(
			"relative overflow-hidden bg-surface-2 opacity-100 will-change-transform",
			// Shape
			variant === "circle" ? "rounded-full" : "rounded-[var(--radius)]",
			className,
		);

		const innerClasses = cn(
			"absolute inset-0 bg-linear-to-r from-transparent via-surface-3 to-transparent",
			"animate-[shimmer_2s_infinite]",
			variant === "circle" ? "rounded-full" : "rounded-[var(--radius)]",
			innerClassName,
		);

		return (
			<div ref={ref} aria-busy="true" className={baseClasses} {...props}>
				<div
					className={innerClasses}
					style={{ height: height || "auto", width: width || "100%" }}
				/>
				{children}
			</div>
		);
	},
);

Skeleton.displayName = "Skeleton";

export { Skeleton };
