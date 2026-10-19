import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "@/src/lib/index";

const badgeVariants = cva(
	[
		"inline-flex items-center justify-center gap-[calc(var(--portfolio-control-gap)*0.75)]",
		"select-none whitespace-nowrap",
		"portfolio-chip-label",
		"transition-[color,border-color,background-color] duration-150 ease-out",
		"cursor-default",
	],
	{
		variants: {
			variant: {
				solid: "border-transparent border-y",
				soft: "border-y bg-transparent",
				outlined: "border-y bg-transparent",
				plain: "border-transparent border-y bg-transparent",
			},
			color: {
				default: "",
				primary: "",
				secondary: "",
				accent: "",
				success: "",
				warning: "",
				info: "",
				destructive: "",
			},
			size: {
				sm: "min-h-[var(--portfolio-control-compact)] px-[calc(var(--portfolio-control-pad-compact)*0.7)]",
				md: "min-h-[var(--portfolio-control-compact)] px-[calc(var(--portfolio-control-pad-compact)*0.7)]",
				lg: "min-h-[var(--portfolio-control-default)] px-[var(--portfolio-control-pad-compact)]",
			},
			shape: {
				default: "rounded-none",
				sm: "rounded-sm",
				md: "rounded-md",
				full: "rounded-full",
			},
			interactive: {
				true: "cursor-pointer hover:border-current active:border-current",
				false: "",
			},
		},
		compoundVariants: [
			{
				variant: "solid",
				color: "default",
				class: "bg-surface-900 text-surface-50 dark:bg-surface-100 dark:text-surface-950",
			},
			{
				variant: "solid",
				color: "primary",
				class: "bg-surface-900 text-surface-50 dark:bg-surface-100 dark:text-surface-950",
			},
			{
				variant: "solid",
				color: "secondary",
				class: "bg-surface-700 text-surface-50 dark:bg-surface-300 dark:text-surface-950",
			},
			{
				variant: "solid",
				color: "accent",
				class: "bg-accent-700 text-accent-50 dark:bg-accent-300 dark:text-accent-950",
			},
			{
				variant: "solid",
				color: "success",
				class: "bg-success-700 text-success-50 dark:bg-success-300 dark:text-success-950",
			},
			{
				variant: "solid",
				color: "warning",
				class: "bg-warning-700 text-warning-50 dark:bg-warning-300 dark:text-warning-950",
			},
			{
				variant: "solid",
				color: "info",
				class: "bg-info-700 text-info-50 dark:bg-info-300 dark:text-info-950",
			},
			{
				variant: "solid",
				color: "destructive",
				class: "bg-destructive-700 text-destructive-50 dark:bg-destructive-300 dark:text-destructive-950",
			},

			{
				variant: "soft",
				color: "default",
				class: "border-surface-200 bg-surface-100/45 text-surface-700 dark:border-surface-700 dark:bg-surface-900/45 dark:text-surface-300",
			},
			{
				variant: "soft",
				color: "primary",
				class: "border-surface-200 bg-surface-100/45 text-surface-800 dark:border-surface-700 dark:bg-surface-900/45 dark:text-surface-200",
			},
			{
				variant: "soft",
				color: "secondary",
				class: "border-surface-200 bg-surface-100/45 text-surface-700 dark:border-surface-700 dark:bg-surface-900/45 dark:text-surface-300",
			},
			{
				variant: "soft",
				color: "accent",
				class: "border-accent-200/70 bg-accent-50/35 text-accent-700 dark:border-accent-800/70 dark:bg-accent-950/20 dark:text-accent-300",
			},
			{
				variant: "soft",
				color: "success",
				class: "border-success-200/70 bg-success-50/35 text-success-700 dark:border-success-800/70 dark:bg-success-950/20 dark:text-success-300",
			},
			{
				variant: "soft",
				color: "warning",
				class: "border-warning-200/70 bg-warning-50/35 text-warning-700 dark:border-warning-800/70 dark:bg-warning-950/20 dark:text-warning-300",
			},
			{
				variant: "soft",
				color: "info",
				class: "border-info-200/70 bg-info-50/35 text-info-700 dark:border-info-800/70 dark:bg-info-950/20 dark:text-info-300",
			},
			{
				variant: "soft",
				color: "destructive",
				class: "border-destructive-200/70 bg-destructive-50/35 text-destructive-700 dark:border-destructive-800/70 dark:bg-destructive-950/20 dark:text-destructive-300",
			},

			{
				variant: "outlined",
				color: "default",
				class: "border-surface-300/60 text-surface-700 dark:border-surface-700/70 dark:text-surface-300",
			},
			{
				variant: "outlined",
				color: "primary",
				class: "border-surface-300/60 text-surface-800 dark:border-surface-700/70 dark:text-surface-200",
			},
			{
				variant: "outlined",
				color: "secondary",
				class: "border-surface-300/60 text-surface-700 dark:border-surface-700/70 dark:text-surface-300",
			},
			{
				variant: "outlined",
				color: "accent",
				class: "border-accent-300/70 text-accent-700 dark:border-accent-700/70 dark:text-accent-300",
			},
			{
				variant: "outlined",
				color: "success",
				class: "border-success-300/70 text-success-700 dark:border-success-700/70 dark:text-success-300",
			},
			{
				variant: "outlined",
				color: "warning",
				class: "border-warning-300/70 text-warning-700 dark:border-warning-700/70 dark:text-warning-300",
			},
			{
				variant: "outlined",
				color: "info",
				class: "border-info-300/70 text-info-700 dark:border-info-700/70 dark:text-info-300",
			},
			{
				variant: "outlined",
				color: "destructive",
				class: "border-destructive-300/70 text-destructive-700 dark:border-destructive-700/70 dark:text-destructive-300",
			},

			{
				variant: "plain",
				color: "default",
				class: "text-surface-600 dark:text-surface-400",
			},
			{
				variant: "plain",
				color: "primary",
				class: "text-surface-700 dark:text-surface-300",
			},
			{
				variant: "plain",
				color: "secondary",
				class: "text-surface-600 dark:text-surface-400",
			},
			{
				variant: "plain",
				color: "accent",
				class: "text-accent-700 dark:text-accent-300",
			},
			{
				variant: "plain",
				color: "success",
				class: "text-success-700 dark:text-success-300",
			},
			{
				variant: "plain",
				color: "warning",
				class: "text-warning-700 dark:text-warning-300",
			},
			{
				variant: "plain",
				color: "info",
				class: "text-info-700 dark:text-info-300",
			},
			{
				variant: "plain",
				color: "destructive",
				class: "text-destructive-700 dark:text-destructive-300",
			},
		],
		defaultVariants: {
			variant: "solid",
			color: "default",
			size: "md",
			shape: "default",
			interactive: false,
		},
	},
);

/** Badge appearance and native span attributes, with semantic color ownership. */
export interface BadgeProps
	extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color">,
		VariantProps<typeof badgeVariants> {
	/** Children of the badge */
	children?: React.ReactNode;
}

/** Renders a compact semantic label; interactive styling does not add button semantics. */
function Badge({ className, variant, color, size, shape, interactive, ...props }: BadgeProps) {
	return (
		<span
			className={cn(badgeVariants({ variant, color, size, shape, interactive, className }))}
			{...props}
		/>
	);
}

export { Badge, badgeVariants };
