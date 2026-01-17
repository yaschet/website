/**
 * AlertDialog Component - High-Precision Modal primitive
 *
 * Engineered for critical user interventions with rigid geometric clarity.
 * Part of "The Architecture of the Blade" (0px default radius).
 *
 * Built on Radix UI AlertDialog primitives.
 */

"use client";

import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import * as React from "react";

import { buttonVariants } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

const AlertDialog = AlertDialogPrimitive.Root;
const AlertDialogTrigger = AlertDialogPrimitive.Trigger;
const AlertDialogPortal = AlertDialogPrimitive.Portal;

// ═══════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * AlertDialogOverlay - The dimming backdrop for the modal.
 */
const AlertDialogOverlay = React.forwardRef<
	React.ComponentRef<typeof AlertDialogPrimitive.Overlay>,
	React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
	<AlertDialogPrimitive.Overlay
		ref={ref}
		className={cn(
			"fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-surface-950/20 backdrop-blur-sm",
			"data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=open]:animate-in dark:bg-surface-950/50",
			className,
		)}
		{...props}
	/>
));
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName;

/**
 * AlertDialogContent - The primary modal container.
 * Purges legacy radius-scales for the 0px geometric standard.
 */
const AlertDialogContent = React.forwardRef<
	React.ComponentRef<typeof AlertDialogPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>
>(({ className, ...props }, ref) => (
	<AlertDialogPortal>
		<AlertDialogOverlay className="px-4 py-8">
			<AlertDialogPrimitive.Content
				ref={ref}
				className={cn(
					"relative z-50 grid w-full max-w-lg gap-6 border border-border bg-popover p-6 shadow-xl",
					"rounded-[var(--radius)]", // Geometry: Absolute 0px Default
					"data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-bottom-4 data-[state=open]:slide-in-from-bottom-4 data-[state=closed]:animate-out data-[state=open]:animate-in",
					className,
				)}
				{...props}
			/>
		</AlertDialogOverlay>
	</AlertDialogPortal>
));
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;

/**
 * AlertDialogHeader - Vertical segmentation for the title and description.
 */
const AlertDialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
	<div className={cn("flex flex-col gap-2 text-center sm:text-left", className)} {...props} />
);
AlertDialogHeader.displayName = "AlertDialogHeader";

/**
 * AlertDialogFooter - Interaction targets at the base of the modal.
 */
const AlertDialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn("flex flex-col-reverse gap-3 sm:flex-row sm:justify-end", className)}
		{...props}
	/>
);
AlertDialogFooter.displayName = "AlertDialogFooter";

/**
 * AlertDialogTitle - Primary heading for the alert.
 */
const AlertDialogTitle = React.forwardRef<
	React.ComponentRef<typeof AlertDialogPrimitive.Title>,
	React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
	<AlertDialogPrimitive.Title
		ref={ref}
		className={cn("font-bold text-lg leading-tight tracking-tight", className)}
		{...props}
	/>
));
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName;

/**
 * AlertDialogDescription - Subtext providing critical context.
 */
const AlertDialogDescription = React.forwardRef<
	React.ComponentRef<typeof AlertDialogPrimitive.Description>,
	React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
	<AlertDialogPrimitive.Description
		ref={ref}
		className={cn("text-muted-foreground text-sm leading-relaxed opacity-80", className)}
		{...props}
	/>
));
AlertDialogDescription.displayName = AlertDialogPrimitive.Description.displayName;

/**
 * AlertDialogAction - Primary destructive or confirming action.
 */
const AlertDialogAction = React.forwardRef<
	React.ComponentRef<typeof AlertDialogPrimitive.Action>,
	React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(({ className, ...props }, ref) => (
	<AlertDialogPrimitive.Action
		ref={ref}
		className={cn(buttonVariants({ color: "destructive", variant: "solid" }), className)}
		{...props}
	/>
));
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName;

/**
 * AlertDialogCancel - Safe dismissal action.
 */
const AlertDialogCancel = React.forwardRef<
	React.ComponentRef<typeof AlertDialogPrimitive.Cancel>,
	React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(({ className, ...props }, ref) => (
	<AlertDialogPrimitive.Cancel
		ref={ref}
		className={cn(
			buttonVariants({ color: "default", variant: "soft" }),
			"mt-2 sm:mt-0",
			className,
		)}
		{...props}
	/>
));
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName;

export {
	AlertDialog,
	AlertDialogPortal,
	AlertDialogOverlay,
	AlertDialogTrigger,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogFooter,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogAction,
	AlertDialogCancel,
};
