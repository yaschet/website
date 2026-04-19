/**
 * Dropdown menu component.
 *
 * @remarks
 * Built on Radix UI's DropdownMenu primitive.
 *
 * @example
 * ```tsx
 * <DropdownMenu>
 *   <DropdownMenuTrigger>Open</DropdownMenuTrigger>
 *   <DropdownMenuContent>
 *     <DropdownMenuItem>Item</DropdownMenuItem>
 *   </DropdownMenuContent>
 * </DropdownMenu>
 * ```
 *
 * @public
 */

"use client";

import { CaretRightIcon, CheckIcon } from "@phosphor-icons/react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cva } from "class-variance-authority";
import * as React from "react";

import { Button, type ButtonProps } from "@/src/components/ui/button";
import { cn } from "@/src/lib/index";

// ═══════════════════════════════════════════════════════════════════════════
// CONTEXT & TYPES
// ═══════════════════════════════════════════════════════════════════════════

type DropdownMenuSize = "xs" | "sm" | "md" | "lg" | "xl";

const DropdownMenuContext = React.createContext<{ size: DropdownMenuSize }>({
	size: "md",
});

export const useDropdownMenuSize = () => React.useContext(DropdownMenuContext).size;

// ═══════════════════════════════════════════════════════════════════════════
// VARIANTS
// ═══════════════════════════════════════════════════════════════════════════

const dropdownMenuItemVariants = cva(
	[
		"relative flex size-auto flex-1 cursor-pointer select-none flex-row items-center justify-start gap-2 whitespace-nowrap outline-none",
		"transform-gpu transition-all duration-75 ease-in-out active:scale-[0.98]",
		"focus:bg-surface-200 focus:text-surface-800 dark:focus:bg-surface-900 dark:focus:text-surface-50",
		"data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
		"[&_svg]:pointer-events-none [&_svg]:shrink-0",
	],
	{
		variants: {
			size: {
				xs: "rounded-[var(--radius-xs)] px-2.5 py-1 font-medium text-xs [&_svg]:size-3.5",
				sm: "rounded-[var(--radius-sm)] px-3 py-1.5 font-medium text-xs [&_svg]:size-4",
				md: "rounded-[var(--radius)] px-4 py-2 font-medium text-sm [&_svg]:size-5",
				lg: "rounded-[var(--radius-md)] px-5 py-2.5 font-medium text-sm [&_svg]:size-5",
				xl: "rounded-[var(--radius-lg)] px-6 py-3 font-medium text-lg [&_svg]:size-6",
			},
			inset: {
				true: "pl-8",
				false: "",
			},
		},
		defaultVariants: {
			size: "md",
			inset: false,
		},
	},
);

