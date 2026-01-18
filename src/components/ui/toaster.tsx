/**
 * Viewport container for stacking and managing Radix Toasts.
 *
 * @remarks
 * Integrated with `useToast` hook for declarative notification management.
 * Follows the geometric standard of the design system.
 *
 * @example
 * ```tsx
 * // In Root Layout
 * <Toaster />
 * ```
 *
 * @public
 */

"use client";

import {
	Toast,
	ToastClose,
	ToastDescription,
	ToastProvider,
	ToastTitle,
	ToastViewport,
} from "@/src/components/ui/toast";
import { useToast } from "@/src/components/ui/use-toast";

export function Toaster() {
	const { toasts } = useToast();

	return (
		<ToastProvider>
			{toasts.map(({ action, description, id, title, ...props }) => (
				<Toast key={id} {...props}>
					<div className="grid gap-1">
						{title && <ToastTitle>{title}</ToastTitle>}
						{description && <ToastDescription>{description}</ToastDescription>}
					</div>
					{action}
					<ToastClose />
				</Toast>
			))}
			<ToastViewport />
		</ToastProvider>
	);
}
