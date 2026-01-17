/**
 * Checkbox Component
 *
 * A control that allows the user to toggle between checked and not checked.
 */

"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "motion/react";
import * as React from "react";

import { cn } from "@/src/lib/utils";

// ═══════════════════════════════════════════════════════════════════════════
// VARIANTS
// ═══════════════════════════════════════════════════════════════════════════

const checkboxVariants = cva(
	[
		"peer flex shrink-0 items-center justify-center outline-none transition-all duration-200",
		"focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
		"disabled:cursor-not-allowed disabled:opacity-50",
	],
	{
		variants: {
			variant: {
				default:
					"border border-input bg-background data-[state=checked]:bg-surface-950 dark:data-[state=checked]:bg-surface-50",
				accent: "border-0 bg-input data-[state=checked]:bg-primary",
				primary:
					"border border-primary/30 bg-background data-[state=checked]:border-primary data-[state=checked]:bg-primary",
				success:
					"border border-success/30 bg-background data-[state=checked]:border-success data-[state=checked]:bg-success",
				warning:
					"border border-warning/30 bg-background data-[state=checked]:border-warning data-[state=checked]:bg-warning",
				destructive:
					"border border-destructive/30 bg-background data-[state=checked]:border-destructive data-[state=checked]:bg-destructive",
			},
			size: {
				sm: "size-4",
				md: "size-5", // Default
				lg: "size-6",
			},
			shape: {
				none: "rounded-none",
				xs: "rounded-[var(--radius-xs)]",
				sm: "rounded-[var(--radius-sm)]",
				md: "rounded-[var(--radius-md)]",
				lg: "rounded-[var(--radius-lg)]",
				full: "rounded-[var(--radius-full)]",
				// Default maps to --radius which is 0px in "The Blade" system
				default: "rounded-[var(--radius)]",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "md",
			shape: "default",
		},
	},
);

const getIndicatorSize = (size: CheckboxProps["size"]) => {
	if (size === "sm") return 12;
	if (size === "lg") return 16;
	return 14;
};

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface CheckboxProps
	extends Omit<
			React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>,
			"color" | "asChild"
		>,
		VariantProps<typeof checkboxVariants> {
	/** Indeterminate state (tri-state) support */
	indeterminate?: boolean;
	/** NextUI Compatibility: alias for checked */
	isSelected?: boolean;
	/** NextUI Compatibility: alias for disabled */
	isDisabled?: boolean;
	/** NextUI Compatibility: callback alias */
	onValueChange?: (checked: boolean) => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Checkbox
 *
 * A control that allows the user to toggle between checked and not checked.
 */
const Checkbox = React.forwardRef<React.ElementRef<typeof CheckboxPrimitive.Root>, CheckboxProps>(
	(
		{
			checked,
			className,
			disabled,
			indeterminate,
			isDisabled,
			isSelected,
			onCheckedChange,
			onValueChange,
			size,
			variant,
			shape,
			...props
		},
		ref,
	) => {
		const isChecked = checked ?? isSelected;
		const isBtnDisabled = disabled ?? isDisabled;

		const handleCheckedChange = (state: CheckboxPrimitive.CheckedState) => {
			onCheckedChange?.(state);
			if (typeof state === "boolean") onValueChange?.(state);
		};

		const iconSize = getIndicatorSize(size);

		return (
			<CheckboxPrimitive.Root
				ref={ref}
				asChild
				checked={indeterminate ? "indeterminate" : isChecked}
				className={cn(checkboxVariants({ variant, size, shape }), className)}
				disabled={isBtnDisabled}
				onCheckedChange={handleCheckedChange}
				{...props}
			>
				<motion.button
					type="button"
					whileHover={{ scale: isBtnDisabled ? 1 : 1.05 }}
					whileTap={{ scale: isBtnDisabled ? 1 : 0.95 }}
				>
					<CheckboxPrimitive.Indicator
						asChild
						forceMount
						className="flex items-center justify-center p-0.5"
					>
						<motion.svg
							aria-hidden="true"
							fill="none"
							height={iconSize}
							initial={false}
							stroke="currentColor"
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="4"
							viewBox="0 0 24 24"
							width={iconSize}
							xmlns="http://www.w3.org/2000/svg"
						>
							{/* Path-drawing checkmark animation */}
							<motion.path
								animate={{
									pathLength: isChecked === true && !indeterminate ? 1 : 0,
									opacity: isChecked === true && !indeterminate ? 1 : 0,
								}}
								d="M4.5 12.75l6 6 9-13.5"
								initial={{ pathLength: 0, opacity: 0 }}
								transition={{ duration: 0.2, ease: "easeOut" }}
							/>

							{/* Indeterminate state animation */}
							<motion.line
								animate={{
									pathLength: indeterminate ? 1 : 0,
									opacity: indeterminate ? 1 : 0,
								}}
								initial={{ pathLength: 0, opacity: 0 }}
								transition={{ duration: 0.2 }}
								x1="5"
								x2="19"
								y1="12"
								y2="12"
							/>
						</motion.svg>
					</CheckboxPrimitive.Indicator>
				</motion.button>
			</CheckboxPrimitive.Root>
		);
	},
);

Checkbox.displayName = "Checkbox";

export { Checkbox };
