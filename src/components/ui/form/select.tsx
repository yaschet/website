"use client";

import { CaretDownIcon, CaretUpDownIcon, CaretUpIcon, CheckIcon } from "@phosphor-icons/react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { cva } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/src/lib/index";

type SelectSize = "xs" | "sm" | "md" | "lg" | "xl";

const SelectContext = React.createContext<{ size: SelectSize }>({
	size: "md",
});

const useSelectSize = () => React.useContext(SelectContext).size;

const selectTriggerVariants = cva(
	[
		"flex w-full items-center justify-between whitespace-nowrap border-2 border-surface-300 bg-white text-surface-900 shadow-none ring-offset-background transition-colors duration-200 dark:border-surface-700 dark:bg-surface-950 dark:text-surface-50",
		"hover:border-surface-900 hover:bg-white focus:outline-none focus:ring-2 focus:ring-ring dark:hover:border-surface-100 dark:hover:bg-surface-950",
		"disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
		"rounded-none",
	],
	{
		variants: {
			size: {
				xs: "portfolio-chip-label h-[var(--portfolio-control-compact)] px-[var(--portfolio-control-pad-compact)]",
				sm: "portfolio-control-label h-[var(--portfolio-control-default)] px-[var(--portfolio-control-pad-default)]",
				md: "portfolio-control-label h-[var(--portfolio-control-prominent)] px-[var(--portfolio-control-pad-default)]",
				lg: "portfolio-control-label h-[var(--portfolio-control-prominent)] px-[var(--portfolio-control-pad-default)]",
				xl: "portfolio-control-label h-[var(--portfolio-control-prominent)] px-[var(--portfolio-control-pad-default)]",
			},
		},
		defaultVariants: {
			size: "md",
		},
	},
);

const selectContentVariants = cva(
	[
		"relative z-50 max-h-60 min-w-[8rem] overflow-hidden border border-border bg-surface-2 text-popover-foreground shadow-lg dark:bg-surface-950",
		"data-[state=closed]:animate-out data-[state=open]:animate-in",
		"data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
		"data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
		"data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
	],
	{
		variants: {
			size: {
				xs: "rounded-none",
				sm: "rounded-none",
				md: "rounded-none",
				lg: "rounded-none",
				xl: "rounded-none",
			},
		},
		defaultVariants: {
			size: "md",
		},
	},
);

const selectItemVariants = cva(
	[
		"relative flex w-full cursor-default select-none flex-row items-center gap-2 outline-none",
		"transition-colors focus:bg-primary focus:text-primary-foreground",
		"data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
	],
	{
		variants: {
			size: {
				xs: "portfolio-chip-label rounded-none px-[var(--portfolio-control-pad-compact)] py-[calc(var(--portfolio-space-tight)/2)] pr-[calc(var(--portfolio-control-pad-compact)+var(--portfolio-icon-sm)+var(--portfolio-space-tight))]",
				sm: "portfolio-control-label rounded-none px-[var(--portfolio-control-pad-default)] py-[calc(var(--portfolio-space-tight)/2)] pr-[calc(var(--portfolio-control-pad-default)+var(--portfolio-icon-sm)+var(--portfolio-space-tight))]",
				md: "portfolio-control-label rounded-none px-[var(--portfolio-control-pad-default)] py-[var(--portfolio-space-tight)] pr-[calc(var(--portfolio-control-pad-default)+var(--portfolio-icon-sm)+var(--portfolio-space-tight))]",
				lg: "portfolio-control-label rounded-none px-[var(--portfolio-control-pad-default)] py-[var(--portfolio-space-tight)] pr-[calc(var(--portfolio-control-pad-default)+var(--portfolio-icon-sm)+var(--portfolio-space-tight))]",
				xl: "portfolio-control-label rounded-none px-[var(--portfolio-control-pad-default)] py-[var(--portfolio-space-tight)] pr-[calc(var(--portfolio-control-pad-default)+var(--portfolio-icon-sm)+var(--portfolio-space-tight))]",
			},
		},
		defaultVariants: {
			size: "md",
		},
	},
);

const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;

const Select: React.FC<
	React.ComponentProps<typeof SelectPrimitive.Root> & { size?: SelectSize }
> = ({ children, size = "md", ...props }) => (
	<SelectContext.Provider value={{ size }}>
		<SelectPrimitive.Root {...props}>{children}</SelectPrimitive.Root>
	</SelectContext.Provider>
);

