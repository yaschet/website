/**
 * Dialog Component
 *
 * A window overlaid on either the primary window or another dialog window, rendering the content underneath inert.
 */

"use client";

import { XIcon } from "@phosphor-icons/react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as React from "react";
import { cn } from "@/src/lib/utils";

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogClose = DialogPrimitive.Close;
const DialogPortal = DialogPrimitive.Portal;

// ═══════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

const DialogOverlay = React.forwardRef<
	React.ComponentRef<typeof DialogPrimitive.Overlay>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay> & {
		className?: string;
	}
>(({ className, ...props }, ref) => (
	<DialogPrimitive.Overlay
		ref={ref}
		className={cn(
			"fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-surface-950/20 backdrop-blur-sm dark:bg-surface-950/50",
			"data-[state=closed]:animate-out data-[state=open]:animate-in",
			"data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
			className,
		)}
		{...props}
	/>
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
	React.ComponentRef<typeof DialogPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
		className?: string;
	}
>(({ children, className, ...props }, ref) => {
	return (
		<DialogPortal>
			<DialogOverlay className="py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24">
				<DialogPrimitive.Content
					ref={ref}
					className={cn(
						"pointer-events-auto relative z-50 grid w-full max-w-lg gap-4 p-6",
						"border border-border bg-popover shadow-2xl shadow-surface-400 dark:shadow-surface-950/40",
						"rounded-[var(--radius)]",
						"data-[state=closed]:animate-out data-[state=open]:animate-in",
						"data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
						"data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
						"data-[state=closed]:slide-out-to-bottom-[2rem] data-[state=open]:slide-in-from-bottom-[2rem]",
						"duration-200",
						className,
					)}
					{...props}
				>
					{children}
				</DialogPrimitive.Content>
			</DialogOverlay>
		</DialogPortal>
	);
});
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
	<div className={cn("flex flex-col space-y-3 text-center sm:text-left", className)} {...props} />
);
DialogHeader.displayName = "DialogHeader";

/**
 * DialogFooter - Primary action layout block.
 */
function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn(
				"flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
				className,
			)}
			{...props}
		/>
	);
}
DialogFooter.displayName = "DialogFooter";

/**
 * DialogTitle - Contextual title with integrated close orchestration.
 */
const DialogTitle = React.forwardRef<
	React.ComponentRef<typeof DialogPrimitive.Title>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title> & {
		className?: string;
	}
>(({ children, className, ...props }, ref) => (
	<DialogPrimitive.Title
		ref={ref}
		className={cn(
			"flex flex-row items-center justify-between font-semibold text-lg leading-none tracking-tight",
			className,
		)}
		{...props}
	>
		<span>{children}</span>
		<DialogPrimitive.Close
			className={cn(
				"rounded-[var(--radius-xs)]", // Machined precision for small buttons
				"opacity-70 transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none",
			)}
		>
			<XIcon className="size-5" color="currentColor" weight="duotone" />
			<span className="sr-only">Close</span>
		</DialogPrimitive.Close>
	</DialogPrimitive.Title>
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

/**
 * DialogDescription - Supporting contextual information.
 */
const DialogDescription = React.forwardRef<
	React.ComponentRef<typeof DialogPrimitive.Description>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description> & {
		className?: string;
	}
>(({ className, ...props }, ref) => (
	<DialogPrimitive.Description
		ref={ref}
		className={cn("w-full text-muted text-sm", className)}
		{...props}
	/>
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
	Dialog,
	DialogPortal,
	DialogOverlay,
	DialogTrigger,
	DialogClose,
	DialogContent,
	DialogHeader,
	DialogFooter,
	DialogTitle,
	DialogDescription,
};
