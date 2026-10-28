"use client";
import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import { RiArrowRightSLine } from "@remixicon/react";
import * as React from "react";
import { DropdownMenuFeedback } from "@/src/components/ui/dropdown-menu-feedback";
import { IconChamber, type IconChamberProps } from "@/src/components/ui/icon-chamber";
import { cn } from "@/src/lib/index";

const DropdownMotionContext = React.createContext(false);

const createDropdownMenuHandle = MenuPrimitive.createHandle;

function DropdownMenu<Payload = unknown>({
	onOpenChange,
	size: _size,
	...props
}: MenuPrimitive.Root.Props<Payload> & { size?: "xs" | "sm" | "md" | "lg" | "xl" }) {
	const [keyboard, setKeyboard] = React.useState(false);
	return (
		<DropdownMotionContext.Provider value={keyboard}>
			<MenuPrimitive.Root
				data-slot="dropdown-menu"
				{...props}
				onOpenChange={(open, details) => {
					setKeyboard(
						details.event.type.startsWith("key") ||
							(details.event.type === "click" &&
								"detail" in details.event &&
								details.event.detail === 0),
					);
					onOpenChange?.(open, details);
				}}
			/>
		</DropdownMotionContext.Provider>
	);
}

function DropdownMenuPortal({ ...props }: MenuPrimitive.Portal.Props) {
	return <MenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />;
}

function DropdownMenuTrigger<Payload = unknown>({
	asChild,
	children,
	...props
}: MenuPrimitive.Trigger.Props<Payload> & { asChild?: boolean }) {
	return (
		<MenuPrimitive.Trigger
			data-slot="dropdown-menu-trigger"
			{...props}
			render={asChild && React.isValidElement(children) ? children : props.render}
		>
			{asChild ? undefined : children}
		</MenuPrimitive.Trigger>
	);
}

function DropdownMenuContent({
	align = "start",
	alignOffset = 0,
	side = "bottom",
	sideOffset = 8,
	size = "default",
	container,
	collisionPadding = 8,
	children,
	className,
	ref,
	...props
}: MenuPrimitive.Popup.Props &
	Pick<MenuPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset"> & {
		size?: "default" | "lg";
		container?: HTMLElement | null;
		collisionPadding?: number;
	}) {
	const keyboard = React.useContext(DropdownMotionContext);
	const [popupElement, setPopupElement] = React.useState<HTMLDivElement | null>(null);
	const composedRef = React.useCallback(
		(node: HTMLDivElement | null) => {
			setPopupElement(node);

			if (typeof ref === "function") {
				return ref(node);
			}

			if (ref) {
				ref.current = node;
			}
		},
		[ref],
	);

	React.useLayoutEffect(() => {
		if (!popupElement || align === "center") {
			return;
		}

		let frame = 0;
		const alignPopupEdge = () => {
			popupElement.style.setProperty("--popup-edge-nudge-x", "0px");
			popupElement.style.setProperty("--popup-edge-nudge-y", "0px");

			const triggerId = popupElement.getAttribute("aria-labelledby");
			const trigger = triggerId ? document.getElementById(triggerId) : null;

			if (!trigger) {
				return;
			}

			const triggerRect = trigger.getBoundingClientRect();
			const popupRect = popupElement.getBoundingClientRect();
			const verticalSide = side === "left" || side === "right";
			const nudge = verticalSide
				? align === "start"
					? triggerRect.top - popupRect.top
					: triggerRect.bottom - popupRect.bottom
				: align === "start"
					? triggerRect.left - popupRect.left
					: triggerRect.right - popupRect.right;

			/* Floating UI snaps its positioner to device pixels. Correct only that
			 * sub-pixel remainder; collision offsets remain owned by the primitive. */
			if (Math.abs(nudge) <= 0.5) {
				popupElement.style.setProperty(
					verticalSide ? "--popup-edge-nudge-y" : "--popup-edge-nudge-x",
					`${nudge}px`,
				);
			}
		};
		const scheduleAlignment = () => {
			cancelAnimationFrame(frame);
			frame = requestAnimationFrame(alignPopupEdge);
		};
		const resizeObserver = new ResizeObserver(scheduleAlignment);

		resizeObserver.observe(popupElement);
		scheduleAlignment();
		window.addEventListener("resize", scheduleAlignment);

		return () => {
			cancelAnimationFrame(frame);
			resizeObserver.disconnect();
			window.removeEventListener("resize", scheduleAlignment);
		};
	}, [align, popupElement, side]);

	return (
		<MenuPrimitive.Portal container={container}>
			<MenuPrimitive.Positioner
				className="isolate z-50 outline-none"
				align={align}
				alignOffset={alignOffset}
				side={side}
				sideOffset={sideOffset}
				collisionPadding={collisionPadding}
			>
				<MenuPrimitive.Popup
					ref={composedRef}
					data-slot="dropdown-menu-content"
					data-size={size}
					data-motion-input={keyboard ? "keyboard" : "pointer"}
					className={cn(
						"yaschet t-dropdown cn-menu-target cn-menu-translucent z-50 max-h-(--available-height) w-max min-w-(--anchor-width) origin-(--transform-origin) overflow-y-auto overflow-x-hidden rounded-none bg-popover text-[length:var(--foundation-type-control-size)] text-popover-foreground leading-[var(--foundation-type-control-leading)] outline-none data-closed:overflow-hidden",
						className,
					)}
					{...props}
				>
					<DropdownMenuFeedback keyboard={keyboard}>{children}</DropdownMenuFeedback>
				</MenuPrimitive.Popup>
			</MenuPrimitive.Positioner>
		</MenuPrimitive.Portal>
	);
}

