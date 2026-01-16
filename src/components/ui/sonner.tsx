"use client";

import { cn } from "@library/utils";
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
				className: cn("rounded-xl bg-surface-2 shadow-2xl"),
				classNames: {
					closeButton: cn(
						"text-surface-600 hover:text-foreground dark:text-surface-400 dark:hover:text-foreground",
						"bg-surface-2 hover:bg-surface-3 dark:hover:bg-surface-3",
						"border-surface-3 hover:border-surface-3 dark:border-surface-3 dark:hover:border-surface-3",
						"rounded-full",
					),
				},
				duration: 3000,
			}}
			{...props}
		/>
	);
}

export { Toaster };
