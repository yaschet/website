/**
 * ToggleGroup component.
 *
 * @remarks
 * Built on Radix UI's ToggleGroup primitive.
 *
 * @example
 * ```tsx
 * <ToggleGroup type="multiple">
 *   <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
 *   <ToggleGroupItem value="italic">Italic</ToggleGroupItem>
 * </ToggleGroup>
 * ```
 *
 * @public
 */

import {
	ToggleGroupItem as ToggleGroupItemPrimitive,
	type ToggleGroupItemProps as ToggleGroupItemPrimitiveProps,
	ToggleGroup as ToggleGroupPrimitive,
	type ToggleGroupProps as ToggleGroupPrimitiveProps,
} from "@components/ui/primitives/toggle-group-primitive";
import type { VariantProps } from "class-variance-authority";
import { getStrictContext } from "@/src/lib/get-strict-context";
import { cn } from "@/src/lib/index";
import type { toggleVariants } from "./toggle";

const [ToggleGroupProvider, useToggleGroup] =
	getStrictContext<VariantProps<typeof toggleVariants>>("ToggleGroupContext");

type ToggleGroupProps = ToggleGroupPrimitiveProps & VariantProps<typeof toggleVariants>;

function ToggleGroup({ children, className, size, variant, ...props }: ToggleGroupProps) {
	return (
		<ToggleGroupPrimitive
			className={cn(
				"group/toggle-group flex w-fit items-center gap-0.5 rounded-xl bg-surface-100 p-0.5 dark:bg-surface-900",
				"data-[variant=outline]:border data-[variant=outline]:border-surface-200 data-[variant=outline]:shadow-xs dark:data-[variant=outline]:border-surface-800",
				className,
			)}
			data-size={size}
			data-variant={variant}
			{...props}
		>
			<ToggleGroupProvider value={{ variant, size }}>{children}</ToggleGroupProvider>
		</ToggleGroupPrimitive>
	);
}

type ToggleGroupItemProps = ToggleGroupItemPrimitiveProps & VariantProps<typeof toggleVariants>;

function ToggleGroupItem({ children, className, size, variant, ...props }: ToggleGroupItemProps) {
	const { size: contextSize, variant: contextVariant } = useToggleGroup();

	return (
		<ToggleGroupItemPrimitive
			className={cn(
				// Base styles for all toggle group items
				"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-bold text-sm",
				"cursor-pointer transition-all duration-200 ease-out",
				"disabled:pointer-events-none disabled:opacity-50",
				"focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-0",

				// Inactive state - subtle text
				"text-surface-600 dark:text-surface-400",
				"hover:bg-surface-100/50 dark:hover:bg-surface-800/50",

				// Active state - primary colors with proper contrast
				"data-[state=on]:bg-primary-950 data-[state=on]:text-primary-50",
				"dark:data-[state=on]:bg-primary-50 dark:data-[state=on]:text-primary-950",
				"data-[state=on]:hover:bg-primary-900 dark:data-[state=on]:hover:bg-primary-100",

				// Size variants
				contextSize === "sm" && "h-7 min-w-7 px-2.5",
				contextSize === "default" && "h-8 min-w-8 px-3",
				contextSize === "lg" && "h-9 min-w-9 px-4",

				"relative min-w-0 flex-1 shrink-0 border-0 shadow-none focus:z-10 focus-visible:z-10",
				className,
			)}
			data-size={contextSize || size}
			data-variant={contextVariant || variant}
			{...props}
		>
			{children}
		</ToggleGroupItemPrimitive>
	);
}

export { ToggleGroup, ToggleGroupItem, type ToggleGroupItemProps, type ToggleGroupProps };
