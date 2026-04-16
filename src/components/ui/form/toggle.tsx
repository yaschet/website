"use client";

import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cva, type VariantProps } from "class-variance-authority";
import { type HTMLMotionProps, motion } from "motion/react";
import type * as React from "react";
import { useControlledState } from "@/src/hooks/use-controlled-state";
import { getStrictContext } from "@/src/lib/get-strict-context";
import { cn } from "@/src/lib/index";

type ToggleContextType = {
	isPressed: boolean;
	setIsPressed: (isPressed: boolean) => void;
	disabled?: boolean;
};

const [TogglePrimitiveProvider] = getStrictContext<ToggleContextType>("ToggleContext");

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

const toggleVariants = cva(
	"isolate inline-flex items-center justify-center gap-[var(--portfolio-control-gap)] overflow-hidden whitespace-nowrap rounded-full font-medium outline-none transition-all duration-200 ease-out after:pointer-events-none after:absolute after:inset-0 after:-z-10 after:transition-opacity after:duration-200 after:ease-out after:content-[''] focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-0 disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:outline-primary-500 [&_svg:not([class*='size-'])]:size-[var(--portfolio-icon-sm)] [&_svg]:pointer-events-none [&_svg]:shrink-0",
	{
		variants: {
			variant: {
				default:
					"bg-transparent text-surface-600 hover:bg-surface-100 data-[state=on]:bg-primary-950 data-[state=on]:text-primary-50 data-[state=on]:active:bg-primary-800 data-[state=on]:hover:bg-primary-900 data-[state=on]:after:bg-gradient-to-br data-[state=on]:after:from-primary-300/40 data-[state=on]:after:via-primary-400/20 data-[state=on]:after:to-transparent data-[state=on]:after:opacity-75 data-[state=on]:active:after:opacity-85 data-[state=on]:hover:after:opacity-95 dark:text-surface-400 dark:data-[state=on]:bg-primary-50 dark:data-[state=on]:text-primary-950 dark:data-[state=on]:active:bg-primary-100 dark:hover:bg-surface-900 dark:data-[state=on]:hover:bg-primary-200",
				outline:
					"border border-input bg-transparent shadow-xs hover:bg-surface-100 data-[state=on]:border-primary-500 data-[state=on]:bg-primary-950 data-[state=on]:text-primary-50 dark:hover:bg-surface-900",
			},
			size: {
				default:
					"portfolio-control-label h-[var(--portfolio-control-default)] min-w-[var(--portfolio-control-default)] px-[var(--portfolio-control-pad-default)]",
				sm: "portfolio-chip-label h-[var(--portfolio-control-compact)] min-w-[var(--portfolio-control-compact)] px-[var(--portfolio-control-pad-compact)]",
				lg: "portfolio-control-label h-[var(--portfolio-control-prominent)] min-w-[var(--portfolio-control-prominent)] px-[var(--portfolio-control-pad-prominent)]",
				icon: "size-[var(--portfolio-control-default)] px-0",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

type ToggleProps = TogglePrimitiveProps & VariantProps<typeof toggleVariants>;

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

export { Toggle, type ToggleProps, toggleVariants };