function DropdownMenuGroup({ ...props }: MenuPrimitive.Group.Props) {
	return <MenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />;
}

function DropdownMenuLabel({
	className,
	inset,
	...props
}: MenuPrimitive.GroupLabel.Props & {
	inset?: boolean;
}) {
	return (
		<MenuPrimitive.GroupLabel
			data-slot="dropdown-menu-label"
			data-inset={inset}
			className={cn(
				"px-3 py-1.5 font-medium text-[length:var(--foundation-type-menu-label-size)] text-muted-foreground leading-[var(--foundation-type-menu-label-leading)] data-inset:pl-8",
				className,
			)}
			{...props}
		/>
	);
}

function DropdownMenuItem({
	className,
	inset,
	variant = "default",
	...props
}: MenuPrimitive.Item.Props & {
	inset?: boolean;
	variant?: "default" | "destructive";
}) {
	return (
		<MenuPrimitive.Item
			data-slot="dropdown-menu-item"
			data-inset={inset}
			data-variant={variant}
			className={cn(
				"group/dropdown-menu-item relative flex h-[var(--foundation-menu-item-height)] min-h-[var(--foundation-menu-item-height)] cursor-default select-none items-center gap-2 rounded-none px-3 py-0 text-[length:var(--foundation-type-control-size)] leading-[var(--foundation-type-control-leading)] outline-hidden focus:bg-muted focus:text-foreground data-disabled:pointer-events-none data-inset:pl-8 data-[variant=destructive]:text-destructive-ink data-disabled:opacity-50 data-[variant=destructive]:focus:bg-destructive-soft data-[variant=destructive]:focus:text-destructive-ink [&_svg:not([class*='size-'])]:size-3.5 [&_svg]:pointer-events-none [&_svg]:shrink-0 data-[variant=destructive]:*:[svg]:text-destructive-ink",
				className,
			)}
			{...props}
		/>
	);
}

function DropdownMenuSub({ onOpenChange, ...props }: MenuPrimitive.SubmenuRoot.Props) {
	const inheritedKeyboard = React.useContext(DropdownMotionContext);
	const [keyboard, setKeyboard] = React.useState(inheritedKeyboard);
	return (
		<DropdownMotionContext.Provider value={keyboard}>
			<MenuPrimitive.SubmenuRoot
				data-slot="dropdown-menu-sub"
				{...props}
				onOpenChange={(open, details) => {
					setKeyboard(
						details.event.type.startsWith("key") ||
							(details.event.type === "click" &&
								"detail" in details.event &&
								details.event.detail === 0),
					);
					onOpenChange?.(open, details);
				}}
			/>
		</DropdownMotionContext.Provider>
	);
}

function DropdownMenuSubTrigger({
	className,
	inset,
	children,
	...props
}: MenuPrimitive.SubmenuTrigger.Props & {
	inset?: boolean;
}) {
	return (
		<MenuPrimitive.SubmenuTrigger
			data-slot="dropdown-menu-sub-trigger"
			data-inset={inset}
			className={cn(
				"flex h-[var(--foundation-menu-item-height)] min-h-[var(--foundation-menu-item-height)] cursor-default select-none items-center gap-2 rounded-none px-3 py-0 text-[length:var(--foundation-type-control-size)] leading-[var(--foundation-type-control-leading)] outline-hidden focus:bg-muted focus:text-foreground data-open:bg-muted data-popup-open:bg-muted data-inset:pl-8 data-open:text-foreground data-popup-open:text-foreground [&_svg:not([class*='size-'])]:size-3.5 [&_svg]:pointer-events-none [&_svg]:shrink-0",
				className,
			)}
			{...props}
		>
			{children}
			<RiArrowRightSLine className="cn-rtl-flip ml-auto" />
		</MenuPrimitive.SubmenuTrigger>
	);
}

function DropdownMenuSubContent({
	align = "start",
	alignOffset = 0,
	side = "right",
	sideOffset = 8,
	collisionPadding = 8,
	className,
	...props
}: React.ComponentProps<typeof DropdownMenuContent>) {
	return (
		<DropdownMenuContent
			data-slot="dropdown-menu-sub-content"
			className={cn(
				"cn-menu-target cn-menu-translucent w-auto min-w-[96px] rounded-none bg-popover text-popover-foreground",
				className,
			)}
			align={align}
			alignOffset={alignOffset}
			side={side}
			sideOffset={sideOffset}
			collisionPadding={collisionPadding}
			{...props}
		/>
	);
}

