/**
 * Context menu component (right-click menu).
 *
 * @remarks
 * Built on Radix UI's ContextMenu primitive.
 *
 * @example
 * ```tsx
 * <ContextMenu>
 *   <ContextMenuTrigger>Right click</ContextMenuTrigger>
 *   <ContextMenuContent>
 *     <ContextMenuItem>Item</ContextMenuItem>
 *   </ContextMenuContent>
 * </ContextMenu>
 * ```
 *
 * @public
 */

"use client";

import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import { CheckIcon, ChevronRightIcon, DotFilledIcon } from "@radix-ui/react-icons";
import * as React from "react";
import { cn } from "@/src/lib/index";

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

const ContextMenu = ContextMenuPrimitive.Root;
const ContextMenuTrigger = ContextMenuPrimitive.Trigger;
const ContextMenuGroup = ContextMenuPrimitive.Group;
const ContextMenuPortal = ContextMenuPrimitive.Portal;
const ContextMenuSub = ContextMenuPrimitive.Sub;
const ContextMenuRadioGroup = ContextMenuPrimitive.RadioGroup;

// ═══════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * ContextMenuSubTrigger - Trigger for submenus.
 */
const ContextMenuSubTrigger = React.forwardRef<
	React.ComponentRef<typeof ContextMenuPrimitive.SubTrigger>,
	React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubTrigger> & {
		inset?: boolean;
	}
>(({ children, className, inset, ...props }, ref) => (
	<ContextMenuPrimitive.SubTrigger
		ref={ref}
		className={cn(
			"flex cursor-default select-none items-center px-2 py-1.5 text-sm outline-none transition-colors",
			"focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
			"dark:data-[state=open]:bg-surface-900 dark:focus:bg-surface-900 dark:focus:text-surface-50",
			"rounded-[var(--radius-xs)]",
			inset && "pl-8",
			className,
		)}
		{...props}
	>
		{children}
		<ChevronRightIcon className="ml-auto size-4" />
	</ContextMenuPrimitive.SubTrigger>
));
ContextMenuSubTrigger.displayName = ContextMenuPrimitive.SubTrigger.displayName;

/**
 * ContextMenuSubContent - Container for submenus.
 */
const ContextMenuSubContent = React.forwardRef<
	React.ComponentRef<typeof ContextMenuPrimitive.SubContent>,
	React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
	<ContextMenuPrimitive.SubContent
		ref={ref}
		className={cn(
			"z-50 min-w-[8rem] overflow-hidden border border-border bg-popover p-1 text-popover-foreground shadow-lg",
			"rounded-[var(--radius)]",
			"fade-in-0 zoom-in-95 data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 animate-in data-[state=closed]:animate-out",
			"dark:border-surface-800 dark:bg-surface-950 dark:text-surface-50",
			className,
		)}
		{...props}
	/>
));
ContextMenuSubContent.displayName = ContextMenuPrimitive.SubContent.displayName;

/**
 * ContextMenuContent - Main menu container.
 */
const ContextMenuContent = React.forwardRef<
	React.ComponentRef<typeof ContextMenuPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Content>
>(({ className, ...props }, ref) => (
	<ContextMenuPrimitive.Portal>
		<ContextMenuPrimitive.Content
			ref={ref}
			className={cn(
				"z-50 min-w-[8rem] overflow-hidden border border-border bg-popover p-1 text-popover-foreground shadow-xl",
				"rounded-[var(--radius)]",
				"fade-in-0 zoom-in-95 data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 animate-in data-[state=closed]:animate-out",
				"dark:border-surface-800 dark:bg-surface-950 dark:text-surface-50",
				className,
			)}
			{...props}
		/>
	</ContextMenuPrimitive.Portal>
));
ContextMenuContent.displayName = ContextMenuPrimitive.Content.displayName;

/**
 * ContextMenuItem - Action item.
 */
const ContextMenuItem = React.forwardRef<
	React.ComponentRef<typeof ContextMenuPrimitive.Item>,
	React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Item> & {
		inset?: boolean;
	}
>(({ className, inset, ...props }, ref) => (
	<ContextMenuPrimitive.Item
		ref={ref}
		className={cn(
			"relative flex cursor-default select-none items-center px-3 py-2 text-sm outline-none transition-colors",
			"focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
			"dark:focus:bg-surface-900 dark:focus:text-surface-50",
			"rounded-[var(--radius-xs)]",
			inset && "pl-8",
			className,
		)}
		{...props}
	/>
));
ContextMenuItem.displayName = ContextMenuPrimitive.Item.displayName;

