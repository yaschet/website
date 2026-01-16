"use client";

import { cn } from "@library/utils";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cva, type VariantProps } from "class-variance-authority";
import { AnimatePresence, type HTMLMotionProps, motion } from "motion/react";
import type * as React from "react";
import { useControlledState } from "@/src/hooks/use-controlled-state";
import { getStrictContext } from "@/src/lib/get-strict-context";

/**
 * Toggle component - Standalone version cloned from Animate UI
 * 100% replica of @animate-ui/components-radix-toggle functionality
 *
 * This is a self-contained implementation that doesn't depend on animate-ui folder.
 */

// ============================================================================
// PRIMITIVES (Inline from animate-ui/primitives/radix/toggle.tsx)
// ============================================================================

type ToggleContextType = {
	isPressed: boolean;
	setIsPressed: (isPressed: boolean) => void;
	disabled?: boolean;
};

const [TogglePrimitiveProvider, useTogglePrimitive] =
	getStrictContext<ToggleContextType>("ToggleContext");

type TogglePrimitiveProps = Omit<React.ComponentProps<typeof TogglePrimitive.Root>, "asChild"> &
	HTMLMotionProps<"button">;

function ToggleRoot({
	defaultPressed,
	disabled,
	onPressedChange,
	pressed,
	...props
}: TogglePrimitiveProps) {
	const [isPressed, setIsPressed] = useControlledState({
		value: pressed,
		defaultValue: defaultPressed,
		onChange: onPressedChange,
	});

	return (
		<TogglePrimitiveProvider value={{ isPressed, setIsPressed, disabled }}>
			<TogglePrimitive.Root
				asChild
				defaultPressed={defaultPressed}
				disabled={disabled}
				pressed={pressed}
				onPressedChange={setIsPressed}
			>
				<motion.button data-slot="toggle" whileTap={{ scale: 0.95 }} {...props} />
			</TogglePrimitive.Root>
		</TogglePrimitiveProvider>
	);
}

type ToggleHighlightPrimitiveProps = HTMLMotionProps<"div">;

function _ToggleHighlightPrimitive({ style, ...props }: ToggleHighlightPrimitiveProps) {
	const { disabled, isPressed } = useTogglePrimitive();

	return (
		<AnimatePresence>
			{isPressed && (
				<motion.div
					animate={{ opacity: 1 }}
					aria-pressed={isPressed}
					data-disabled={disabled}
					data-slot="toggle-highlight"
					data-state={isPressed ? "on" : "off"}
					exit={{ opacity: 0 }}
					initial={{ opacity: 0 }}
					style={{ position: "absolute", zIndex: 0, inset: 0, ...style }}
					{...props}
				/>
			)}
		</AnimatePresence>
	);
}

type ToggleItemPrimitiveProps = HTMLMotionProps<"div">;

function _ToggleItemPrimitive({ style, ...props }: ToggleItemPrimitiveProps) {
	const { disabled, isPressed } = useTogglePrimitive();

	return (
		<motion.div
			aria-pressed={isPressed}
			data-disabled={disabled}
			data-slot="toggle-item"
			data-state={isPressed ? "on" : "off"}
			style={{ position: "relative", zIndex: 1, ...style }}
			{...props}
		/>
	);
}

// ============================================================================
// COMPONENT (From animate-ui/components/radix/toggle.tsx)
// ============================================================================

const toggleVariants = cva(
	"isolate inline-flex items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-full font-bold text-sm outline-none transition-all duration-200 ease-out after:pointer-events-none after:absolute after:inset-0 after:-z-10 after:transition-opacity after:duration-200 after:ease-out after:content-[''] focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-0 disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:outline-primary-500 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
	{
		variants: {
			variant: {
				default:
					"bg-transparent text-surface-600 hover:bg-surface-100 data-[state=on]:bg-primary-950 data-[state=on]:text-primary-50 data-[state=on]:active:bg-primary-800 data-[state=on]:hover:bg-primary-900 data-[state=on]:after:bg-gradient-to-br data-[state=on]:after:from-primary-300/40 data-[state=on]:after:via-primary-400/20 data-[state=on]:after:to-transparent data-[state=on]:after:opacity-75 data-[state=on]:active:after:opacity-85 data-[state=on]:hover:after:opacity-95 dark:text-surface-400 dark:data-[state=on]:bg-primary-50 dark:data-[state=on]:text-primary-950 dark:data-[state=on]:active:bg-primary-100 dark:hover:bg-surface-900 dark:data-[state=on]:hover:bg-primary-200",
				outline:
					"border border-input bg-transparent shadow-xs hover:bg-surface-100 data-[state=on]:border-primary-500 data-[state=on]:bg-primary-950 data-[state=on]:text-primary-50 dark:hover:bg-surface-900",
			},
			size: {
				default: "h-9 min-w-9 px-4",
				sm: "h-8 min-w-8 px-3",
				lg: "h-10 min-w-10 px-5",
				icon: "size-9",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

type ToggleProps = TogglePrimitiveProps &
	ToggleItemPrimitiveProps &
	VariantProps<typeof toggleVariants>;

function Toggle({
	className,
	defaultPressed,
	disabled,
	onPressedChange,
	pressed,
	size,
	variant,
	...props
}: ToggleProps) {
	return (
		<ToggleRoot
			className={cn(toggleVariants({ variant, size, className }))}
			defaultPressed={defaultPressed}
			disabled={disabled}
			pressed={pressed}
			onPressedChange={onPressedChange}
			{...props}
		/>
	);
}

export { Toggle, toggleVariants, type ToggleProps };