function DropdownMenuCheckboxItem({
	className,
	children,
	checked,
	inset,
	...props
}: MenuPrimitive.CheckboxItem.Props & {
	inset?: boolean;
}) {
	return (
		<MenuPrimitive.CheckboxItem
			data-slot="dropdown-menu-checkbox-item"
			data-inset={inset}
			className={cn(
				"relative flex h-[var(--foundation-menu-item-height)] min-h-[var(--foundation-menu-item-height)] cursor-default select-none items-center gap-2 rounded-none py-0 pr-8 pl-3 text-[length:var(--foundation-type-control-size)] leading-[var(--foundation-type-control-leading)] outline-hidden focus:bg-muted focus:text-foreground data-disabled:pointer-events-none data-inset:pl-8 data-disabled:opacity-50 [&_svg:not([class*='size-'])]:size-3.5 [&_svg]:pointer-events-none [&_svg]:shrink-0",
				className,
			)}
			checked={checked}
			{...props}
		>
			{children}
			<MenuPrimitive.CheckboxItemIndicator
				keepMounted
				data-slot="dropdown-menu-checkbox-item-indicator"
				className="dropdown-menu-selection"
				aria-hidden="true"
			>
				<svg
					aria-hidden="true"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="3.5"
				>
					<path
						d="M4.5 12.75l6 6 9-13.5"
						pathLength={1}
						strokeLinecap="square"
						strokeLinejoin="miter"
					/>
				</svg>
			</MenuPrimitive.CheckboxItemIndicator>
		</MenuPrimitive.CheckboxItem>
	);
}

function DropdownMenuRadioGroup({ ...props }: MenuPrimitive.RadioGroup.Props) {
	return <MenuPrimitive.RadioGroup data-slot="dropdown-menu-radio-group" {...props} />;
}

function DropdownMenuRadioItem({
	className,
	children,
	inset,
	...props
}: MenuPrimitive.RadioItem.Props & {
	inset?: boolean;
}) {
	return (
		<MenuPrimitive.RadioItem
			data-slot="dropdown-menu-radio-item"
			data-inset={inset}
			className={cn(
				"relative flex h-[var(--foundation-menu-item-height)] min-h-[var(--foundation-menu-item-height)] cursor-default select-none items-center gap-2 rounded-none py-0 pr-8 pl-3 text-[length:var(--foundation-type-control-size)] leading-[var(--foundation-type-control-leading)] outline-hidden focus:bg-muted focus:text-foreground data-disabled:pointer-events-none data-inset:pl-8 data-disabled:opacity-50 [&_svg:not([class*='size-'])]:size-3.5 [&_svg]:pointer-events-none [&_svg]:shrink-0",
				className,
			)}
			{...props}
		>
			{children}
			<MenuPrimitive.RadioItemIndicator
				keepMounted
				data-slot="dropdown-menu-radio-item-indicator"
				className="dropdown-menu-selection"
				aria-hidden="true"
			>
				<svg
					aria-hidden="true"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2.5"
				>
					<path
						d="m5 12 4 4L19 6"
						pathLength={1}
						strokeLinecap="square"
						strokeLinejoin="miter"
					/>
				</svg>
			</MenuPrimitive.RadioItemIndicator>
		</MenuPrimitive.RadioItem>
	);
}

function DropdownMenuSeparator({ className, ...props }: MenuPrimitive.Separator.Props) {
	return (
		<MenuPrimitive.Separator
			data-slot="dropdown-menu-separator"
			className={cn("cn-menu-separator mx-0 w-full", className)}
			{...props}
		/>
	);
}

function DropdownMenuShortcut({ className, ...props }: React.ComponentProps<"span">) {
	return (
		<span
			data-slot="dropdown-menu-shortcut"
			className={cn(
				"ml-auto text-[10px] text-muted-foreground tracking-wider group-focus/dropdown-menu-item:text-foreground",
				className,
			)}
			{...props}
		/>
	);
}

/** Presentation only: interaction and keyboard navigation stay with Base UI. */
function DropdownMenuItemContent({
	children,
	icon,
	description,
	color = "secondary",
	titleId,
	descriptionId,
}: {
	children: React.ReactNode;
	icon?: React.ReactNode;
	description?: React.ReactNode;
	color?: IconChamberProps["color"];
	titleId?: string;
	descriptionId?: string;
}) {
	return (
		<span data-slot="dropdown-menu-item-content">
			{icon && (
				<IconChamber color={color} className="dropdown-menu-icon" aria-hidden="true">
					{icon}
				</IconChamber>
			)}
			<span className="dropdown-menu-copy">
				<span id={titleId} className="dropdown-menu-title">
					{children}
				</span>
				{description && (
					<span
						id={descriptionId}
						className="dropdown-menu-description"
						title={typeof description === "string" ? description : undefined}
					>
						{description}
					</span>
				)}
			</span>
		</span>
	);
}

export {
	createDropdownMenuHandle,
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuItemContent,
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
