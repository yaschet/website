/**
 * Toast component.
 *
 * @remarks
 * Built on Radix UI's Toast primitive.
 *
 * @example
 * ```tsx
 * <Toast variant="success">
 *   <ToastTitle>Title</ToastTitle>
 *   <ToastDescription>Description</ToastDescription>
 * </Toast>
 * ```
 *
 * @public
 */

"use client";

import { Cross2Icon } from "@radix-ui/react-icons";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/src/lib/index";

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

const ToastProvider = ToastPrimitives.Provider;

// ═══════════════════════════════════════════════════════════════════════════
// VARIANTS
// ═══════════════════════════════════════════════════════════════════════════

const toastVariants = cva(
	[
		"group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden border p-4 pr-6 shadow-lg transition-all",
		"rounded-[var(--radius)]",
		"data-[state=closed]:animate-out data-[state=open]:animate-in",
		"data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
		"data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=end]:animate-out data-[swipe=move]:transition-none",
	],
	{
		variants: {
			variant: {
				default: "border-border bg-surface-1 text-foreground",
				destructive:
					"destructive group border-destructive bg-destructive text-destructive-foreground",
				info: "info group border-info bg-info text-info-foreground",
				success: "success group border-success bg-success text-success-foreground",
				warning: "warning group border-warning bg-warning text-warning-foreground",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

// ═══════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * ToastViewport - Fixed container.
 */
const ToastViewport = React.forwardRef<
	React.ComponentRef<typeof ToastPrimitives.Viewport>,
	React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport> & {
		className?: string;
	}
>(({ className, ...props }, ref) => (
	<ToastPrimitives.Viewport
		ref={ref}
		className={cn(
			"fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:top-auto sm:right-0 sm:bottom-0 sm:flex-col md:max-w-[420px]",
			className,
		)}
		{...props}
	/>
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

/**
 * Toast - Notification root.
 */
const Toast = React.forwardRef<
	React.ComponentRef<typeof ToastPrimitives.Root>,
	React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
		VariantProps<typeof toastVariants> & { className?: string }
>(({ className, variant, ...props }, ref) => {
	return (
		<ToastPrimitives.Root
			ref={ref}
			className={cn(toastVariants({ variant }), className)}
			{...props}
		/>
	);
});
Toast.displayName = ToastPrimitives.Root.displayName;

/**
 * ToastAction - Action button.
 */
const ToastAction = React.forwardRef<
	React.ComponentRef<typeof ToastPrimitives.Action>,
	React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action> & {
		className?: string;
	}
>(({ className, ...props }, ref) => (
	<ToastPrimitives.Action
		ref={ref}
		className={cn(
			"inline-flex h-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border bg-transparent px-3 font-medium text-sm transition-colors hover:bg-secondary-100 focus:outline-none focus:ring-1 focus:ring-ring disabled:pointer-events-none disabled:opacity-50",
			"group-[.destructive]:border-muted/40 group-[.destructive]:focus:ring-destructive group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground",
			"dark:hover:bg-secondary-900",
			className,
		)}
		{...props}
	/>
));
ToastAction.displayName = ToastPrimitives.Action.displayName;

/**
 * ToastClose - Close button.
 */
const ToastClose = React.forwardRef<
	React.ComponentRef<typeof ToastPrimitives.Close>,
	React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close> & {
		className?: string;
	}
>(({ className, ...props }, ref) => (
	<ToastPrimitives.Close
		ref={ref}
		className={cn(
			"absolute top-1 right-1 rounded-[var(--radius-xs)] p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-1 group-hover:opacity-100",
			"group-[.destructive]:text-secondary-300 group-[.destructive]:focus:ring-secondary-400 group-[.destructive]:focus:ring-offset-secondary-600 group-[.destructive]:hover:text-secondary-50",
			className,
		)}
		toast-close=""
		{...props}
	>
		<Cross2Icon className="size-4" />
	</ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

/**
 * ToastTitle - Notification heading.
 */
const ToastTitle = React.forwardRef<
	React.ComponentRef<typeof ToastPrimitives.Title>,
	React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title> & {
		className?: string;
	}
>(({ className, ...props }, ref) => (
	<ToastPrimitives.Title
		ref={ref}
		className={cn("font-bold text-sm tracking-tight [&+div]:text-xs", className)}
		{...props}
	/>
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

/**
 * ToastDescription - Notification content.
 */
const ToastDescription = React.forwardRef<
	React.ComponentRef<typeof ToastPrimitives.Description>,
	React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description> & {
		className?: string;
	}
>(({ className, ...props }, ref) => (
	<ToastPrimitives.Description
		ref={ref}
		className={cn("text-xs leading-relaxed opacity-90", className)}
		{...props}
	/>
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>;
type ToastActionElement = React.ReactElement<typeof ToastAction>;

export {
	type ToastProps,
	type ToastActionElement,
	ToastProvider,
	ToastViewport,
	Toast,
	ToastTitle,
	ToastDescription,
	ToastClose,
	ToastAction,
};