/**
 * ContextMenuCheckboxItem - Entry with integrated boolean state.
 */
const ContextMenuCheckboxItem = React.forwardRef<
	React.ComponentRef<typeof ContextMenuPrimitive.CheckboxItem>,
	React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.CheckboxItem>
>(({ checked, children, className, ...props }, ref) => (
	<ContextMenuPrimitive.CheckboxItem
		ref={ref}
		checked={checked}
		className={cn(
			"relative flex cursor-default select-none items-center py-1.5 pr-2 pl-8 text-sm outline-none transition-colors",
			"focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
			"dark:focus:bg-surface-900 dark:focus:text-surface-50",
			"rounded-[var(--radius-xs)]",
			className,
		)}
		{...props}
	>
		<span className="absolute left-2 flex size-3.5 items-center justify-center">
			<ContextMenuPrimitive.ItemIndicator>
				<CheckIcon className="size-4" />
			</ContextMenuPrimitive.ItemIndicator>
		</span>
		{children}
	</ContextMenuPrimitive.CheckboxItem>
));
ContextMenuCheckboxItem.displayName = ContextMenuPrimitive.CheckboxItem.displayName;

/**
 * ContextMenuRadioItem - Entry within a mutually exclusive group.
 */
const ContextMenuRadioItem = React.forwardRef<
	React.ComponentRef<typeof ContextMenuPrimitive.RadioItem>,
	React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.RadioItem>
>(({ children, className, ...props }, ref) => (
	<ContextMenuPrimitive.RadioItem
		ref={ref}
		className={cn(
			"relative flex cursor-default select-none items-center py-1.5 pr-2 pl-8 text-sm outline-none transition-colors",
			"focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
			"dark:focus:bg-surface-900 dark:focus:text-surface-50",
			"rounded-[var(--radius-xs)]",
			className,
		)}
		{...props}
	>
		<span className="absolute left-2 flex size-3.5 items-center justify-center">
			<ContextMenuPrimitive.ItemIndicator>
				<DotFilledIcon className="size-4 fill-current" />
			</ContextMenuPrimitive.ItemIndicator>
		</span>
		{children}
	</ContextMenuPrimitive.RadioItem>
));
ContextMenuRadioItem.displayName = ContextMenuPrimitive.RadioItem.displayName;

/**
 * ContextMenuLabel - Descriptive label for menu sections.
 */
const ContextMenuLabel = React.forwardRef<
	React.ComponentRef<typeof ContextMenuPrimitive.Label>,
	React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Label> & {
		inset?: boolean;
	}
>(({ className, inset, ...props }, ref) => (
	<ContextMenuPrimitive.Label
		ref={ref}
		className={cn(
			"px-3 py-1.5 font-bold text-muted-foreground/60 text-xs uppercase tracking-widest",
			inset && "pl-8",
			className,
		)}
		{...props}
	/>
));
ContextMenuLabel.displayName = ContextMenuPrimitive.Label.displayName;

/**
 * ContextMenuSeparator - Horizontal segmentation line.
 */
const ContextMenuSeparator = React.forwardRef<
	React.ComponentRef<typeof ContextMenuPrimitive.Separator>,
	React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
	<ContextMenuPrimitive.Separator
		ref={ref}
		className={cn("-mx-1 my-1 h-px bg-border dark:bg-surface-800", className)}
		{...props}
	/>
));
ContextMenuSeparator.displayName = ContextMenuPrimitive.Separator.displayName;

/**
 * ContextMenuShortcut - Semantic keyboard shortcut indicator.
 */
function ContextMenuShortcut({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
	return (
		<span
			className={cn(
				"ml-auto font-mono text-muted text-xs tracking-widest opacity-50",
				className,
			)}
			{...props}
		/>
	);
}

export {
	ContextMenu,
	ContextMenuTrigger,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuCheckboxItem,
	ContextMenuRadioItem,
	ContextMenuLabel,
	ContextMenuSeparator,
	ContextMenuShortcut,
	ContextMenuGroup,
	ContextMenuPortal,
	ContextMenuSub,
	ContextMenuSubContent,
	ContextMenuSubTrigger,
	ContextMenuRadioGroup,
};
