"use client";

import { cn } from "@library/utils";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cva } from "class-variance-authority";
import * as React from "react";

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverAnchor = PopoverPrimitive.Anchor;

const popoverContentVariants = cva(
	"data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 rounded-3xl border border-border bg-popover text-popover-foreground shadow-lg outline-none data-[state=closed]:animate-out data-[state=open]:animate-in",
	{
		variants: {
			size: {
				xs: "rounded-xl p-2",
				sm: "rounded-2xl p-3",
				md: "rounded-3xl p-4",
				lg: "rounded-[2rem] p-5",
				xl: "rounded-[2.5rem] p-6",
			},
		},
		defaultVariants: {
			size: "md",
		},
	},
);

const PopoverContent = React.forwardRef<
	React.ComponentRef<typeof PopoverPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> & {
		className?: string;
		align?: "start" | "center" | "end";
		sideOffset?: number;
		size?: "xs" | "sm" | "md" | "lg" | "xl";
	}
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
