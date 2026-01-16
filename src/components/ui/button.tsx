import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";
import { Fragment } from "react";
import Spinner from "@/src/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import { cn } from "@/src/lib/utils";

const buttonVariants = cva(
  [
    "group relative inline-flex size-auto items-center justify-center gap-2 px-4 py-2 text-sm font-bold whitespace-nowrap select-none",
    "transition-all duration-200 ease-out",
    "disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-50",
    "transform-gpu cursor-pointer isolate overflow-visible font-bold",
    "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    // Gradient layer
    "after:pointer-events-none after:absolute after:inset-0 after:-z-10 after:rounded-[inherit] after:transition-opacity after:duration-200 after:ease-out after:content-['']",
  ],
  {
    variants: {
      variant: {
        solid:
          "bg-[var(--btn-bg)] text-[var(--btn-fg)] after:bg-gradient-to-br after:from-white/20 after:to-transparent",
        soft: "bg-[var(--btn-bg-soft)] text-[var(--btn-fg-soft)] after:bg-gradient-to-br after:from-[var(--btn-bg)]/20 after:to-transparent",
        outlined:
          "border border-[var(--btn-border)] bg-gradient-to-br from-[var(--btn-from)] to-[var(--btn-to)] text-[var(--btn-fg-outlined)]",
        plain:
          "bg-transparent text-[var(--btn-fg-plain)] hover:from-[var(--btn-from-hover)] hover:to-[var(--btn-to-hover)] bg-gradient-to-br from-transparent to-transparent",
      },
      color: {
        default:
          "[--btn-bg:theme(colors.surface.950)] [--btn-fg:theme(colors.surface.50)] " +
          "[--btn-bg-soft:theme(colors.surface.100)] [--btn-fg-soft:theme(colors.surface.900)] " +
          "[--btn-border:theme(colors.surface.200)] [--btn-from:theme(colors.surface.50)] [--btn-to:theme(colors.surface.100)] [--btn-fg-outlined:theme(colors.surface.950)] " +
          "[--btn-from-hover:theme(colors.surface.50)] [--btn-to-hover:theme(colors.surface.100)] [--btn-fg-plain:theme(colors.surface.900)]",
        primary:
          "[--btn-bg:theme(colors.primary.600)] [--btn-fg:theme(colors.primary.50)] " +
          "[--btn-bg-soft:theme(colors.primary.100)] [--btn-fg-soft:theme(colors.primary.950)] " +
          "[--btn-border:theme(colors.primary.200)] [--btn-from:theme(colors.primary.50)] [--btn-to:theme(colors.primary.100)] [--btn-fg-outlined:theme(colors.primary.950)] " +
          "[--btn-from-hover:theme(colors.primary.50)] [--btn-to-hover:theme(colors.primary.100)] [--btn-fg-plain:theme(colors.primary.600)]",
        accent:
          "[--btn-bg:theme(colors.accent.500)] [--btn-fg:theme(colors.accent.50)] " +
          "[--btn-bg-soft:theme(colors.accent.100)] [--btn-fg-soft:theme(colors.accent.950)] " +
          "[--btn-border:theme(colors.accent.200)] [--btn-from:theme(colors.accent.50)] [--btn-to:theme(colors.accent.100)] [--btn-fg-outlined:theme(colors.accent.950)] " +
          "[--btn-from-hover:theme(colors.accent.50)] [--btn-to-hover:theme(colors.accent.100)] [--btn-fg-plain:theme(colors.accent.500)]",
        secondary:
          "[--btn-bg:theme(colors.secondary.500)] [--btn-fg:theme(colors.secondary.50)] " +
          "[--btn-bg-soft:theme(colors.secondary.100)] [--btn-fg-soft:theme(colors.secondary.950)] " +
          "[--btn-border:theme(colors.secondary.200)] [--btn-from:theme(colors.secondary.50)] [--btn-to:theme(colors.secondary.100)] [--btn-fg-outlined:theme(colors.secondary.950)] " +
          "[--btn-from-hover:theme(colors.secondary.50)] [--btn-to-hover:theme(colors.secondary.100)] [--btn-fg-plain:theme(colors.secondary.500)]",
        success:
          "[--btn-bg:theme(colors.success.600)] [--btn-fg:theme(colors.success.50)] " +
          "[--btn-bg-soft:theme(colors.success.100)] [--btn-fg-soft:theme(colors.success.950)] " +
          "[--btn-border:theme(colors.success.200)] [--btn-from:theme(colors.success.50)] [--btn-to:theme(colors.success.100)] [--btn-fg-outlined:theme(colors.success.950)] " +
          "[--btn-from-hover:theme(colors.success.50)] [--btn-to-hover:theme(colors.success.100)] [--btn-fg-plain:theme(colors.success.600)]",
        warning:
          "[--btn-bg:theme(colors.warning.500)] [--btn-fg:theme(colors.warning.50)] " +
          "[--btn-bg-soft:theme(colors.warning.100)] [--btn-fg-soft:theme(colors.warning.950)] " +
          "[--btn-border:theme(colors.warning.200)] [--btn-from:theme(colors.warning.50)] [--btn-to:theme(colors.warning.100)] [--btn-fg-outlined:theme(colors.warning.950)] " +
          "[--btn-from-hover:theme(colors.warning.50)] [--btn-to-hover:theme(colors.warning.100)] [--btn-fg-plain:theme(colors.warning.500)]",
        info:
          "[--btn-bg:theme(colors.info.500)] [--btn-fg:theme(colors.info.50)] " +
          "[--btn-bg-soft:theme(colors.info.100)] [--btn-fg-soft:theme(colors.info.950)] " +
          "[--btn-border:theme(colors.info.200)] [--btn-from:theme(colors.info.50)] [--btn-to:theme(colors.info.100)] [--btn-fg-outlined:theme(colors.info.950)] " +
          "[--btn-from-hover:theme(colors.info.50)] [--btn-to-hover:theme(colors.info.100)] [--btn-fg-plain:theme(colors.info.500)]",
        destructive:
          "[--btn-bg:theme(colors.destructive.600)] [--btn-fg:theme(colors.destructive.50)] " +
          "[--btn-bg-soft:theme(colors.destructive.100)] [--btn-fg-soft:theme(colors.destructive.950)] " +
          "[--btn-border:theme(colors.destructive.200)] [--btn-from:theme(colors.destructive.50)] [--btn-to:theme(colors.destructive.100)] [--btn-fg-outlined:theme(colors.destructive.950)] " +
          "[--btn-from-hover:theme(colors.destructive.50)] [--btn-to-hover:theme(colors.destructive.100)] [--btn-fg-plain:theme(colors.destructive.600)]",
      },
      size: {
        xs: "px-2.5 py-1 text-xs",
        sm: "px-3 py-1.5 text-xs",
        md: "px-4 py-2 text-sm",
        lg: "px-5 py-3 text-sm",
        xl: "px-6 py-3 text-lg",
        icon: "size-10 p-2",
      },
      shape: {
        rounded: "rounded-xl",
        pill: "rounded-full",
        square: "rounded-none",
      },
    },
    defaultVariants: {
      color: "default",
      variant: "solid",
      size: "md",
      shape: "rounded",
    },
  }
);

