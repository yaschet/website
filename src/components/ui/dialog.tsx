"use client";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { RiCloseLine } from "@remixicon/react";
import * as React from "react";
import { Button } from "@/src/components/ui/button";
import { OverlayHeading, type OverlayHeadingProps } from "@/src/components/ui/overlay-heading";
import { cn } from "@/src/lib/index";

const DialogMotionContext = React.createContext(false);

function Dialog({ onOpenChange, ...props }: DialogPrimitive.Root.Props) {
	const [keyboard, setKeyboard] = React.useState(false);
	return (
		<DialogMotionContext.Provider value={keyboard}>
			<DialogPrimitive.Root
				data-slot="dialog"
				{...props}
				onOpenChange={(open, details) => {
					setKeyboard(
						details.event.type.startsWith("key") ||
							(details.event.type === "click" &&
								"detail" in details.event &&
								details.event.detail === 0),
					);
					onOpenChange?.(open, details);
				}}
			/>
		</DialogMotionContext.Provider>
	);
}

function DialogTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
	return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({ ...props }: DialogPrimitive.Portal.Props) {
	return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({ ...props }: DialogPrimitive.Close.Props) {
	return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({ className, ...props }: DialogPrimitive.Backdrop.Props) {
	const keyboard = React.useContext(DialogMotionContext);
	return (
		<DialogPrimitive.Backdrop
			data-slot="dialog-overlay"
			data-motion-input={keyboard ? "keyboard" : undefined}
			className={cn(
				"t-modal-backdrop fixed inset-0 isolate z-50 bg-black/10 dark:bg-black/50",
				className,
			)}
			{...props}
		/>
	);
}

function DialogContent({
	className,
	children,
	showCloseButton = true,
	closeDisabled = false,
	size = "default",
	framed = false,
	...props
}: DialogPrimitive.Popup.Props & {
	showCloseButton?: boolean;
	closeDisabled?: boolean;
	size?: "sm" | "default" | "lg";
	framed?: boolean;
}) {
	const keyboard = React.useContext(DialogMotionContext);
	return (
		<DialogPortal>
			<DialogOverlay />
			<DialogPrimitive.Popup
				data-slot="dialog-content"
				data-motion-input={keyboard ? "keyboard" : undefined}
				data-size={size}
				data-framed={framed || undefined}
				data-close-button={showCloseButton ? "true" : undefined}
				className={cn(
					"t-modal cn-modal-target foundation-dialog fixed top-1/2 left-1/2 z-50 grid max-h-[calc(100dvh-2rem)] w-full -translate-x-1/2 -translate-y-1/2 gap-4 overflow-y-auto rounded-none bg-popover p-4 text-[length:var(--foundation-type-body-size)] text-popover-foreground leading-[var(--foundation-type-body-leading)] outline-none",
					className,
				)}
				{...props}
			>
				{children}
				{showCloseButton && (
					<DialogPrimitive.Close
						data-slot="dialog-close"
						disabled={closeDisabled}
						render={
							<Button
								variant="soft"
								color="secondary"
								className="foundation-overlay-close absolute top-4 right-4"
								size="icon"
							/>
						}
					>
						<RiCloseLine />
						<span className="sr-only">Close</span>
					</DialogPrimitive.Close>
				)}
			</DialogPrimitive.Popup>
		</DialogPortal>
	);
}

function DialogHeader({
	className,
	icon,
	iconColor,
	children,
	...props
}: React.ComponentProps<"div"> & OverlayHeadingProps) {
	return (
		<div
			data-slot="dialog-header"
			className={cn("foundation-overlay-header", className)}
			{...props}
		>
			<OverlayHeading icon={icon} iconColor={iconColor}>
				{children}
			</OverlayHeading>
		</div>
	);
}

/** Scrolls only the content of a framed dialog, leaving its controls fixed. */
function DialogBody({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="dialog-body"
			className={cn("foundation-overlay-body", className)}
			{...props}
		/>
	);
}

function DialogFooter({
	className,
	showCloseButton = false,
	children,
	...props
}: React.ComponentProps<"div"> & {
	showCloseButton?: boolean;
}) {
	return (
		<div
			data-slot="dialog-footer"
			className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
			{...props}
		>
			{children}
			{showCloseButton && (
				<DialogPrimitive.Close render={<Button variant="secondary" />}>
					Close
				</DialogPrimitive.Close>
			)}
		</div>
	);
}

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
	return (
		<DialogPrimitive.Title
			data-slot="dialog-title"
			className={cn(
				"cn-font-heading font-semibold text-[length:var(--foundation-type-card-title-size)] leading-[var(--foundation-type-card-title-leading)]",
				className,
			)}
			{...props}
		/>
	);
}

function DialogDescription({ className, ...props }: DialogPrimitive.Description.Props) {
	return (
		<DialogPrimitive.Description
			data-slot="dialog-description"
			className={cn(
				"text-[length:var(--foundation-type-description-size)] text-muted-foreground leading-[var(--foundation-type-description-leading)] *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
				className,
			)}
			{...props}
		/>
	);
}

export {
	Dialog,
	DialogBody,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogOverlay,
	DialogPortal,
	DialogTitle,
	DialogTrigger,
};
