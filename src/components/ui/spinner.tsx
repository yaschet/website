/**
 * Spinner component.
 *
 * @remarks
 * Uses SVG and CSS animations to create a "drawing square" effect.
 * Matches the system loading state design.
 *
 * @example
 * ```tsx
 * <Spinner size="md" color="primary" />
 * ```
 *
 * @public
 */

"use client";

import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "@/src/lib/index";

const spinnerVariants = cva("relative block", {
	variants: {
		size: {
			xs: "size-4",
			sm: "size-6",
			md: "size-8",
			lg: "size-12",
			xl: "size-16",
		},
		color: {
			default: "text-foreground",
			primary: "text-primary-500",
			secondary: "text-secondary-500",
			accent: "text-accent-500",
			info: "text-info-500",
			success: "text-success-500",
			warning: "text-warning-500",
			destructive: "text-destructive-500",
			white: "text-white",
		},
	},
	defaultVariants: {
		size: "md",
		color: "default",
	},
});

const colorMap = {
	default: "text-foreground",
	primary: "text-primary-500",
	secondary: "text-secondary-500",
	accent: "text-accent-500",
	info: "text-info-500",
	success: "text-success-500",
	warning: "text-warning-500",
	destructive: "text-destructive-500",
	white: "text-white",
} as const;

export interface SpinnerProps
	extends Omit<React.SVGProps<SVGSVGElement>, "color" | "size">,
		Omit<VariantProps<typeof spinnerVariants>, "size" | "color"> {
	/** Size preset or custom pixel value (e.g., 32, 48) */
	size?: "xs" | "sm" | "md" | "lg" | "xl" | number;
	/** Color variant */
	color?:
		| "default"
		| "primary"
		| "secondary"
		| "accent"
		| "info"
		| "success"
		| "warning"
		| "destructive"
		| "white";
	className?: string;
}

export function Spinner({ className, size = "md", color, ...props }: SpinnerProps) {
	const isPreset = typeof size === "string";
	const resolvedColor = (color || "default") as keyof typeof colorMap;

	if (isPreset) {
		// Preset size: use full CVA
		return (
			<svg
				viewBox="0 0 24 24"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				className={cn(spinnerVariants({ size, color }), className)}
				{...props}
			>
				<title>Loading</title>
				{/* Track */}
				<rect
					x="2"
					y="2"
					width="20"
					height="20"
					className="stroke-current opacity-10"
					strokeWidth="2"
				/>
				{/* Indicator */}
				<rect
					x="2"
					y="2"
					width="20"
					height="20"
					className="origin-center animate-draw-square stroke-current"
					strokeWidth="2"
					strokeDasharray="80"
					strokeDashoffset="80"
					strokeLinecap="square"
				/>
			</svg>
		);
	}

	// Numeric size: apply dimensions inline, color via map
	const colorClass = colorMap[resolvedColor];
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={cn("relative block", colorClass, className)}
			style={{ width: `${size}px`, height: `${size}px` }}
			{...props}
		>
			<title>Loading</title>
			{/* Track */}
			<rect
				x="2"
				y="2"
				width="20"
				height="20"
				className="stroke-current opacity-10"
				strokeWidth="2"
			/>
			{/* Indicator */}
			<rect
				x="2"
				y="2"
				width="20"
				height="20"
				className="origin-center animate-draw-square stroke-current"
				strokeWidth="2"
				strokeDasharray="80"
				strokeDashoffset="80"
				strokeLinecap="square"
			/>
		</svg>
	);
}
