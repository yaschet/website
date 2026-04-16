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
				"group/toggle-group flex w-fit items-center gap-[calc(var(--portfolio-space-tight)/2)] rounded-xl bg-surface-100 p-[calc(var(--portfolio-space-tight)/2)] dark:bg-surface-900",
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
				"inline-flex items-center justify-center gap-[var(--portfolio-control-gap)] whitespace-nowrap rounded-lg font-medium",
				"cursor-pointer transition-all duration-200 ease-out",
				"disabled:pointer-events-none disabled:opacity-50",
				"focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-0",
				"text-surface-600 dark:text-surface-400",
				"hover:bg-surface-100/50 dark:hover:bg-surface-800/50",
				"data-[state=on]:bg-primary-950 data-[state=on]:text-primary-50",
				"dark:data-[state=on]:bg-primary-50 dark:data-[state=on]:text-primary-950",
				"data-[state=on]:hover:bg-primary-900 dark:data-[state=on]:hover:bg-primary-100",
				contextSize === "sm" &&
					"portfolio-chip-label h-[var(--portfolio-control-compact)] min-w-[var(--portfolio-control-compact)] px-[var(--portfolio-control-pad-compact)]",
				contextSize === "default" &&
					"portfolio-control-label h-[var(--portfolio-control-default)] min-w-[var(--portfolio-control-default)] px-[var(--portfolio-control-pad-default)]",
				contextSize === "lg" &&
					"portfolio-control-label h-[var(--portfolio-control-prominent)] min-w-[var(--portfolio-control-prominent)] px-[var(--portfolio-control-pad-prominent)]",
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
