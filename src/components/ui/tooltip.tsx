/**
 * Tooltip component.
 *
 * @remarks
 * Built on Radix UI's Tooltip primitive.
 *
 * @example
 * ```tsx
 * <Tooltip>
 *   <TooltipTrigger>Hover</TooltipTrigger>
 *   <TooltipContent>Content</TooltipContent>
 * </Tooltip>
 * ```
 *
 * @public
 */

"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import * as React from "react";

import { badgeVariants } from "@/src/components/ui/badge";
import { cn } from "@/src/lib/index";

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;
const TooltipArrow = TooltipPrimitive.Arrow;

// ═══════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

const TooltipContent = React.forwardRef<
	React.ComponentRef<typeof TooltipPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> & {
		className?: string;
		sideOffset?: number;
	}
>(({ className, sideOffset = 8, ...props }, ref) => (
	<TooltipPrimitive.Content
		ref={ref}
		className={cn(
			badgeVariants({ color: "secondary", size: "sm", variant: "soft" }),
			"relative z-50 overflow-hidden border border-border px-2.5 py-1.5 shadow-md",
			"fade-in-0 zoom-in-95 data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 animate-in data-[state=closed]:animate-out",
			"data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
			className,
		)}
		sideOffset={sideOffset}
		{...props}
	/>
));

TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider, TooltipArrow };
