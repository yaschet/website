"use client";
import { Toast as ToastPrimitive } from "@base-ui/react/toast";
import {
	RiCheckboxCircleLine,
	RiCloseCircleLine,
	RiCloseLine,
	RiErrorWarningLine,
	RiInformationLine,
	RiLoaderLine,
} from "@remixicon/react";
import * as React from "react";
import { Button } from "@/src/components/ui/button";
import { IconChamber } from "@/src/components/ui/icon-chamber";
import { cn } from "@/src/lib/index";

const toast = ToastPrimitive.createToastManager();

function ToastProvider({ ...props }: ToastPrimitive.Provider.Props) {
	return <ToastPrimitive.Provider {...props} />;
}

function ToastPortal({ ...props }: ToastPrimitive.Portal.Props) {
	return <ToastPrimitive.Portal data-slot="toast-portal" {...props} />;
}

function ToastViewport({ className, ...props }: ToastPrimitive.Viewport.Props) {
	return (
		<ToastPrimitive.Viewport
			data-slot="toast-viewport"
			className={cn(
				"pointer-events-none fixed inset-x-4 bottom-4 z-50 mx-auto w-auto max-w-sm outline-none sm:right-4 sm:left-auto sm:mx-0 sm:w-full",
				className,
			)}
			{...props}
		/>
	);
}

function Toast({
	className,
	onKeyDownCapture,
	onPointerDownCapture,
	...props
}: ToastPrimitive.Root.Props) {
	const [keyboard, setKeyboard] = React.useState(false);
	return (
		<ToastPrimitive.Root
			data-slot="toast"
			data-motion-input={keyboard ? "keyboard" : undefined}
			onKeyDownCapture={(event) => {
				setKeyboard(true);
				onKeyDownCapture?.(event);
			}}
			onPointerDownCapture={(event) => {
				setKeyboard(false);
				onPointerDownCapture?.(event);
			}}
			className={cn(
				"t-toast group/toast pointer-events-auto absolute right-0 bottom-0 z-[calc(1000-var(--toast-index))] w-full origin-bottom select-none rounded-none border bg-popover text-popover-foreground shadow-lg outline-none will-change-transform focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
				"[--gap:0.75rem] [--height:var(--toast-frontmost-height,var(--toast-height))] [--offset-y:calc(var(--toast-offset-y)*-1+calc(var(--toast-index)*var(--gap)*-1)+var(--toast-swipe-movement-y))] [--peek:0.75rem] [--scale:calc(max(0,1-(var(--toast-index)*0.1)))] [--shrink:calc(1-var(--scale))]",
				"h-(--height) [transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--peek))-(var(--shrink)*var(--height))))_scale(var(--scale))]",
				"after:absolute after:top-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-['']",
				"data-expanded:h-(--toast-height) data-expanded:[transform:translateX(var(--toast-swipe-movement-x))_translateY(var(--offset-y))]",
				"data-limited:opacity-0 data-starting-style:[transform:translateY(16px)]",
				"[&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(16px)]",
				"data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))]",
				"data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]",
				"data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]",
				"data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))]",
				"data-expanded:data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))]",
				"data-expanded:data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]",
				"data-expanded:data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]",
				"data-expanded:data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))]",
				className,
			)}
			{...props}
		/>
	);
}

function ToastContent({ className, ...props }: ToastPrimitive.Content.Props) {
	return (
		<ToastPrimitive.Content
			data-slot="toast-content"
			className={cn(
				"h-full overflow-hidden transition-opacity duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] data-behind:opacity-0 data-expanded:opacity-100",
				className,
			)}
			{...props}
		/>
	);
}

function ToastTitle({ className, ...props }: ToastPrimitive.Title.Props) {
	return (
		<ToastPrimitive.Title
			data-slot="toast-title"
			className={cn("toast-title", className)}
			{...props}
		/>
	);
}

function ToastDescription({ className, ...props }: ToastPrimitive.Description.Props) {
	return (
		<ToastPrimitive.Description
			data-slot="toast-description"
			className={cn("toast-description", className)}
			{...props}
		/>
	);
}

function ToastAction({
	className,
	render = <Button variant="outline" size="sm" />,
	...props
}: ToastPrimitive.Action.Props) {
	return (
		<ToastPrimitive.Action
			data-slot="toast-action"
			render={render}
			className={cn("shrink-0", className)}
			{...props}
		/>
	);
}

function ToastClose({
	className,
	children,
	render = <Button variant="soft" color="secondary" size="icon" />,
	...props
}: ToastPrimitive.Close.Props) {
	return (
		<ToastPrimitive.Close
			data-slot="toast-close"
			aria-label="Close toast"
			render={render}
			className={cn("foundation-overlay-close", className)}
			{...props}
		>
			{children ?? <RiCloseLine aria-hidden="true" />}
		</ToastPrimitive.Close>
	);
}

function ToastIcon({ type }: { type: string | undefined }) {
	let icon: React.ReactNode = <RiInformationLine aria-hidden="true" />;

	if (type === "success") {
		icon = <RiCheckboxCircleLine aria-hidden="true" />;
	}

	if (type === "info") {
		icon = <RiInformationLine aria-hidden="true" />;
	}

	if (type === "warning") {
		icon = <RiErrorWarningLine aria-hidden="true" />;
	}

	if (type === "error") {
		icon = <RiCloseCircleLine aria-hidden="true" />;
	}

	if (type === "loading") {
		icon = <RiLoaderLine className="animate-spin" aria-hidden="true" />;
	}

	return (
		<IconChamber
			size="default"
			className="foundation-overlay-icon"
			color={
				type === "error"
					? "destructive"
					: type === "success" || type === "warning" || type === "info"
						? type
						: "secondary"
			}
			aria-hidden="true"
		>
			<span data-slot="toast-icon" className="inline-flex size-4 [&_svg]:size-4">
				{icon}
			</span>
		</IconChamber>
	);
}

function ToastList() {
	const { toasts } = ToastPrimitive.useToastManager();

	return toasts.map((toastItem) => (
		<Toast key={toastItem.id} toast={toastItem}>
			<ToastContent>
				<div className="foundation-notification-heading">
					<ToastIcon type={toastItem.type} />
					<div className="foundation-overlay-heading-copy toast-copy">
						{toastItem.title && <ToastTitle />}
						{toastItem.description && <ToastDescription />}
					</div>
					<ToastClose />
					{toastItem.actionProps && <ToastAction className="toast-action" />}
				</div>
			</ToastContent>
		</Toast>
	));
}

type ToasterProps = ToastPrimitive.Provider.Props & {
	/** Optional portal host for an isolated preview or an owning overlay. */
	container?: ToastPrimitive.Portal.Props["container"];
};

function Toaster({ children, toastManager = toast, container, ...props }: ToasterProps) {
	return (
		<ToastProvider toastManager={toastManager} {...props}>
			{children}
			<ToastPortal container={container}>
				<ToastViewport>
					<ToastList />
				</ToastViewport>
			</ToastPortal>
		</ToastProvider>
	);
}

const createToastManager = ToastPrimitive.createToastManager;
const useToastManager = ToastPrimitive.useToastManager;

export {
	createToastManager,
	Toast,
	ToastAction,
	ToastClose,
	ToastContent,
	ToastDescription,
	Toaster,
	ToastPortal,
	ToastProvider,
	ToastTitle,
	ToastViewport,
	toast,
	useToastManager,
};
