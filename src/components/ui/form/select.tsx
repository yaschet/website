/**
 * Select component for choosing from a list of items.
 *
 * @remarks
 * Built on Radix UI's Select primitive. Supports variable sizes and keyboard navigation.
 *
 * @example
 * ```tsx
 * <Select defaultValue="option-1">
 *   <SelectTrigger><SelectValue /></SelectTrigger>
 *   <SelectContent>
 *     <SelectItem value="option-1">Option 1</SelectItem>
 *   </SelectContent>
 * </Select>
 * ```
 *
 * @public
 */

"use client";

import { CaretDownIcon, CaretUpDownIcon, CaretUpIcon, CheckIcon } from "@phosphor-icons/react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { cva } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/src/lib/index";

// ═══════════════════════════════════════════════════════════════════════════
// CONTEXT & TYPES
// ═══════════════════════════════════════════════════════════════════════════

type SelectSize = "xs" | "sm" | "md" | "lg" | "xl";

const SelectContext = React.createContext<{ size: SelectSize }>({
	size: "md",
});

const useSelectSize = () => React.useContext(SelectContext).size;

// ═══════════════════════════════════════════════════════════════════════════
// VARIANTS
// ═══════════════════════════════════════════════════════════════════════════

const selectTriggerVariants = cva(
	[
		"flex w-full items-center justify-between whitespace-nowrap bg-surface-100 dark:bg-surface-900",
		"transitions-all border border-border shadow-none ring-offset-background duration-200 placeholder:text-muted",
		"hover:bg-surface-200 focus:outline-none focus:ring-2 focus:ring-ring dark:hover:bg-surface-800",
		"disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
	],
	{
		variants: {
			size: {
				xs: "h-7 rounded-[var(--radius-xs)] py-1 pr-1.5 pl-2.5 text-xs",
				sm: "h-8 rounded-[var(--radius-sm)] py-1.5 pr-2 pl-3 text-xs",
				md: "h-9 rounded-[var(--radius)] py-2 pr-2 pl-4 text-sm",
				lg: "h-10 rounded-[var(--radius-md)] py-2.5 pr-3 pl-5 text-sm",
				xl: "h-11 rounded-[var(--radius-lg)] py-3 pr-3 pl-6 text-lg",
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
				xs: "rounded-[var(--radius-sm)]",
				sm: "rounded-[var(--radius-md)]",
				md: "rounded-[var(--radius)]", // Default: 0px
				lg: "rounded-[var(--radius-xl)]",
				xl: "rounded-[var(--radius-xl)]",
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
				xs: "rounded-[var(--radius-xs)] px-2.5 py-1 pr-7 text-xs",
				sm: "rounded-[var(--radius-sm)] px-3 py-1.5 pr-6 text-xs",
				md: "rounded-[var(--radius)] px-4 py-2 pr-8 text-sm",
				lg: "rounded-[var(--radius-md)] px-5 py-2.5 pr-9 text-sm",
				xl: "rounded-[var(--radius-lg)] px-6 py-3 pr-10 text-lg",
			},
		},
		defaultVariants: {
			size: "md",
		},
	},
);

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;

/**
 * Select - Root component.
 */
const Select: React.FC<
	React.ComponentProps<typeof SelectPrimitive.Root> & { size?: SelectSize }
> = ({ children, size = "md", ...props }) => (
	<SelectContext.Provider value={{ size }}>
		<SelectPrimitive.Root {...props}>{children}</SelectPrimitive.Root>
	</SelectContext.Provider>
);

/**
 * SelectTrigger - The button that toggles the select menu.
 */
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
						size === "xs" && "size-3",
						size === "sm" && "size-3.5",
						size === "md" && "size-4",
						size === "lg" && "size-4",
						size === "xl" && "size-5",
					)}
					weight="bold"
				/>
			</SelectPrimitive.Icon>
		</SelectPrimitive.Trigger>
	);
});

/**
 * SelectContent - Container for the selectable options.
 */
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

/**
 * SelectItem - An individual option within the select menu.
 */
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
	SelectGroup,
	SelectValue,
	SelectTrigger,
	SelectContent,
	SelectLabel,
	SelectItem,
	SelectSeparator,
	SelectScrollUpButton,
	SelectScrollDownButton,
};
