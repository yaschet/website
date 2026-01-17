/**
 * Popover Component
 *
 * Displays rich content in a portal, triggered by a button.
 */

"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/src/lib/utils";

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;
const PopoverAnchor = PopoverPrimitive.Anchor;

// ═══════════════════════════════════════════════════════════════════════════
// VARIANTS
// ═══════════════════════════════════════════════════════════════════════════

const popoverContentVariants = cva(
	[
		"z-50 w-72 border border-border bg-popover text-popover-foreground shadow-lg outline-none",
		"data-[state=closed]:animate-out data-[state=open]:animate-in",
		"data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
		"data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
		"data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
	],
	{
		variants: {
			size: {
				xs: "rounded-[var(--radius-sm)] p-2",
				sm: "rounded-[var(--radius-md)] p-3",
				md: "rounded-[var(--radius)] p-4",
				lg: "rounded-[var(--radius-xl)] p-5",
				xl: "rounded-[var(--radius-xl)] p-6",
			},
		},
		defaultVariants: {
			size: "md",
		},
	},
);

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface PopoverContentProps
	extends React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>,
		VariantProps<typeof popoverContentVariants> {
	/** Alignment with the trigger axis */
	align?: "start" | "center" | "end";
	/** Offset from the trigger edge (px) */
	sideOffset?: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * PopoverContent
 *
 * The primary overlay container.
 */
const PopoverContent = React.forwardRef<
	React.ComponentRef<typeof PopoverPrimitive.Content>,
	PopoverContentProps
>(({ align = "center", className, sideOffset = 4, size = "md", ...props }, ref) => (
	<PopoverPrimitive.Portal>
		<PopoverPrimitive.Content
			ref={ref}
			align={align}
			className={cn(popoverContentVariants({ size }), className)}
			sideOffset={sideOffset}
			{...props}
		/>
	</PopoverPrimitive.Portal>
));

PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