const SelectTrigger = React.forwardRef<
	React.ComponentRef<typeof SelectPrimitive.Trigger>,
	React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & {
		size?: SelectSize;
	}
>(({ children, className, size: propSize, ...props }, ref) => {
	const contextSize = useSelectSize();
	const size = propSize || contextSize;

	return (
		<SelectPrimitive.Trigger
			ref={ref}
			className={cn(selectTriggerVariants({ size }), className)}
			{...props}
		>
			{children}
			<SelectPrimitive.Icon asChild>
				<CaretUpDownIcon
					className={cn(
						"opacity-50 transition-transform duration-200",
						size === "xs" && "size-[14px]",
						size === "sm" && "size-4",
						(size === "md" || size === "lg" || size === "xl") &&
							"size-[var(--portfolio-icon-sm)]",
					)}
					weight="bold"
				/>
			</SelectPrimitive.Icon>
		</SelectPrimitive.Trigger>
	);
});

const SelectContent = React.forwardRef<
	React.ComponentRef<typeof SelectPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> & {
		position?: "popper" | "static";
	}
>(({ children, className, position = "popper", ...props }, ref) => {
	const size = useSelectSize();

	return (
		<SelectPrimitive.Portal>
			<SelectPrimitive.Content
				ref={ref}
				className={cn(
					selectContentVariants({ size }),
					position === "popper" && "w-[var(--radix-select-trigger-width)] translate-y-1",
					className,
				)}
				position={position}
				{...props}
			>
				<SelectScrollUpButton />
				<SelectPrimitive.Viewport
					className={cn(
						"p-1",
						position === "popper" && "w-full min-w-[var(--radix-select-trigger-width)]",
					)}
				>
					{children}
				</SelectPrimitive.Viewport>
				<SelectScrollDownButton />
			</SelectPrimitive.Content>
		</SelectPrimitive.Portal>
	);
});

const SelectItem = React.forwardRef<
	React.ComponentRef<typeof SelectPrimitive.Item>,
	React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ children, className, ...props }, ref) => {
	const size = useSelectSize();
	return (
		<SelectPrimitive.Item
			ref={ref}
			className={cn(selectItemVariants({ size }), className)}
			{...props}
		>
			<SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
			<span className="absolute right-2 flex size-[1em] items-center justify-center">
				<SelectPrimitive.ItemIndicator>
					<CheckIcon className="size-full" weight="bold" />
				</SelectPrimitive.ItemIndicator>
			</span>
		</SelectPrimitive.Item>
	);
});

/**
 * SelectScrollUpButton - Scroll up control for long lists.
 */
const SelectScrollUpButton = React.forwardRef<
	React.ComponentRef<typeof SelectPrimitive.ScrollUpButton>,
	React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>((props, ref) => (
	<SelectPrimitive.ScrollUpButton
		ref={ref}
		className="flex cursor-default items-center justify-center py-1 opacity-50 hover:opacity-100"
		{...props}
	>
		<CaretUpIcon className="size-4" weight="bold" />
	</SelectPrimitive.ScrollUpButton>
));

/**
 * SelectScrollDownButton - Scroll down control for long lists.
 */
const SelectScrollDownButton = React.forwardRef<
	React.ComponentRef<typeof SelectPrimitive.ScrollDownButton>,
	React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>((props, ref) => (
	<SelectPrimitive.ScrollDownButton
		ref={ref}
		className="flex cursor-default items-center justify-center py-1 opacity-50 hover:opacity-100"
		{...props}
	>
		<CaretDownIcon className="size-4" weight="bold" />
	</SelectPrimitive.ScrollDownButton>
));

/**
 * SelectLabel - Descriptive label for menu sections.
 */
const SelectLabel = React.forwardRef<
	React.ComponentRef<typeof SelectPrimitive.Label>,
	React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
	<SelectPrimitive.Label
		ref={ref}
		className={cn(
			"px-4 py-2 font-bold text-muted-foreground/60 text-xs uppercase tracking-wider",
			className,
		)}
		{...props}
	/>
));

/**
 * SelectSeparator - Horizontal line for menu segmentation.
 */
const SelectSeparator = React.forwardRef<
	React.ComponentRef<typeof SelectPrimitive.Separator>,
	React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
	<SelectPrimitive.Separator
		ref={ref}
		className={cn("-mx-1 my-1 h-px bg-border", className)}
		{...props}
	/>
));

export {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectScrollDownButton,
	SelectScrollUpButton,
	SelectSeparator,
	SelectTrigger,
	SelectValue,
};
