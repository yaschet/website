"use client";

import { Slot } from "@radix-ui/react-slot";
import type { ReactNode } from "react";
import * as React from "react";
import { ButtonContent } from "@/src/components/ui/button-content";
import {
	type ButtonStyleOptions,
	buttonVariants,
	resolveButtonStyle,
} from "@/src/components/ui/button-styles";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/src/components/ui/tooltip";
import { cn } from "@/src/lib/index";

export interface ButtonProps
	extends Omit<React.ComponentPropsWithoutRef<"button">, "color" | "children">,
		ButtonStyleOptions {
	/** Button content */
	children?: ReactNode;
	/** Composition slot for high-level UI composition (e.g. Next.js Link) */
	asChild?: boolean;
	/** Block activation and show progress without dimming or dropping keyboard focus. */
	loading?: boolean;
	/** A persistent glyph chamber; loading replaces this icon with the Foundation spinner. */
	icon?: ReactNode;
	iconPosition?: "start" | "end";

	// Tooltip Integration
	/** Explicitly show a tooltip on hover */
	showTooltip?: boolean;
	/** Content of the tooltip */
	tooltipContent?: ReactNode;
	/** Delay before showing (ms) */
	tooltipDelayDuration?: number;
	/** Position relative to the button */
	tooltipSide?: "top" | "right" | "bottom" | "left";
	/** Offset from the button edge (px) */
	tooltipSideOffset?: number;
	/** Alignment with the button axis */
	tooltipAlign?: "start" | "center" | "end";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{
			className,
			variant,
			color,
			size,
			shape,
			asChild = false,
			disabled = false,
			loading,
			icon,
			iconPosition = "start",
			children,
			onClickCapture,
			onKeyDownCapture,
			onPointerDownCapture,
			type = "button",

			tooltipContent,
			showTooltip = !!tooltipContent,
			tooltipDelayDuration = 700,
			tooltipSide = "top",
			tooltipSideOffset = 8,
			tooltipAlign = "center",

			...props
		},
		ref,
	) => {
		const [motionInput, setMotionInput] = React.useState<"pointer" | "keyboard">("pointer");
		const Comp = asChild ? Slot : "button";
		const isDisabled = Boolean(loading || disabled);
		const style = resolveButtonStyle(variant ?? "solid", color);
		const iconOnly = size?.startsWith("icon") ?? false;
		const pendingContent = (copy: ReactNode) => (
			<ButtonContent
				loading={loading}
				icon={icon}
				iconOnly={iconOnly}
				iconPosition={iconPosition}
			>
				{copy}
			</ButtonContent>
		);
		// Keep the slot's native element, handlers and ref; only compose its contents.
		const buttonChildren =
			loading === undefined && icon === undefined
				? children
				: asChild && React.isValidElement<{ children?: ReactNode }>(children)
					? React.cloneElement(
							children,
							undefined,
							pendingContent(children.props.children),
						)
					: pendingContent(children);

		const content = (
			<Comp
				ref={ref}
				data-slot="button"
				data-motion-input={motionInput}
				data-appearance={style.appearance}
				data-color={style.color}
				data-size={size ?? "default"}
				data-loading={loading ? "" : undefined}
				data-disabled={isDisabled ? "" : undefined}
				className={cn(buttonVariants({ className, color, shape, size, variant }))}
				type={asChild ? undefined : type}
				{...props}
				disabled={asChild ? undefined : disabled && !loading}
				aria-disabled={isDisabled || props["aria-disabled"]}
				aria-busy={loading || props["aria-busy"]}
				tabIndex={asChild && disabled && !loading ? -1 : props.tabIndex}
				onKeyDownCapture={(event) => {
					setMotionInput("keyboard");
					onKeyDownCapture?.(event);
				}}
				onPointerDownCapture={(event) => {
					setMotionInput("pointer");
					onPointerDownCapture?.(event);
				}}
				onClickCapture={(event) => {
					if (isDisabled) {
						event.preventDefault();
						event.stopPropagation();
						return;
					}
					onClickCapture?.(event);
				}}
			>
				{buttonChildren}
			</Comp>
		);

		if (showTooltip && tooltipContent) {
			return (
				<TooltipProvider delayDuration={tooltipDelayDuration}>
					<Tooltip>
						<TooltipTrigger asChild>{content}</TooltipTrigger>
						<TooltipContent
							align={tooltipAlign}
							side={tooltipSide}
							sideOffset={tooltipSideOffset}
						>
							{tooltipContent}
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			);
		}

		return content;
	},
);

Button.displayName = "Button";

export { Button, buttonVariants };
