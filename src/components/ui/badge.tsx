import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "@/src/lib/index";

const badgeVariants = cva(
	[
		"inline-flex items-center justify-center gap-[var(--portfolio-control-gap)]",
		"select-none whitespace-nowrap",
		"portfolio-chip-label",
		"transform-gpu transition-all duration-200 ease-out",
		"cursor-default",
	],
	{
		variants: {
			variant: {
				solid: "border border-transparent",
				soft: "border",
				outlined: "border bg-transparent",
				plain: "border border-transparent bg-transparent",
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
				sm: "min-h-[var(--portfolio-control-compact)] px-[var(--portfolio-control-pad-compact)]",
				md: "min-h-[var(--portfolio-control-compact)] px-[var(--portfolio-control-pad-compact)]",
				lg: "min-h-[var(--portfolio-control-default)] px-[var(--portfolio-control-pad-default)]",
			},
			shape: {
				default: "rounded-none",
				sm: "rounded-sm",
				md: "rounded-md",
				full: "rounded-full",
			},
			interactive: {
				true: "cursor-pointer hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-95 active:shadow-none",
				false: "",
			},
		},
		compoundVariants: [
			{
				variant: "solid",
				color: "default",
				class: "bg-surface-900 text-surface-50 hover:bg-surface-800 dark:bg-surface-50 dark:text-surface-900 dark:hover:bg-surface-200",
			},
			{
				variant: "solid",
				color: "primary",
				class: "bg-surface-900 text-surface-50 hover:bg-surface-800 dark:bg-surface-50 dark:text-surface-900 dark:hover:bg-surface-200",
			},
			{
				variant: "solid",
				color: "accent",
				class: "bg-accent-600 text-accent-950 hover:bg-accent-700 dark:bg-accent-500",
			},
			{
				variant: "solid",
				color: "success",
				class: "bg-success-600 text-white hover:bg-success-700 dark:bg-success-500",
			},
			{
				variant: "solid",
				color: "warning",
				class: "bg-warning-500 text-white hover:bg-warning-600 dark:bg-warning-500",
			},
			{
				variant: "solid",
				color: "info",
				class: "bg-info-600 text-white hover:bg-info-700 dark:bg-info-500",
			},
			{
				variant: "solid",
				color: "destructive",
				class: "bg-destructive-600 text-white hover:bg-destructive-700 dark:bg-destructive-500",
			},

			{
				variant: "soft",
				color: "default",
				class: "border-surface-200 bg-surface-100 text-surface-900 hover:border-surface-300 hover:bg-surface-200 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-300",
			},
			{
				variant: "soft",
				color: "primary",
				class: "border-surface-200 bg-surface-100 text-surface-900 hover:border-surface-300 hover:bg-surface-200 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-300",
			},
			{
				variant: "soft",
				color: "accent",
				class: "border-accent-100 bg-accent-50 text-accent-700 hover:border-accent-200 hover:bg-accent-100 dark:border-accent-900 dark:bg-accent-950/50 dark:text-accent-300",
			},
			{
				variant: "soft",
				color: "success",
				class: "border-success-100 bg-success-50 text-success-700 hover:border-success-200 hover:bg-success-100 dark:border-success-900 dark:bg-success-950/50 dark:text-success-300",
			},
			{
				variant: "soft",
				color: "warning",
				class: "border-warning-100 bg-warning-50 text-warning-700 hover:border-warning-200 hover:bg-warning-100 dark:border-warning-900 dark:bg-warning-950/50 dark:text-warning-300",
			},
			{
				variant: "soft",
				color: "info",
				class: "border-info-100 bg-info-50 text-info-700 hover:border-info-200 hover:bg-info-100 dark:border-info-900 dark:bg-info-950/50 dark:text-info-300",
			},
			{
				variant: "soft",
				color: "destructive",
				class: "border-destructive-100 bg-destructive-50 text-destructive-700 hover:border-destructive-200 hover:bg-destructive-100 dark:border-destructive-900 dark:bg-destructive-950/50 dark:text-destructive-300",
			},

			{
				variant: "outlined",
				color: "default",
				class: "border-surface-300 text-surface-700 hover:bg-surface-50 hover:text-surface-900 dark:border-surface-700 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-surface-200",
			},
			{
				variant: "outlined",
				color: "primary",
				class: "border-surface-300 text-surface-700 hover:bg-surface-50 hover:text-surface-900 dark:border-surface-700 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-surface-200",
			},
			{
				variant: "outlined",
				color: "accent",
				class: "border-accent-200 text-accent-700 hover:border-accent-300 hover:bg-accent-50 dark:border-accent-800 dark:text-accent-400 dark:hover:border-accent-700 dark:hover:bg-accent-950/50",
			},
			{
				variant: "outlined",
				color: "success",
				class: "border-success-200 text-success-700 hover:border-success-300 hover:bg-success-50 dark:border-success-800 dark:text-success-400 dark:hover:border-success-700 dark:hover:bg-success-950/50",
			},
			{
				variant: "outlined",
				color: "warning",
				class: "border-warning-200 text-warning-700 hover:border-warning-300 hover:bg-warning-50 dark:border-warning-800 dark:text-warning-400 dark:hover:border-warning-700 dark:hover:bg-warning-950/50",
			},
			{
				variant: "outlined",
				color: "info",
				class: "border-info-200 text-info-700 hover:border-info-300 hover:bg-info-50 dark:border-info-800 dark:text-info-400 dark:hover:border-info-700 dark:hover:bg-info-950/50",
			},
			{
				variant: "outlined",
				color: "destructive",
				class: "border-destructive-200 text-destructive-700 hover:border-destructive-300 hover:bg-destructive-50 dark:border-destructive-800 dark:text-destructive-400 dark:hover:border-destructive-700 dark:hover:bg-destructive-950/50",
			},

			{
				variant: "plain",
				color: "default",
				class: "text-surface-600 hover:bg-surface-100 hover:text-surface-900 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-surface-200",
			},
			{
				variant: "plain",
				color: "primary",
				class: "text-surface-600 hover:bg-surface-100 hover:text-surface-900 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-surface-200",
			},
			{
				variant: "plain",
				color: "accent",
				class: "text-accent-600 hover:bg-accent-50 hover:text-accent-800 dark:text-accent-400 dark:hover:bg-accent-950/50 dark:hover:text-accent-200",
			},
			{
				variant: "plain",
				color: "success",
				class: "text-success-600 hover:bg-success-50 hover:text-success-800 dark:text-success-400 dark:hover:bg-success-950/50 dark:hover:text-success-200",
			},
			{
				variant: "plain",
				color: "warning",
				class: "text-warning-600 hover:bg-warning-50 hover:text-warning-800 dark:text-warning-400 dark:hover:bg-warning-950/50 dark:hover:text-warning-200",
			},
			{
				variant: "plain",
				color: "info",
				class: "text-info-600 hover:bg-info-50 hover:text-info-800 dark:text-info-400 dark:hover:bg-info-950/50 dark:hover:text-info-200",
			},
			{
				variant: "plain",
				color: "destructive",
				class: "text-destructive-600 hover:bg-destructive-50 hover:text-destructive-800 dark:text-destructive-400 dark:hover:bg-destructive-950/50 dark:hover:text-destructive-200",
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

// FIX: Omit 'color' from HTMLAttributes to prevent conflict with VariantProps 'color'
export interface BadgeProps
	extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color">,
		VariantProps<typeof badgeVariants> {
	/** Children of the badge */
	children?: React.ReactNode;
}

function Badge({ className, variant, color, size, shape, interactive, ...props }: BadgeProps) {
	return (
		<span
			className={cn(badgeVariants({ variant, color, size, shape, interactive, className }))}
			{...props}
		/>
	);
}

export { Badge, badgeVariants };
