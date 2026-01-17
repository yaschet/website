/**
 * VirtualizedScrollArea Component - High-Precision Scrolling Module
 *
 * Engineered to support high-performance list virtualization (e.g., TanStack Virtual).
 * Forwards refs to the Viewport element for accurate positional measurement.
 *
 * Part of "The Architecture of the Blade" (0px default radius).
 * Built on Radix UI ScrollArea primitives.
 */

"use client";

import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import * as React from "react";
import { cn } from "@/src/lib/utils";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface VirtualizedScrollAreaProps
	extends React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> {
	/** Scrolling directionality */
	orientation?: "vertical" | "horizontal" | "both";
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * VirtualizedScrollArea - The structural scrolling container.
 * Inherits the 0px geometric standard from its parent context.
 */
const VirtualizedScrollArea = React.forwardRef<
	React.ComponentRef<typeof ScrollAreaPrimitive.Viewport>,
	VirtualizedScrollAreaProps
>(({ children, className, orientation = "vertical", ...props }, ref) => (
	<ScrollAreaPrimitive.Root className={cn("relative overflow-hidden", className)} {...props}>
		<ScrollAreaPrimitive.Viewport ref={ref} className="size-full rounded-[inherit]">
			{children}
		</ScrollAreaPrimitive.Viewport>
		{orientation !== "horizontal" && <ScrollBar orientation="vertical" />}
		{orientation !== "vertical" && <ScrollBar orientation="horizontal" />}
		<ScrollAreaPrimitive.Corner />
	</ScrollAreaPrimitive.Root>
));

VirtualizedScrollArea.displayName = "VirtualizedScrollArea";

/**
 * ScrollBar - The geometric track and thumb orchestrator.
 */
const ScrollBar = React.forwardRef<
	React.ComponentRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
	React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
	<ScrollAreaPrimitive.ScrollAreaScrollbar
		ref={ref}
		className={cn(
			"flex touch-none select-none transition-colors",
			orientation === "vertical" && "h-full w-2 border-l border-l-transparent p-[1px]",
			orientation === "horizontal" && "h-2 flex-col border-t border-t-transparent p-[1px]",
			className,
		)}
		orientation={orientation}
		{...props}
	>
		<ScrollAreaPrimitive.ScrollAreaThumb
			className={cn(
				"relative flex-1 bg-border/60 transition-colors hover:bg-border",
				"rounded-none", // Architecture of the Blade: Rigid 90-degree scroll thumbs
			)}
		/>
	</ScrollAreaPrimitive.ScrollAreaScrollbar>
));

ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

export { VirtualizedScrollArea, ScrollBar };
