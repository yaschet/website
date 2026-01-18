"use client";

import { cn } from "@/src/lib/utils";
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
						weight="duotone"
					/>
				),
				info: (
					<InfoIcon className="size-5 text-info" color="currentColor" weight="duotone" />
				),
				loading: <Spinner size="xs" />,
				success: (
					<CheckIcon
						className="size-5 text-success"
						color="currentColor"
						weight="duotone"
					/>
				),
				warning: (
					<ExclamationMarkIcon
						className="size-5 text-warning"
						color="currentColor"
						weight="duotone"
					/>
				),
			}}
			theme={theme as ToasterProps["theme"]}
			toastOptions={{
				className: cn(
					"rounded-none border-surface-200 bg-white text-surface-900 shadow-xl dark:border-surface-800 dark:bg-surface-950 dark:text-surface-50",
					"font-sans antialiased",
				),
				classNames: {
					toast: "group-[.toaster]:flex group-[.toaster]:items-center group-[.toaster]:gap-4 group-[.toaster]:px-6 group-[.toaster]:py-4",
					title: "group-[.toast]:font-bold group-[.toast]:text-xs group-[.toast]:uppercase group-[.toast]:tracking-[0.1em]",
					description:
						"group-[.toast]:text-surface-500 group-[.toast]:dark:text-surface-400 group-[.toast]:text-xs group-[.toast]:font-medium",
					closeButton: cn(
						"text-surface-600 hover:text-foreground dark:text-surface-400 dark:hover:text-foreground",
						"bg-surface-100 hover:bg-surface-200 dark:bg-surface-800 dark:hover:bg-surface-700 transition-colors",
						"border border-surface-200 dark:border-surface-800",
						"rounded-none",
					),
					success:
						"group-[.toaster]:border-success/30 group-[.toaster]:bg-success-50/50 dark:group-[.toaster]:bg-success-950/20",
					error: "group-[.toaster]:border-destructive/30 group-[.toaster]:bg-destructive-50/50 dark:group-[.toaster]:bg-destructive-950/20",
				},
				duration: 4000,
			}}
			{...props}
		/>
	);
}

export { Toaster };
