/**
 * Button component with support for multiple variants, sizes, and loading states.
 *
 * @remarks
 * Supports polymorphic rendering via `asChild`, tooltips, and Framer Motion animations.
 *
 * @example
 * ```tsx
 * <Button variant="solid" color="primary" onClick={onClick}>
 *   Action
 * </Button>
 * ```
 *
 * @public
 */

"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { type HTMLMotionProps, motion } from "framer-motion";
import * as React from "react";
import { Fragment, type ReactNode, useMemo } from "react";
import { Spinner } from "@/src/components/ui/spinner";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/src/components/ui/tooltip";
import { cn, springs } from "@/src/lib/index";

// ═══════════════════════════════════════════════════════════════════════════
// ANIMATION CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Framer Motion interaction states.
 *
 * 2D physics-based interaction (no shadows, no y-axis elevation).
 * Matches the floating-nav pattern for consistent tactile feedback.
 */
const interactionStates = {
	idle: {
		scale: 1,
	},
	hover: {
		scale: 1, // No scale on hover, only visual state change via CSS
	},
	tap: {
		scale: 0.97, // Satisfying press-in effect
	},
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// VARIANTS
// ═══════════════════════════════════════════════════════════════════════════

const buttonVariants = cva(
	[
		// Base structure
		"group relative inline-flex items-center justify-center",
		"select-none whitespace-nowrap font-bold text-sm",
		// Border radius defined by CSS variable
		"rounded-[var(--radius)]",
		// GPU-accelerated transforms
		"transform-gpu cursor-pointer",
		// Focus ring (WCAG 2.4.7 compliant)
		"ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
		// Disabled state
		"disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
		// Color transitions (NOT transform - Framer handles that)
		"transition-[color,background-color,border-color] duration-150 ease-out",
	],
	{
		variants: {
			variant: {
				solid: "",
				soft: "",
				outlined: "border",
				plain: "",
			},
			color: {
				default: "",
				primary: "",
				accent: "",
				success: "",
				warning: "",
				info: "",
				destructive: "",
			},
			size: {
				xs: "h-[30px] gap-2.5 px-2.5 text-xs",
				sm: "h-[var(--portfolio-control-sm)] gap-2.5 px-5 text-xs",
				md: "h-[var(--portfolio-control-md)] gap-2.5 px-5 text-sm",
				lg: "h-[var(--portfolio-control-lg)] gap-2.5 px-[30px] text-sm",
				xl: "h-[var(--portfolio-control-xl)] gap-2.5 px-10 text-base",
				icon: "size-10 p-2.5",
				"icon-sm": "size-[30px] p-1.5",
				"icon-lg": "size-[50px] p-2.5",
			},
			shape: {
				default: "rounded-[var(--radius)]",
				none: "rounded-none",
				sm: "rounded-sm",
				md: "rounded-md",
				lg: "rounded-lg",
				xl: "rounded-xl",
				full: "rounded-full",
			},
		},
		compoundVariants: [
			// ═══════════════════════════════════════════════════════════════════
			// SOLID VARIANTS - Strong backgrounds, high contrast
			// ═══════════════════════════════════════════════════════════════════
			{
				variant: "solid",
				color: "default",
				className: [
					"bg-surface-950 text-surface-50",
					"hover:bg-surface-800 focus-visible:bg-surface-800",
					"active:bg-surface-700",
					"dark:bg-surface-50 dark:text-surface-950",
					"dark:focus-visible:bg-surface-100 dark:hover:bg-surface-100",
					"dark:active:bg-surface-200",
					"focus-visible:ring-surface-400",
				],
			},
			{
				variant: "solid",
				color: "primary",
				className: [
					"bg-primary-950 text-primary-50",
					"hover:bg-primary-800 focus-visible:bg-primary-800",
					"active:bg-primary-700",
					"dark:bg-primary-50 dark:text-primary-950",
					"dark:focus-visible:bg-primary-100 dark:hover:bg-primary-100",
					"dark:active:bg-primary-200",
					"focus-visible:ring-primary-500",
				],
			},
			{
				variant: "solid",
				color: "accent",
				className: [
					"bg-accent-600 text-accent-50",
					"hover:bg-accent-700 focus-visible:bg-accent-700",
					"active:bg-accent-800",
					"dark:bg-accent-500 dark:text-white",
					"dark:focus-visible:bg-accent-600 dark:hover:bg-accent-600",
					"dark:active:bg-accent-700",

					"focus-visible:ring-accent-500",
				],
			},
			{
				variant: "solid",
				color: "success",
				className: [
					"bg-success-600 text-success-50",
					"hover:bg-success-700 focus-visible:bg-success-700",
					"active:bg-success-800",
					"dark:bg-success-500 dark:text-white",
					"dark:focus-visible:bg-success-600 dark:hover:bg-success-600",
					"dark:active:bg-success-700",

					"focus-visible:ring-success-500",
				],
			},
			{
				variant: "solid",
				color: "warning",
				className: [
					"bg-warning-500 text-warning-950",
					"hover:bg-warning-600 focus-visible:bg-warning-600",
					"active:bg-warning-700",
					"dark:bg-warning-500 dark:text-warning-950",
					"dark:focus-visible:bg-warning-600 dark:hover:bg-warning-600",
					"dark:active:bg-warning-700",

					"focus-visible:ring-warning-500",
				],
			},
			{
				variant: "solid",
				color: "info",
				className: [
					"bg-info-600 text-info-50",
					"hover:bg-info-700 focus-visible:bg-info-700",
					"active:bg-info-800",
					"dark:bg-info-500 dark:text-white",
					"dark:focus-visible:bg-info-600 dark:hover:bg-info-600",
					"dark:active:bg-info-700",

					"focus-visible:ring-info-500",
				],
			},
			{
				variant: "solid",
				color: "destructive",
				className: [
					"bg-destructive-600 text-destructive-50",
					"hover:bg-destructive-700 focus-visible:bg-destructive-700",
					"active:bg-destructive-800",
					"dark:bg-destructive-500 dark:text-white",
					"dark:focus-visible:bg-destructive-600 dark:hover:bg-destructive-600",
					"dark:active:bg-destructive-700",

					"focus-visible:ring-destructive-500",
				],
			},

			// ═══════════════════════════════════════════════════════════════════
			// SOFT VARIANTS - Subtle backgrounds, depth via background color
			// ═══════════════════════════════════════════════════════════════════
			{
				variant: "soft",
				color: "default",
				className: [
					"bg-surface-200 text-surface-900",
					"hover:bg-surface-300 focus-visible:bg-surface-300",
					"active:bg-surface-400",
					"dark:bg-surface-800 dark:text-surface-100",
					"dark:focus-visible:bg-surface-700 dark:hover:bg-surface-700",
					"dark:active:bg-surface-600",

					"focus-visible:ring-surface-400",
				],
			},
			{
				variant: "soft",
				color: "primary",
				className: [
					"bg-primary-200 text-primary-900",
					"hover:bg-primary-300 focus-visible:bg-primary-300",
					"active:bg-primary-400",
					"dark:bg-primary-900 dark:text-primary-100",
					"dark:focus-visible:bg-primary-800 dark:hover:bg-primary-800",
					"dark:active:bg-primary-700",

					"focus-visible:ring-primary-500",
				],
			},
			{
				variant: "soft",
				color: "accent",
				className: [
					"bg-accent-200 text-accent-800",
					"hover:bg-accent-300 hover:text-accent-900 focus-visible:bg-accent-300 focus-visible:text-accent-900",
					"active:bg-accent-400 active:text-accent-950",
					"dark:bg-accent-900 dark:text-accent-200",
					"dark:focus-visible:bg-accent-800 dark:focus-visible:text-accent-100 dark:hover:bg-accent-800 dark:hover:text-accent-100",
					"dark:active:bg-accent-700 dark:active:text-accent-50",

					"focus-visible:ring-accent-500",
				],
			},
			{
				variant: "soft",
				color: "success",
				className: [
					"bg-success-200 text-success-800",
					"hover:bg-success-300 hover:text-success-900 focus-visible:bg-success-300 focus-visible:text-success-900",
					"active:bg-success-400 active:text-success-950",
					"dark:bg-success-900 dark:text-success-200",
					"dark:focus-visible:bg-success-800 dark:focus-visible:text-success-100 dark:hover:bg-success-800 dark:hover:text-success-100",
					"dark:active:bg-success-700 dark:active:text-success-50",

					"focus-visible:ring-success-500",
				],
			},
			{
				variant: "soft",
				color: "warning",
				className: [
					"bg-warning-200 text-warning-800",
					"hover:bg-warning-300 hover:text-warning-900 focus-visible:bg-warning-300 focus-visible:text-warning-900",
					"active:bg-warning-400 active:text-warning-950",
					"dark:bg-warning-900 dark:text-warning-200",
					"dark:focus-visible:bg-warning-800 dark:focus-visible:text-warning-100 dark:hover:bg-warning-800 dark:hover:text-warning-100",
					"dark:active:bg-warning-700 dark:active:text-warning-50",

					"focus-visible:ring-warning-500",
				],
			},
			{
				variant: "soft",
				color: "info",
				className: [
					"bg-info-200 text-info-800",
					"hover:bg-info-300 hover:text-info-900 focus-visible:bg-info-300 focus-visible:text-info-900",
					"active:bg-info-400 active:text-info-950",
					"dark:bg-info-900 dark:text-info-200",
					"dark:focus-visible:bg-info-800 dark:focus-visible:text-info-100 dark:hover:bg-info-800 dark:hover:text-info-100",
					"dark:active:bg-info-700 dark:active:text-info-50",

					"focus-visible:ring-info-500",
				],
			},
			{
				variant: "soft",
				color: "destructive",
				className: [
					"bg-destructive-200 text-destructive-800",
					"hover:bg-destructive-300 hover:text-destructive-900 focus-visible:bg-destructive-300 focus-visible:text-destructive-900",
					"active:bg-destructive-400 active:text-destructive-950",
					"dark:bg-destructive-900 dark:text-destructive-200",
					"dark:focus-visible:bg-destructive-800 dark:focus-visible:text-destructive-100 dark:hover:bg-destructive-800 dark:hover:text-destructive-100",
					"dark:active:bg-destructive-700 dark:active:text-destructive-50",

					"focus-visible:ring-destructive-500",
				],
			},

			// ═══════════════════════════════════════════════════════════════════
			// OUTLINED VARIANTS - Borders with visible fill on hover
			// ═══════════════════════════════════════════════════════════════════
			{
				variant: "outlined",
				color: "default",
				className: [
					"border-surface-300 bg-transparent text-surface-900",
					"hover:border-surface-400 hover:bg-surface-100 focus-visible:border-surface-400 focus-visible:bg-surface-100",
					"active:bg-surface-200",
					"dark:border-surface-600 dark:text-surface-100",
					"dark:focus-visible:border-surface-500 dark:focus-visible:bg-surface-800 dark:hover:border-surface-500 dark:hover:bg-surface-800",
					"dark:active:bg-surface-700",

					"focus-visible:ring-surface-400",
				],
			},
			{
				variant: "outlined",
				color: "primary",
				className: [
					"border-primary-300 bg-transparent text-primary-900",
					"hover:border-primary-400 hover:bg-primary-100 focus-visible:border-primary-400 focus-visible:bg-primary-100",
					"active:bg-primary-200",
					"dark:border-primary-600 dark:text-primary-100",
					"dark:focus-visible:border-primary-500 dark:focus-visible:bg-primary-900 dark:hover:border-primary-500 dark:hover:bg-primary-900",
					"dark:active:bg-primary-800",

					"focus-visible:ring-primary-500",
				],
			},
			{
				variant: "outlined",
				color: "accent",
				className: [
					"border-accent-300 bg-transparent text-accent-700",
					"hover:border-accent-400 hover:bg-accent-100 hover:text-accent-800 focus-visible:border-accent-400 focus-visible:bg-accent-100 focus-visible:text-accent-800",
					"active:bg-accent-200 active:text-accent-900",
					"dark:border-accent-600 dark:text-accent-300",
					"dark:focus-visible:border-accent-500 dark:focus-visible:bg-accent-900 dark:focus-visible:text-accent-200 dark:hover:border-accent-500 dark:hover:bg-accent-900 dark:hover:text-accent-200",
					"dark:active:bg-accent-800 dark:active:text-accent-100",

					"focus-visible:ring-accent-500",
				],
			},
			{
				variant: "outlined",
				color: "success",
				className: [
					"border-success-300 bg-transparent text-success-700",
					"hover:border-success-400 hover:bg-success-100 hover:text-success-800 focus-visible:border-success-400 focus-visible:bg-success-100 focus-visible:text-success-800",
					"active:bg-success-200 active:text-success-900",
					"dark:border-success-600 dark:text-success-300",
					"dark:focus-visible:border-success-500 dark:focus-visible:bg-success-900 dark:focus-visible:text-success-200 dark:hover:border-success-500 dark:hover:bg-success-900 dark:hover:text-success-200",
					"dark:active:bg-success-800 dark:active:text-success-100",

					"focus-visible:ring-success-500",
				],
			},
			{
				variant: "outlined",
				color: "warning",
				className: [
					"border-warning-300 bg-transparent text-warning-700",
					"hover:border-warning-400 hover:bg-warning-100 hover:text-warning-800 focus-visible:border-warning-400 focus-visible:bg-warning-100 focus-visible:text-warning-800",
					"active:bg-warning-200 active:text-warning-900",
					"dark:border-warning-600 dark:text-warning-300",
					"dark:focus-visible:border-warning-500 dark:focus-visible:bg-warning-900 dark:focus-visible:text-warning-200 dark:hover:border-warning-500 dark:hover:bg-warning-900 dark:hover:text-warning-200",
					"dark:active:bg-warning-800 dark:active:text-warning-100",

					"focus-visible:ring-warning-500",
				],
			},
			{
				variant: "outlined",
				color: "info",
				className: [
					"border-info-300 bg-transparent text-info-700",
					"hover:border-info-400 hover:bg-info-100 hover:text-info-800 focus-visible:border-info-400 focus-visible:bg-info-100 focus-visible:text-info-800",
					"active:bg-info-200 active:text-info-900",
					"dark:border-info-600 dark:text-info-300",
					"dark:focus-visible:border-info-500 dark:focus-visible:bg-info-900 dark:focus-visible:text-info-200 dark:hover:border-info-500 dark:hover:bg-info-900 dark:hover:text-info-200",
					"dark:active:bg-info-800 dark:active:text-info-100",

					"focus-visible:ring-info-500",
				],
			},
			{
				variant: "outlined",
				color: "destructive",
				className: [
					"border-destructive-300 bg-transparent text-destructive-700",
					"hover:border-destructive-400 hover:bg-destructive-100 hover:text-destructive-800 focus-visible:border-destructive-400 focus-visible:bg-destructive-100 focus-visible:text-destructive-800",
					"active:bg-destructive-200 active:text-destructive-900",
					"dark:border-destructive-600 dark:text-destructive-300",
					"dark:focus-visible:border-destructive-500 dark:focus-visible:bg-destructive-900 dark:focus-visible:text-destructive-200 dark:hover:border-destructive-500 dark:hover:bg-destructive-900 dark:hover:text-destructive-200",
					"dark:active:bg-destructive-800 dark:active:text-destructive-100",

					"focus-visible:ring-destructive-500",
				],
			},

			// ═══════════════════════════════════════════════════════════════════
			// PLAIN VARIANTS - Ghost buttons with visible fill on hover
			// ═══════════════════════════════════════════════════════════════════
			{
				variant: "plain",
				color: "default",
				className: [
					"bg-transparent text-surface-600",
					"hover:bg-surface-200 hover:text-surface-900 focus-visible:bg-surface-200 focus-visible:text-surface-900",
					"active:bg-surface-300 active:text-surface-950",
					"dark:text-surface-400",
					"dark:focus-visible:bg-surface-800 dark:focus-visible:text-surface-100 dark:hover:bg-surface-800 dark:hover:text-surface-100",
					"dark:active:bg-surface-700 dark:active:text-surface-50",

					"focus-visible:ring-surface-400",
				],
			},
			{
				variant: "plain",
				color: "primary",
				className: [
					"bg-transparent text-primary-600",
					"hover:bg-primary-100 hover:text-primary-900 focus-visible:bg-primary-100 focus-visible:text-primary-900",
					"active:bg-primary-200 active:text-primary-950",
					"dark:text-primary-400",
					"dark:focus-visible:bg-primary-900 dark:focus-visible:text-primary-100 dark:hover:bg-primary-900 dark:hover:text-primary-100",
					"dark:active:bg-primary-800 dark:active:text-primary-50",

					"focus-visible:ring-primary-500",
				],
			},
			{
				variant: "plain",
				color: "accent",
				className: [
					"bg-transparent text-accent-600",
					"hover:bg-accent-100 hover:text-accent-800 focus-visible:bg-accent-100 focus-visible:text-accent-800",
					"active:bg-accent-200 active:text-accent-900",
					"dark:text-accent-400",
					"dark:focus-visible:bg-accent-900 dark:focus-visible:text-accent-200 dark:hover:bg-accent-900 dark:hover:text-accent-200",
					"dark:active:bg-accent-800 dark:active:text-accent-100",

					"focus-visible:ring-accent-500",
				],
			},
			{
				variant: "plain",
				color: "success",
				className: [
					"bg-transparent text-success-600",
					"hover:bg-success-100 hover:text-success-800 focus-visible:bg-success-100 focus-visible:text-success-800",
					"active:bg-success-200 active:text-success-900",
					"dark:text-success-400",
					"dark:focus-visible:bg-success-900 dark:focus-visible:text-success-200 dark:hover:bg-success-900 dark:hover:text-success-200",
					"dark:active:bg-success-800 dark:active:text-success-100",

					"focus-visible:ring-success-500",
				],
			},
			{
				variant: "plain",
				color: "warning",
				className: [
					"bg-transparent text-warning-600",
					"hover:bg-warning-100 hover:text-warning-800 focus-visible:bg-warning-100 focus-visible:text-warning-800",
					"active:bg-warning-200 active:text-warning-900",
					"dark:text-warning-400",
					"dark:focus-visible:bg-warning-900 dark:focus-visible:text-warning-200 dark:hover:bg-warning-900 dark:hover:text-warning-200",
					"dark:active:bg-warning-800 dark:active:text-warning-100",

					"focus-visible:ring-warning-500",
				],
			},
			{
				variant: "plain",
				color: "info",
				className: [
					"bg-transparent text-info-600",
					"hover:bg-info-100 hover:text-info-800 focus-visible:bg-info-100 focus-visible:text-info-800",
					"active:bg-info-200 active:text-info-900",
					"dark:text-info-400",
					"dark:focus-visible:bg-info-900 dark:focus-visible:text-info-200 dark:hover:bg-info-900 dark:hover:text-info-200",
					"dark:active:bg-info-800 dark:active:text-info-100",

					"focus-visible:ring-info-500",
				],
			},
			{
				variant: "plain",
				color: "destructive",
				className: [
					"bg-transparent text-destructive-600",
					"hover:bg-destructive-100 hover:text-destructive-800 focus-visible:bg-destructive-100 focus-visible:text-destructive-800",
					"active:bg-destructive-200 active:text-destructive-900",
					"dark:text-destructive-400",
					"dark:focus-visible:bg-destructive-900 dark:focus-visible:text-destructive-200 dark:hover:bg-destructive-900 dark:hover:text-destructive-200",
					"dark:active:bg-destructive-800 dark:active:text-destructive-100",

					"focus-visible:ring-destructive-500",
				],
			},
		],
		defaultVariants: {
			variant: "solid",
			color: "default",
			size: "md",
			shape: "default",
		},
	},
);

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface ButtonProps
	extends Omit<HTMLMotionProps<"button">, "color" | "children">,
		VariantProps<typeof buttonVariants> {
	/** Button content */
	children?: ReactNode;
	/** Composition slot for high-level UI composition (e.g. Next.js Link) */
	asChild?: boolean;
	/** Display a Spinner and disable interactions */
	loading?: boolean;

	// Tooltip Integration
	/** Explicitly show a tooltip on hover */
	showTooltip?: boolean;
	/** Content of the tooltip */
	tooltipContent?: ReactNode;
	/** Delay before showing (ms) */
	tooltipDelayDuration?: number;
	/** Position relative to the button */
	tooltipSide?: "top" | "right" | "bottom" | "left";
	/** Offset from the button edge (px) */
	tooltipSideOffset?: number;
	/** Alignment with the button axis */
	tooltipAlign?: "start" | "center" | "end";
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

// Motion-enabled Slot for asChild composition (e.g., with Next.js Link)
const MotionSlot = motion.create(Slot);

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{
			className,
			variant,
			color,
			size,
			shape,
			asChild = false,
			disabled = false,
			loading = false,
			children,
			type = "button",

			tooltipContent,
			showTooltip = !!tooltipContent,
			tooltipDelayDuration = 700,
			tooltipSide = "top",
			tooltipSideOffset = 8,
			tooltipAlign = "center",

			...props
		},
		ref,
	) => {
		const Comp = asChild ? MotionSlot : motion.button;
		const isDisabled = loading || disabled;

		function getSpinnerSize() {
			if (size === "xs" || size === "sm" || size === "icon-sm") return "xs";
			if (size === "lg" || size === "xl" || size === "icon-lg") return "md";
			return "sm";
		}

		// 2D physics-based interaction (no shadows, no y-axis elevation)
		const motionProps = useMemo(() => {
			if (isDisabled) {
				return {
					initial: interactionStates.idle,
					animate: interactionStates.idle,
				};
			}
			return {
				initial: "idle",
				whileHover: "hover",
				whileTap: "tap",
				variants: interactionStates,
				transition: springs.snappy,
			};
		}, [isDisabled]);

		const content = (
			<Comp
				ref={ref}
				className={cn(buttonVariants({ className, color, shape, size, variant }))}
				disabled={isDisabled}
				type={type}
				{...motionProps}
				{...props}
			>
				{loading ? (
					<Fragment>
						<Spinner
							aria-hidden="true"
							className="size-[1.25em] text-current"
							focusable="false"
							size={getSpinnerSize()}
						/>
						{children}
					</Fragment>
				) : (
					children
				)}
			</Comp>
		);

		if (showTooltip && tooltipContent) {
			return (
				<TooltipProvider delayDuration={tooltipDelayDuration}>
					<Tooltip>
						<TooltipTrigger asChild>{content}</TooltipTrigger>
						<TooltipContent
							align={tooltipAlign}
							side={tooltipSide}
							sideOffset={tooltipSideOffset}
						>
							{tooltipContent}
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			);
		}

		return content;
	},
);

Button.displayName = "Button";

export { Button, buttonVariants };
