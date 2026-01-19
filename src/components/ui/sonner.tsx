/**
 * Toast notification component.
 *
 * @remarks
 * Wraps the 'sonner' library.
 *
 * @example
 * ```tsx
 * <Toaster />
 * toast.success("Success");
 * ```
 *
 * @public
 */

"use client";

import {
	CheckIcon,
	ExclamationMarkIcon,
	InfoIcon,
	WarningDiamondIcon,
} from "@phosphor-icons/react";
import { useTheme } from "next-themes";
import type { ComponentProps } from "react";
import { Toaster as Sonner } from "sonner";
import Spinner from "@/src/components/ui/spinner";
import { cn } from "@/src/lib/index";

type ToasterProps = ComponentProps<typeof Sonner>;

function Toaster({ ...props }: ToasterProps) {
	const { theme = "system" } = useTheme();

	return (
		<Sonner
			className={cn("toaster group")}
			icons={{
				error: (
					<WarningDiamondIcon
						className="size-5 text-destructive"
						color="currentColor"
						weight="regular"
					/>
				),
				info: (
					<InfoIcon className="size-5 text-info" color="currentColor" weight="regular" />
				),
				loading: <Spinner className="size-5 text-surface-500" weight="regular" />, // Match size (20px) and Weight
				success: (
					<CheckIcon
						className="size-5 text-success"
						color="currentColor"
						weight="regular"
					/>
				),
				warning: (
					<ExclamationMarkIcon
						className="size-5 text-warning"
						color="currentColor"
						weight="regular"
					/>
				),
			}}
			theme={theme as ToasterProps["theme"]}
			position="bottom-right"
			toastOptions={{
				unstyled: true,
				classNames: {
					toast: cn(
						"group grid w-full grid-cols-[auto_1fr_auto] items-start gap-4 p-4", // CSS Grid for perfect alignment
						"bg-surface-0 dark:bg-surface-950",
						"border border-surface-200 dark:border-surface-800",
						"rounded-none shadow-none", // Explicit 0px, No Shadow
					),
					title: "text-surface-900 dark:text-surface-50 font-bold text-xs uppercase tracking-wider col-start-2 row-start-1 leading-5", // Leading-5 aligns with 20px icon
					description:
						"text-surface-500 dark:text-surface-400 text-xs font-mono mt-1 col-start-2 row-start-2",
					actionButton: cn(
						"col-start-3 row-span-2 self-center", // Align action button to center right
						"bg-surface-900 text-surface-50 dark:bg-surface-50 dark:text-surface-900",
						"shrink-0 rounded-none px-3 py-1.5 font-bold text-xs",
						"transition-transform active:scale-95", // PHYSICS: Mimic button.tsx
					),
					cancelButton: cn(
						"col-start-3 row-span-2 self-center",
						"bg-surface-100 text-surface-900 dark:bg-surface-800 dark:text-surface-50",
						"shrink-0 rounded-none px-3 py-1.5 font-bold text-xs",
						"transition-transform hover:bg-surface-200 active:scale-95 dark:hover:bg-surface-700", // PHYSICS
					),
					closeButton: cn(
						"absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 transform p-1 opacity-0 group-hover:opacity-100", // Hidden until hover, Swiss precision
						"text-surface-400 hover:text-surface-900 dark:text-surface-500 dark:hover:text-surface-50",
						"border border-surface-200 bg-surface-0 dark:border-surface-800 dark:bg-surface-950",
						"rounded-none transition-all duration-200",
					),
					// Semantic borders (Left accent)
					success: "border-l-2 !border-l-success",
					error: "border-l-2 !border-l-destructive",
					warning: "border-l-2 !border-l-warning",
					info: "border-l-2 !border-l-info",
				},
				duration: 5000,
			}}
			{...props}
		/>
	);
}

export { Toaster };