const dropdownMenuContentVariants = cva(
	[
		"z-50 mt-1 flex min-w-[8rem] flex-col overflow-hidden border border-border bg-surface-2 text-foreground shadow-lg dark:bg-surface-950",
		"data-[state=closed]:animate-out data-[state=open]:animate-in",
		"data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
		"data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
	],
	{
		variants: {
			size: {
				xs: "rounded-[var(--radius-sm)] p-1.5",
				sm: "rounded-[var(--radius-md)] p-2",
				md: "rounded-[var(--radius)] p-3",
				lg: "rounded-[var(--radius-xl)] p-4",
				xl: "rounded-[var(--radius-xl)] p-5",
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

const DropdownMenuGroup = DropdownMenuPrimitive.Group;
const DropdownMenuPortal = DropdownMenuPrimitive.Portal;
const DropdownMenuSub = DropdownMenuPrimitive.Sub;
const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

/**
 * DropdownMenu - Root component.
 */
const DropdownMenu = ({
	size = "md",
	...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Root> & {
	size?: DropdownMenuSize;
}) => {
	return (
		<DropdownMenuContext.Provider value={{ size }}>
			<DropdownMenuPrimitive.Root {...props} />
		</DropdownMenuContext.Provider>
	);
};

/**
 * DropdownMenuTrigger - Toggles the menu.
 */
const DropdownMenuTrigger = React.forwardRef<
	React.ElementRef<typeof DropdownMenuPrimitive.Trigger>,
	React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Trigger>
>((props, ref) => <DropdownMenuPrimitive.Trigger ref={ref} {...props} />);

/**
 * DropdownMenuTriggerButton - Button style trigger.
 */
export const DropdownMenuTriggerButton = React.forwardRef<
	HTMLButtonElement,
	ButtonProps & { asChild?: boolean }
>(({ size: propSize, ...props }, ref) => {
	const menuSize = useDropdownMenuSize();
	const size = propSize ?? menuSize;
	return (
		<DropdownMenuTrigger asChild>
			<Button ref={ref} size={size} {...props} />
		</DropdownMenuTrigger>
	);
});

/**
 * DropdownMenuContent - Menu container.
 */
const DropdownMenuContent = React.forwardRef<
	React.ComponentRef<typeof DropdownMenuPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content> & {
		sideOffset?: number;
	}
>(({ className, sideOffset = 4, ...props }, ref) => {
	const size = useDropdownMenuSize();
	return (
		<DropdownMenuPortal>
			<DropdownMenuPrimitive.Content
				ref={ref}
				className={cn(dropdownMenuContentVariants({ size }), className)}
				sideOffset={sideOffset}
				{...props}
			/>
		</DropdownMenuPortal>
	);
});

/**
 * DropdownMenuItem - Action item.
 */
const DropdownMenuItem = React.forwardRef<
	React.ComponentRef<typeof DropdownMenuPrimitive.Item>,
	React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
		inset?: boolean;
	}
>(({ className, inset, ...props }, ref) => {
	const size = useDropdownMenuSize();
	return (
		<DropdownMenuPrimitive.Item
			ref={ref}
			className={cn(dropdownMenuItemVariants({ size, inset }), className)}
			{...props}
		/>
	);
});

/**
 * DropdownMenuSubTrigger - Trigger for nested sub-menus.
 */
const DropdownMenuSubTrigger = React.forwardRef<
	React.ComponentRef<typeof DropdownMenuPrimitive.SubTrigger>,
	React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
		inset?: boolean;
	}
>(({ children, className, inset, ...props }, ref) => {
	const size = useDropdownMenuSize();
	return (
		<DropdownMenuPrimitive.SubTrigger
			ref={ref}
			className={cn(dropdownMenuItemVariants({ size, inset }), className)}
			{...props}
		>
			{children}
			<CaretRightIcon className="ml-auto size-[1.2em]" weight="bold" />
		</DropdownMenuPrimitive.SubTrigger>
	);
});

/**
 * DropdownMenuSubContent - Container for nested sub-menus.
 */
const DropdownMenuSubContent = React.forwardRef<
	React.ComponentRef<typeof DropdownMenuPrimitive.SubContent>,
	React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => {
	const size = useDropdownMenuSize();
	return (
		<DropdownMenuPrimitive.SubContent
			ref={ref}
			className={cn(dropdownMenuContentVariants({ size }), className)}
			{...props}
		/>
	);
});

/**
 * DropdownMenuCheckboxItem - Entry with integrated boolean state.
 */
const DropdownMenuCheckboxItem = React.forwardRef<
	React.ComponentRef<typeof DropdownMenuPrimitive.CheckboxItem>,
	React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ checked, children, className, ...props }, ref) => {
	const size = useDropdownMenuSize();
	return (
		<DropdownMenuPrimitive.CheckboxItem
			ref={ref}
			checked={checked}
			className={cn(dropdownMenuItemVariants({ size }), className)}
			{...props}
		>
			<span className="flex size-[1em] items-center justify-center">
				<DropdownMenuPrimitive.ItemIndicator>
					<CheckIcon className="size-full" weight="bold" />
				</DropdownMenuPrimitive.ItemIndicator>
			</span>
			{children}
		</DropdownMenuPrimitive.CheckboxItem>
	);
});

/**
 * DropdownMenuRadioItem - Entry within a mutually exclusive group.
 */
const DropdownMenuRadioItem = React.forwardRef<
	React.ComponentRef<typeof DropdownMenuPrimitive.RadioItem>,
	React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem> & {
		hideIndicator?: boolean;
		disableIndicatorPadding?: boolean;
	}
>(
	(
		{ children, className, disableIndicatorPadding = false, hideIndicator = false, ...props },
		ref,
	) => {
		const size = useDropdownMenuSize();
		return (
			<DropdownMenuPrimitive.RadioItem
				ref={ref}
				className={cn(dropdownMenuItemVariants({ size }), className)}
				{...props}
			>
				{!hideIndicator ? (
					<span className="absolute left-2 flex size-[1em] items-center justify-center">
						<DropdownMenuPrimitive.ItemIndicator>
							<CheckIcon className="size-full" weight="bold" />
						</DropdownMenuPrimitive.ItemIndicator>
					</span>
				) : null}
				<span className={cn(!hideIndicator && !disableIndicatorPadding && "pl-6")}>
					{children}
				</span>
			</DropdownMenuPrimitive.RadioItem>
		);
	},
);

/**
 * DropdownMenuLabel - Descriptive label for menu sections.
 */
const DropdownMenuLabel = React.forwardRef<
	React.ComponentRef<typeof DropdownMenuPrimitive.Label>,
	React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
		inset?: boolean;
	}
>(({ className, inset, ...props }, ref) => (
	<DropdownMenuPrimitive.Label
		ref={ref}
		className={cn(
			"px-4 py-2 font-bold text-muted-foreground/60 text-xs uppercase tracking-wider",
			inset && "pl-8",
			className,
		)}
		{...props}
	/>
));

/**
 * DropdownMenuSeparator - Horizontal line for menu segmentation.
 */
const DropdownMenuSeparator = React.forwardRef<
	React.ComponentRef<typeof DropdownMenuPrimitive.Separator>,
	React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
	<DropdownMenuPrimitive.Separator
		ref={ref}
		className={cn("-mx-1 my-1 h-px bg-border", className)}
		{...props}
	/>
));

/**
 * DropdownMenuShortcut - Semantic keyboard shortcut indicator.
 */
function DropdownMenuShortcut({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
	return (
		<span
			className={cn("ml-auto font-mono text-[10px] tracking-widest opacity-50", className)}
			{...props}
		/>
	);
}

export {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuPortal,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
};
