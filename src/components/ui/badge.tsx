/**
 * Semantic status indicator for categorization and labeling.
 *
 * @remarks
 * A compact inline element for displaying tags, statuses, or metadata.
 * Supports 4 visual variants (solid, soft, outlined, plain) and 7 semantic colors.
 * All styles are GPU-accelerated and respect the design system radius tokens.
 *
 * @example
 * ```tsx
 * <Badge variant="solid" color="success">Active</Badge>
 * <Badge variant="outlined" color="warning" size="sm">Pending</Badge>
 * ```
 *
 * @public
 */

import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "@/src/lib/utils";

// ═══════════════════════════════════════════════════════════════════════════
// VARIANTS
// ═══════════════════════════════════════════════════════════════════════════

const badgeVariants = cva(
	[
		"inline-flex cursor-pointer select-none items-center justify-center gap-2 px-2.5 py-0.5",
		"font-semibold text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
		"transform-gpu transition-all duration-200 dark:cursor-pointer",
	],
	{
		variants: {
			variant: {
				solid: "text-white",
				soft: "",
				outlined: "border",
				plain: "border-transparent",
			},
			color: {
				primary: "border-primary-700 text-primary-700 hover:bg-primary-700",
				secondary: "border-secondary-700 text-secondary-700 hover:bg-secondary-700",
				accent: "border-accent-700 text-accent-700 hover:bg-accent-700",
				success: "border-success-700 text-success-700 hover:bg-success-700",
				warning: "border-warning-700 text-warning-700 hover:bg-warning-700",
				info: "border-info-700 text-info-700 hover:bg-info-700",
				destructive: "border-destructive-700 text-destructive-700 hover:bg-destructive-700",
			},
			shape: {
				none: "rounded-none",
				xs: "rounded-[var(--radius-xs)]",
				sm: "rounded-[var(--radius-sm)]",
				md: "rounded-[var(--radius-md)]",
				lg: "rounded-[var(--radius-lg)]",
				xl: "rounded-[var(--radius-xl)]",
				full: "rounded-[var(--radius-full)]",
				default: "rounded-[var(--radius)]",
			},
			size: {
				sm: "px-2 pt-px pb-0.5 text-[10px]",
				md: "px-2.5 py-0.5 text-xs",
				lg: "px-3 py-1 text-sm",
			},
			disabled: {
				true: "cursor-not-allowed opacity-50",
				false: "",
			},
		},
		compoundVariants: [
			// Solid Variants
			{
				variant: "solid",
				color: "primary",
				class: "bg-primary-950 text-primary-50 hover:bg-primary-800 dark:bg-primary-50 dark:text-primary-950",
			},
			{
				variant: "solid",
				color: "secondary",
				class: "bg-secondary-500 text-white hover:bg-secondary-600",
			},
			{
				variant: "solid",
				color: "accent",
				class: "bg-accent-500 text-white hover:bg-accent-600",
			},
			{
				variant: "solid",
				color: "success",
				class: "bg-success-500 text-white hover:bg-success-600",
			},
			{
				variant: "solid",
				color: "warning",
				class: "bg-warning-500 text-white hover:bg-warning-600",
			},
			{
				variant: "solid",
				color: "info",
				class: "bg-info-500 text-white hover:bg-info-600",
			},
			{
				variant: "solid",
				color: "destructive",
				class: "bg-destructive-500 text-white hover:bg-destructive-600",
			},

			// Soft Variants
			{
				variant: "soft",
				color: "primary",
				class: "bg-primary-100 text-primary-600 dark:bg-primary-950",
			},
			{
				variant: "soft",
				color: "secondary",
				class: "bg-secondary-100 text-secondary-600 dark:bg-secondary-950",
			},
			{
				variant: "soft",
				color: "accent",
				class: "bg-accent-100 text-accent-600 dark:bg-accent-950",
			},
			{
				variant: "soft",
				color: "success",
				class: "bg-success-100 text-success-600 dark:bg-success-950",
			},
			{
				variant: "soft",
				color: "warning",
				class: "bg-warning-100 text-warning-600 dark:bg-warning-950",
			},
			{
				variant: "soft",
				color: "info",
				class: "bg-info-100 text-info-600 dark:bg-info-950",
			},
			{
				variant: "soft",
				color: "destructive",
				class: "bg-destructive-100 text-destructive-600 dark:bg-destructive-950",
			},
		],
		defaultVariants: {
			color: "primary",
			size: "md",
			variant: "solid",
			shape: "default",
			disabled: false,
		},
	},
);

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface BadgeProps
	extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color">,
		VariantProps<typeof badgeVariants> {
	/** Children of the badge (usually text or a small icon) */
	children?: React.ReactNode;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Badge component implementing the design system's label primitive.
 *
 * @param props - Badge configuration including variant, color, size, and shape.
 * @returns A styled span element with the appropriate visual treatment.
 *
 * @public
 */
function Badge({ className, color, disabled, size, variant, shape, ...props }: BadgeProps) {
	return (
		<span
			className={cn(badgeVariants({ className, color, disabled, size, variant, shape }))}
			{...props}
		/>
	);
}

export { Badge, badgeVariants };
