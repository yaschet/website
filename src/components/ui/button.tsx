/**
 * Button Component - Swiss Precision Edition
 *
 * Precision-engineered interaction design with coordinated physics.
 * Every property — scale, Y-translation, shadow — moves as one unified system.
 * No bounce. No overshoot. Just controlled, deliberate motion.
 */

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { type HTMLMotionProps, motion } from "framer-motion";
import * as React from "react";
import { Fragment, type ReactNode, useMemo } from "react";

import { springs } from "@/src/lib/physics";
import Spinner from "@/src/components/ui/spinner";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/src/components/ui/tooltip";
import { cn } from "@/src/lib/utils";

// ═══════════════════════════════════════════════════════════════════════════
// PHYSICS CONFIGURATION - The Soul of the Interaction
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Coordinated physics states.
 * All properties animate together as one unified physical object.
 * Shadows use 3-layer realistic levitation (contact + direct + ambient).
 */
const interactionStates = {
	rest: {
		scale: 1,
		y: 0,
		// Subtle resting shadow — element sits on the surface
		boxShadow: [
			"0 1px 2px rgba(0, 0, 0, 0.04)", // Contact
			"0 1px 3px rgba(0, 0, 0, 0.06)", // Direct
		].join(", "),
	},
	hover: {
		scale: 1.01, // 1% — perceptible, not cartoonish
		y: -2, // Lifts off the page
		// Premium levitation shadow — element floats above surface
		boxShadow: [
			"0 1px 2px rgba(0, 0, 0, 0.03)", // Contact fades as we lift
			"0 4px 8px -2px rgba(0, 0, 0, 0.08)", // Direct shadow deepens
			"0 12px 20px -4px rgba(0, 0, 0, 0.10)", // Ambient diffuse appears
		].join(", "),
	},
	tap: {
		scale: 0.98, // Compresses — the mechanical "click"
		y: 0, // Settles back flush with surface
		// Pressed shadow — element is flush/pressed into surface
		boxShadow: "0 0px 1px rgba(0, 0, 0, 0.08)",
	},
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// VARIANTS - Compound Architecture for Premium Visual Depth
// ═══════════════════════════════════════════════════════════════════════════

const buttonVariants = cva(
	[
		// Base structure
		"group relative inline-flex items-center justify-center gap-2 px-4 py-2",
		"font-bold text-sm whitespace-nowrap select-none",
		// Swiss precision: 0px radius is enforced via --radius CSS variable
		"rounded-[var(--radius)]",
		// GPU-accelerated transforms
		"transform-gpu cursor-pointer",
		// Overflow handling for subsurface lighting layer
		"isolate overflow-visible",
		// Subsurface lighting layer (matches border-radius via rounded-[inherit])
		"after:pointer-events-none after:absolute after:inset-0 after:-z-10 after:rounded-[inherit]",
		"after:transition-opacity after:duration-150 after:ease-out after:content-['']",
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
				xs: "px-2.5 py-1 text-xs gap-1.5",
				sm: "px-3 py-1.5 text-xs gap-1.5",
				md: "px-4 py-2 text-sm gap-2",
				lg: "px-5 py-2.5 text-sm gap-2",
				xl: "px-6 py-3 text-base gap-2.5",
				icon: "size-10 p-2",
				"icon-sm": "size-8 p-1.5",
				"icon-lg": "size-12 p-3",
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
			// SOLID VARIANTS - Strong backgrounds with subsurface lighting
			// ═══════════════════════════════════════════════════════════════════
			{
				variant: "solid",
				color: "default",
				className: [
					"bg-surface-950 text-surface-50",
					"hover:bg-surface-900 focus-visible:bg-surface-900",
					"active:bg-surface-800",
					"dark:bg-surface-50 dark:text-surface-950",
					"dark:hover:bg-surface-200 dark:focus-visible:bg-surface-200",
					"dark:active:bg-surface-100",
					"after:bg-gradient-to-br after:from-white/15 after:via-white/5 after:to-transparent",
					"after:opacity-0 hover:after:opacity-100 focus-visible:after:opacity-100",
					"focus-visible:ring-surface-400",
				],
			},
			{
				variant: "solid",
				color: "primary",
				className: [
					"bg-primary-950 text-primary-50",
					"hover:bg-primary-900 focus-visible:bg-primary-900",
					"active:bg-primary-800",
					"dark:bg-primary-50 dark:text-primary-950",
					"dark:hover:bg-primary-200 dark:focus-visible:bg-primary-200",
					"dark:active:bg-primary-100",
					"after:bg-gradient-to-br after:from-primary-300/20 after:via-primary-400/10 after:to-transparent",
					"after:opacity-0 hover:after:opacity-100 focus-visible:after:opacity-100",
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
					"dark:hover:bg-accent-600 dark:focus-visible:bg-accent-600",
					"dark:active:bg-accent-700",
					"after:bg-gradient-to-br after:from-accent-200/30 after:via-accent-300/15 after:to-transparent",
					"after:opacity-0 hover:after:opacity-100 focus-visible:after:opacity-100",
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
					"dark:hover:bg-success-600 dark:focus-visible:bg-success-600",
					"dark:active:bg-success-700",
					"after:bg-gradient-to-br after:from-success-200/30 after:via-success-300/15 after:to-transparent",
					"after:opacity-0 hover:after:opacity-100 focus-visible:after:opacity-100",
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
					"dark:hover:bg-warning-600 dark:focus-visible:bg-warning-600",
					"dark:active:bg-warning-700",
					"after:bg-gradient-to-br after:from-warning-200/30 after:via-warning-300/15 after:to-transparent",
					"after:opacity-0 hover:after:opacity-100 focus-visible:after:opacity-100",
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
					"dark:hover:bg-info-600 dark:focus-visible:bg-info-600",
					"dark:active:bg-info-700",
					"after:bg-gradient-to-br after:from-info-200/30 after:via-info-300/15 after:to-transparent",
					"after:opacity-0 hover:after:opacity-100 focus-visible:after:opacity-100",
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
					"dark:hover:bg-destructive-600 dark:focus-visible:bg-destructive-600",
					"dark:active:bg-destructive-700",
					"after:bg-gradient-to-br after:from-destructive-200/30 after:via-destructive-300/15 after:to-transparent",
					"after:opacity-0 hover:after:opacity-100 focus-visible:after:opacity-100",
					"focus-visible:ring-destructive-500",
				],
			},

			// ═══════════════════════════════════════════════════════════════════
			// SOFT VARIANTS - Subtle backgrounds with gradient overlays
			// ═══════════════════════════════════════════════════════════════════
			{
				variant: "soft",
				color: "default",
				className: [
					"bg-surface-100 text-surface-900",
					"hover:bg-surface-200 focus-visible:bg-surface-200",
					"active:bg-surface-300",
					"dark:bg-surface-800 dark:text-surface-100",
					"dark:hover:bg-surface-700 dark:focus-visible:bg-surface-700",
					"dark:active:bg-surface-600",
					"after:bg-gradient-to-br after:from-surface-50/60 after:to-transparent",
					"after:opacity-0 hover:after:opacity-100 focus-visible:after:opacity-100",
					"focus-visible:ring-surface-400",
				],
			},
			{
				variant: "soft",
				color: "primary",
				className: [
					"bg-primary-100 text-primary-900",
					"hover:bg-primary-200 focus-visible:bg-primary-200",
					"active:bg-primary-300",
					"dark:bg-primary-900 dark:text-primary-100",
					"dark:hover:bg-primary-800 dark:focus-visible:bg-primary-800",
					"dark:active:bg-primary-700",
					"after:bg-gradient-to-br after:from-primary-50/60 after:to-transparent",
					"after:opacity-0 hover:after:opacity-100 focus-visible:after:opacity-100",
					"focus-visible:ring-primary-500",
				],
			},
			{
				variant: "soft",
				color: "accent",
				className: [
					"bg-accent-100 text-accent-700",
					"hover:bg-accent-200 hover:text-accent-800 focus-visible:bg-accent-200 focus-visible:text-accent-800",
					"active:bg-accent-300 active:text-accent-900",
					"dark:bg-accent-900/50 dark:text-accent-300",
					"dark:hover:bg-accent-900 dark:hover:text-accent-200 dark:focus-visible:bg-accent-900 dark:focus-visible:text-accent-200",
					"dark:active:bg-accent-800 dark:active:text-accent-100",
					"after:bg-gradient-to-br after:from-accent-50/60 after:to-transparent",
					"after:opacity-0 hover:after:opacity-100 focus-visible:after:opacity-100",
					"focus-visible:ring-accent-500",
				],
			},
			{
				variant: "soft",
				color: "success",
				className: [
					"bg-success-100 text-success-700",
					"hover:bg-success-200 hover:text-success-800 focus-visible:bg-success-200 focus-visible:text-success-800",
					"active:bg-success-300 active:text-success-900",
					"dark:bg-success-900/50 dark:text-success-300",
					"dark:hover:bg-success-900 dark:hover:text-success-200 dark:focus-visible:bg-success-900 dark:focus-visible:text-success-200",
					"dark:active:bg-success-800 dark:active:text-success-100",
					"after:bg-gradient-to-br after:from-success-50/60 after:to-transparent",
					"after:opacity-0 hover:after:opacity-100 focus-visible:after:opacity-100",
					"focus-visible:ring-success-500",
				],
			},
			{
				variant: "soft",
				color: "warning",
				className: [
					"bg-warning-100 text-warning-700",
					"hover:bg-warning-200 hover:text-warning-800 focus-visible:bg-warning-200 focus-visible:text-warning-800",
					"active:bg-warning-300 active:text-warning-900",
					"dark:bg-warning-900/50 dark:text-warning-300",
					"dark:hover:bg-warning-900 dark:hover:text-warning-200 dark:focus-visible:bg-warning-900 dark:focus-visible:text-warning-200",
					"dark:active:bg-warning-800 dark:active:text-warning-100",
					"after:bg-gradient-to-br after:from-warning-50/60 after:to-transparent",
					"after:opacity-0 hover:after:opacity-100 focus-visible:after:opacity-100",
					"focus-visible:ring-warning-500",
				],
			},
			{
				variant: "soft",
				color: "info",
				className: [
					"bg-info-100 text-info-700",
					"hover:bg-info-200 hover:text-info-800 focus-visible:bg-info-200 focus-visible:text-info-800",
					"active:bg-info-300 active:text-info-900",
					"dark:bg-info-900/50 dark:text-info-300",
					"dark:hover:bg-info-900 dark:hover:text-info-200 dark:focus-visible:bg-info-900 dark:focus-visible:text-info-200",
					"dark:active:bg-info-800 dark:active:text-info-100",
					"after:bg-gradient-to-br after:from-info-50/60 after:to-transparent",
					"after:opacity-0 hover:after:opacity-100 focus-visible:after:opacity-100",
					"focus-visible:ring-info-500",
				],
			},
			{
				variant: "soft",
				color: "destructive",
				className: [
					"bg-destructive-100 text-destructive-700",
					"hover:bg-destructive-200 hover:text-destructive-800 focus-visible:bg-destructive-200 focus-visible:text-destructive-800",
					"active:bg-destructive-300 active:text-destructive-900",
					"dark:bg-destructive-900/50 dark:text-destructive-300",
					"dark:hover:bg-destructive-900 dark:hover:text-destructive-200 dark:focus-visible:bg-destructive-900 dark:focus-visible:text-destructive-200",
					"dark:active:bg-destructive-800 dark:active:text-destructive-100",
					"after:bg-gradient-to-br after:from-destructive-50/60 after:to-transparent",
					"after:opacity-0 hover:after:opacity-100 focus-visible:after:opacity-100",
					"focus-visible:ring-destructive-500",
				],
			},

			// ═══════════════════════════════════════════════════════════════════
			// OUTLINED VARIANTS - Borders with fill on hover
			// ═══════════════════════════════════════════════════════════════════
			{
				variant: "outlined",
				color: "default",
				className: [
					"border-surface-200 bg-transparent text-surface-900",
					"hover:bg-surface-50 focus-visible:bg-surface-50",
					"active:bg-surface-100",
					"dark:border-surface-700 dark:text-surface-100",
					"dark:hover:bg-surface-800/50 dark:focus-visible:bg-surface-800/50",
					"dark:active:bg-surface-800",
					"after:hidden",
					"focus-visible:ring-surface-400",
				],
			},
			{
				variant: "outlined",
				color: "primary",
				className: [
					"border-primary-200 bg-transparent text-primary-900",
					"hover:bg-primary-50 hover:border-primary-300 focus-visible:bg-primary-50 focus-visible:border-primary-300",
					"active:bg-primary-100",
					"dark:border-primary-700 dark:text-primary-100",
					"dark:hover:bg-primary-900/50 dark:hover:border-primary-600 dark:focus-visible:bg-primary-900/50 dark:focus-visible:border-primary-600",
					"dark:active:bg-primary-900",
					"after:hidden",
					"focus-visible:ring-primary-500",
				],
			},
			{
				variant: "outlined",
				color: "accent",
				className: [
					"border-accent-200 bg-transparent text-accent-700",
					"hover:bg-accent-50 hover:border-accent-300 hover:text-accent-800 focus-visible:bg-accent-50 focus-visible:border-accent-300 focus-visible:text-accent-800",
					"active:bg-accent-100 active:text-accent-900",
					"dark:border-accent-700 dark:text-accent-300",
					"dark:hover:bg-accent-900/50 dark:hover:border-accent-600 dark:hover:text-accent-200 dark:focus-visible:bg-accent-900/50 dark:focus-visible:border-accent-600 dark:focus-visible:text-accent-200",
					"dark:active:bg-accent-900 dark:active:text-accent-100",
					"after:hidden",
					"focus-visible:ring-accent-500",
				],
			},
			{
				variant: "outlined",
				color: "success",
				className: [
					"border-success-200 bg-transparent text-success-700",
					"hover:bg-success-50 hover:border-success-300 hover:text-success-800 focus-visible:bg-success-50 focus-visible:border-success-300 focus-visible:text-success-800",
					"active:bg-success-100 active:text-success-900",
					"dark:border-success-700 dark:text-success-300",
					"dark:hover:bg-success-900/50 dark:hover:border-success-600 dark:hover:text-success-200 dark:focus-visible:bg-success-900/50 dark:focus-visible:border-success-600 dark:focus-visible:text-success-200",
					"dark:active:bg-success-900 dark:active:text-success-100",
					"after:hidden",
					"focus-visible:ring-success-500",
				],
			},
			{
				variant: "outlined",
				color: "warning",
				className: [
					"border-warning-200 bg-transparent text-warning-700",
					"hover:bg-warning-50 hover:border-warning-300 hover:text-warning-800 focus-visible:bg-warning-50 focus-visible:border-warning-300 focus-visible:text-warning-800",
					"active:bg-warning-100 active:text-warning-900",
					"dark:border-warning-700 dark:text-warning-300",
					"dark:hover:bg-warning-900/50 dark:hover:border-warning-600 dark:hover:text-warning-200 dark:focus-visible:bg-warning-900/50 dark:focus-visible:border-warning-600 dark:focus-visible:text-warning-200",
					"dark:active:bg-warning-900 dark:active:text-warning-100",
					"after:hidden",
					"focus-visible:ring-warning-500",
				],
			},
			{
				variant: "outlined",
				color: "info",
				className: [
					"border-info-200 bg-transparent text-info-700",
					"hover:bg-info-50 hover:border-info-300 hover:text-info-800 focus-visible:bg-info-50 focus-visible:border-info-300 focus-visible:text-info-800",
					"active:bg-info-100 active:text-info-900",
					"dark:border-info-700 dark:text-info-300",
					"dark:hover:bg-info-900/50 dark:hover:border-info-600 dark:hover:text-info-200 dark:focus-visible:bg-info-900/50 dark:focus-visible:border-info-600 dark:focus-visible:text-info-200",
					"dark:active:bg-info-900 dark:active:text-info-100",
					"after:hidden",
					"focus-visible:ring-info-500",
				],
			},
			{
				variant: "outlined",
				color: "destructive",
				className: [
					"border-destructive-200 bg-transparent text-destructive-700",
					"hover:bg-destructive-50 hover:border-destructive-300 hover:text-destructive-800 focus-visible:bg-destructive-50 focus-visible:border-destructive-300 focus-visible:text-destructive-800",
					"active:bg-destructive-100 active:text-destructive-900",
					"dark:border-destructive-700 dark:text-destructive-300",
					"dark:hover:bg-destructive-900/50 dark:hover:border-destructive-600 dark:hover:text-destructive-200 dark:focus-visible:bg-destructive-900/50 dark:focus-visible:border-destructive-600 dark:focus-visible:text-destructive-200",
					"dark:active:bg-destructive-900 dark:active:text-destructive-100",
					"after:hidden",
					"focus-visible:ring-destructive-500",
				],
			},

			// ═══════════════════════════════════════════════════════════════════
			// PLAIN VARIANTS - Ghost buttons with subtle fill on hover
			// ═══════════════════════════════════════════════════════════════════
			{
				variant: "plain",
				color: "default",
				className: [
					"bg-transparent text-surface-600",
					"hover:text-surface-900 hover:bg-surface-100 focus-visible:text-surface-900 focus-visible:bg-surface-100",
					"active:bg-surface-200 active:text-surface-950",
					"dark:text-surface-400",
					"dark:hover:text-surface-100 dark:hover:bg-surface-800 dark:focus-visible:text-surface-100 dark:focus-visible:bg-surface-800",
					"dark:active:bg-surface-700 dark:active:text-surface-50",
					"after:hidden",
					"focus-visible:ring-surface-400",
				],
			},
			{
				variant: "plain",
				color: "primary",
				className: [
					"bg-transparent text-primary-600",
					"hover:text-primary-800 hover:bg-primary-50 focus-visible:text-primary-800 focus-visible:bg-primary-50",
					"active:bg-primary-100 active:text-primary-900",
					"dark:text-primary-400",
					"dark:hover:text-primary-200 dark:hover:bg-primary-900/50 dark:focus-visible:text-primary-200 dark:focus-visible:bg-primary-900/50",
					"dark:active:bg-primary-900 dark:active:text-primary-100",
					"after:hidden",
					"focus-visible:ring-primary-500",
				],
			},
			{
				variant: "plain",
				color: "accent",
				className: [
					"bg-transparent text-accent-600",
					"hover:text-accent-700 hover:bg-accent-50 focus-visible:text-accent-700 focus-visible:bg-accent-50",
					"active:bg-accent-100 active:text-accent-800",
					"dark:text-accent-400",
					"dark:hover:text-accent-300 dark:hover:bg-accent-900/50 dark:focus-visible:text-accent-300 dark:focus-visible:bg-accent-900/50",
					"dark:active:bg-accent-900 dark:active:text-accent-200",
					"after:hidden",
					"focus-visible:ring-accent-500",
				],
			},
			{
				variant: "plain",
				color: "success",
				className: [
					"bg-transparent text-success-600",
					"hover:text-success-700 hover:bg-success-50 focus-visible:text-success-700 focus-visible:bg-success-50",
					"active:bg-success-100 active:text-success-800",
					"dark:text-success-400",
					"dark:hover:text-success-300 dark:hover:bg-success-900/50 dark:focus-visible:text-success-300 dark:focus-visible:bg-success-900/50",
					"dark:active:bg-success-900 dark:active:text-success-200",
					"after:hidden",
					"focus-visible:ring-success-500",
				],
			},
			{
				variant: "plain",
				color: "warning",
				className: [
					"bg-transparent text-warning-600",
					"hover:text-warning-700 hover:bg-warning-50 focus-visible:text-warning-700 focus-visible:bg-warning-50",
					"active:bg-warning-100 active:text-warning-800",
					"dark:text-warning-400",
					"dark:hover:text-warning-300 dark:hover:bg-warning-900/50 dark:focus-visible:text-warning-300 dark:focus-visible:bg-warning-900/50",
					"dark:active:bg-warning-900 dark:active:text-warning-200",
					"after:hidden",
					"focus-visible:ring-warning-500",
				],
			},
			{
				variant: "plain",
				color: "info",
				className: [
					"bg-transparent text-info-600",
					"hover:text-info-700 hover:bg-info-50 focus-visible:text-info-700 focus-visible:bg-info-50",
					"active:bg-info-100 active:text-info-800",
					"dark:text-info-400",
					"dark:hover:text-info-300 dark:hover:bg-info-900/50 dark:focus-visible:text-info-300 dark:focus-visible:bg-info-900/50",
					"dark:active:bg-info-900 dark:active:text-info-200",
					"after:hidden",
					"focus-visible:ring-info-500",
				],
			},
			{
				variant: "plain",
				color: "destructive",
				className: [
					"bg-transparent text-destructive-600",
					"hover:text-destructive-700 hover:bg-destructive-50 focus-visible:text-destructive-700 focus-visible:bg-destructive-50",
					"active:bg-destructive-100 active:text-destructive-800",
					"dark:text-destructive-400",
					"dark:hover:text-destructive-300 dark:hover:bg-destructive-900/50 dark:focus-visible:text-destructive-300 dark:focus-visible:bg-destructive-900/50",
					"dark:active:bg-destructive-900 dark:active:text-destructive-200",
					"after:hidden",
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
	/** Composition slot for high-level UI orchestration (e.g. Next.js Link) */
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

		// Memoize animation states to prevent recreation on every render
		const motionProps = useMemo(() => {
			if (isDisabled) {
				return {
					initial: interactionStates.rest,
					animate: interactionStates.rest,
				};
			}
			return {
				initial: interactionStates.rest,
				whileHover: interactionStates.hover,
				whileTap: interactionStates.tap,
				transition: springs.precision,
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