export type ButtonProps = {
  asChild?: boolean;
  children: React.ReactNode;
  className?: string;
  ref?: React.ForwardedRef<HTMLButtonElement>;
  variant?: "plain" | "outlined" | "soft" | "solid";
  color?:
    | "default"
    | "primary"
    | "secondary"
    | "accent"
    | "success"
    | "warning"
    | "info"
    | "destructive";
  size?:
    | "xs"
    | "sm"
    | "md"
    | "lg"
    | "xl"
    | "icon"
    | "icon-xs"
    | "icon-sm"
    | "icon-md"
    | "icon-lg"
    | "icon-xl";
  shape?: "rounded" | "pill" | "square" | "rounded-lg" | "rounded-sm";
  disabled?: boolean;
  loading?: boolean;

  // ? - Tooltip Props:
  // Provider:
  showTooltip?: boolean;
  tooltipContent?: string;
  tooltipDelayDuration?: number;
  tooltipSkipDelayDuration?: number;

  // Content:
  tooltipSide?: "top" | "right" | "bottom" | "left";
  tooltipSideOffset?: number;
  tooltipAlign?: "start" | "center" | "end";
  tooltipAlignOffset?: number;
  tooltipAvoidCollisions?: boolean;
  tooltipArrowPadding?: number;
  tooltipSticky?: "partial" | "always";
  tooltipHideWhenDetached?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

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
      loading = false,
      children,
      type = "button",

      tooltipContent,
      showTooltip = !!tooltipContent,
      tooltipDelayDuration = 700,
      tooltipSkipDelayDuration = 300,

      tooltipSide = "top",
      tooltipSideOffset = 8,
      tooltipAlign = "center",
      tooltipAlignOffset = 0,
      tooltipAvoidCollisions = true,
      tooltipArrowPadding = 4,
      tooltipSticky = "partial",
      tooltipHideWhenDetached = false,

      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    if (
      showTooltip &&
      typeof tooltipContent === "string" &&
      tooltipContent.length > 0
    ) {
      return (
        <TooltipProvider
          delayDuration={tooltipDelayDuration}
          skipDelayDuration={tooltipSkipDelayDuration}
        >
          <Tooltip delayDuration={50}>
            <TooltipTrigger asChild>
              <Comp
                ref={ref}
                className={cn(
                  buttonVariants({ className, color, shape, size, variant })
                )}
                disabled={loading ? true : disabled}
                title={undefined}
                type={type}
                {...props}
              >
                {loading ? (
                  <Fragment>
                    <Spinner
                      aria-hidden="true"
                      className={cn(
                        "text-current",
                        (size === "xs" || size?.startsWith("icon-xs")) &&
                          "size-4",
                        (size === "sm" || size?.startsWith("icon-sm")) &&
                          "size-5",
                        (size === "md" || size?.startsWith("icon-md")) &&
                          "size-5",
                        (size === "lg" || size?.startsWith("icon-lg")) &&
                          "size-5",
                        (size === "xl" || size?.startsWith("icon-xl")) &&
                          "size-6"
                      )}
                      focusable="false"
                      size="sm"
                    />
                    {children}
                  </Fragment>
                ) : (
                  children
                )}
              </Comp>
            </TooltipTrigger>
            <TooltipContent
              align={tooltipAlign}
              alignOffset={tooltipAlignOffset}
              arrowPadding={tooltipArrowPadding}
              avoidCollisions={tooltipAvoidCollisions}
              hideWhenDetached={tooltipHideWhenDetached}
              side={tooltipSide}
              sideOffset={tooltipSideOffset}
              sticky={tooltipSticky}
            >
              {tooltipContent}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <Comp
        ref={ref}
        className={cn(
          buttonVariants({ className, color, shape, size, variant })
        )}
        disabled={loading ? true : disabled}
        title={undefined}
        type={type}
        {...props}
      >
        {loading ? (
          <Fragment>
            <Spinner
              aria-hidden="true"
              className="size-5 text-current"
              focusable="false"
              size="sm"
            />
            {children}
          </Fragment>
        ) : (
          children
        )}
      </Comp>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
