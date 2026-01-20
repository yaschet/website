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
import { Spinner } from "@/src/components/ui/spinner";
import { cn } from "@/src/lib/index";

type ToasterProps = ComponentProps<typeof Sonner>;

const IconContainer = ({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) => {
	return (
		<div
			className={cn(
				"flex size-8 shrink-0 items-center justify-center border border-surface-200 bg-surface-50 transition-colors dark:border-surface-800 dark:bg-surface-900",
				className,
			)}
		>
			{children}
		</div>
	);
};

function Toaster({ ...props }: ToasterProps) {
	const { theme = "system" } = useTheme();

	return (
		<Sonner
			className={cn("toaster group")}
			icons={{
				error: (
					<IconContainer>
						<WarningDiamondIcon
							className="size-5 text-destructive"
							color="currentColor"
							weight="regular"
						/>
					</IconContainer>
				),
				info: (
					<IconContainer>
						<InfoIcon
							className="size-5 text-info"
							color="currentColor"
							weight="regular"
						/>
					</IconContainer>
				),
				loading: (
					<IconContainer className="relative left-5">
						<Spinner className="size-5 shrink-0 text-surface-500" size="sm" />
					</IconContainer>
				),
				success: (
					<IconContainer>
						<CheckIcon
							className="size-5 text-success"
							color="currentColor"
							weight="regular"
						/>
					</IconContainer>
				),
				warning: (
					<IconContainer>
						<ExclamationMarkIcon
							className="size-5 text-warning"
							color="currentColor"
							weight="regular"
						/>
					</IconContainer>
				),
			}}
			theme={theme as ToasterProps["theme"]}
			position="bottom-right"
			toastOptions={{
				unstyled: true,
				classNames: {
					toast: cn(
						"group grid w-full grid-cols-[auto_1fr_auto] items-start gap-x-4 p-4",
						"bg-surface-0 dark:bg-surface-950",
						"border border-surface-200 dark:border-surface-800",
						"rounded-none shadow-none",
						"[&>[data-icon]]:col-start-1 [&>[data-icon]]:mt-0.5",
						"[&>[data-loading-icon]]:col-start-1 [&>[data-loading-icon]]:mt-0.5 [&>[data-loading-icon]]:shrink-0",
						"[&>[data-content]]:col-start-2 [&>[data-content]]:flex [&>[data-content]]:flex-col [&>[data-content]]:gap-1",
						"[&>[data-content]]:min-h-[2rem] [&>[data-content]]:justify-center",
						"[&>[data-button]]:col-start-3 [&>[data-button]]:self-center",
						"[&>[data-cancel]]:col-start-3 [&>[data-cancel]]:self-center",
					),
					title: "text-surface-900 dark:text-surface-50 font-bold text-xs uppercase tracking-wider leading-none",
					description:
						"text-surface-500 dark:text-surface-400 text-xs font-mono leading-normal",
					actionButton: cn(
						"shrink-0 rounded-none px-3 py-1.5 font-bold text-xs",
						"bg-surface-900 text-surface-50 dark:bg-surface-50 dark:text-surface-900",
						"transition-transform active:scale-95",
					),
					cancelButton: cn(
						"shrink-0 rounded-none px-3 py-1.5 font-bold text-xs",
						"bg-surface-100 text-surface-900 dark:bg-surface-800 dark:text-surface-50",
						"transition-transform hover:bg-surface-200 active:scale-95 dark:hover:bg-surface-700",
					),
					closeButton: cn(
						"absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 transform p-1 opacity-0 group-hover:opacity-100",
						"text-surface-400 hover:text-surface-900 dark:text-surface-500 dark:hover:text-surface-50",
						"border border-surface-200 bg-surface-0 dark:border-surface-800 dark:bg-surface-950",
						"rounded-none transition-all duration-200",
					),
					success: "!border-l-success",
					error: "!border-l-destructive",
					warning: "!border-l-warning",
					info: "!border-l-info",
				},
				duration: 5000,
			}}
			{...props}
		/>
	);
}

export { Toaster };
