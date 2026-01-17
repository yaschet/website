/**
 * Button Component
 *
 * Interactive element that triggers an action or event from the user.
 * Supports various styles, sizes, and states, including loading and tooltips.
 */

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { type HTMLMotionProps, motion } from "framer-motion";
import * as React from "react";
import { type ForwardedRef, Fragment, type ReactNode } from "react";

import { springs } from "@/src/lib/physics";

import Spinner from "@/src/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import { cn } from "@/src/lib/utils";

// ═══════════════════════════════════════════════════════════════════════════
// VARIANTS
// ═══════════════════════════════════════════════════════════════════════════

const buttonVariants = cva(
  [
    "group relative inline-flex size-auto select-none items-center justify-center gap-2 whitespace-nowrap px-4 py-2 font-bold text-sm",
    "transition-all duration-200 ease-out",
    "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
    "isolate transform-gpu cursor-pointer overflow-visible",
    "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    // Subsurface lighting layer
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
          "bg-gradient-to-br bg-transparent from-transparent to-transparent text-[var(--btn-fg-plain)] hover:from-[var(--btn-from-hover)] hover:to-[var(--btn-to-hover)]",
      },
      color: {
        default:
          "[--btn-bg:theme(colors.surface.950)] [--btn-fg:theme(colors.surface.50)]" +
          "[--btn-bg-soft:theme(colors.surface.100)] [--btn-fg-soft:theme(colors.surface.900)]" +
          "[--btn-border:theme(colors.surface.200)] [--btn-fg-outlined:theme(colors.surface.950)] [--btn-from:theme(colors.surface.50)] [--btn-to:theme(colors.surface.100)]" +
          "[--btn-fg-plain:theme(colors.surface.900)] [--btn-from-hover:theme(colors.surface.50)] [--btn-to-hover:theme(colors.surface.100)]",
        primary:
          "[--btn-bg:theme(colors.primary.600)] [--btn-fg:theme(colors.primary.50)]" +
          "[--btn-bg-soft:theme(colors.primary.100)] [--btn-fg-soft:theme(colors.primary.950)]" +
          "[--btn-border:theme(colors.primary.200)] [--btn-fg-outlined:theme(colors.primary.950)] [--btn-from:theme(colors.primary.50)] [--btn-to:theme(colors.primary.100)]" +
          "[--btn-fg-plain:theme(colors.primary.600)] [--btn-from-hover:theme(colors.primary.50)] [--btn-to-hover:theme(colors.primary.100)]",
        accent:
          "[--btn-bg:theme(colors.accent.500)] [--btn-fg:theme(colors.accent.50)]" +
          "[--btn-bg-soft:theme(colors.accent.100)] [--btn-fg-soft:theme(colors.accent.950)]" +
          "[--btn-border:theme(colors.accent.200)] [--btn-fg-outlined:theme(colors.accent.950)] [--btn-from:theme(colors.accent.50)] [--btn-to:theme(colors.accent.100)]" +
          "[--btn-fg-plain:theme(colors.accent.500)] [--btn-from-hover:theme(colors.accent.50)] [--btn-to-hover:theme(colors.accent.100)]",
        secondary:
          "[--btn-bg:theme(colors.secondary.500)] [--btn-fg:theme(colors.secondary.50)]" +
          "[--btn-bg-soft:theme(colors.secondary.100)] [--btn-fg-soft:theme(colors.secondary.950)]" +
          "[--btn-border:theme(colors.secondary.200)] [--btn-fg-outlined:theme(colors.secondary.950)] [--btn-from:theme(colors.secondary.50)] [--btn-to:theme(colors.secondary.100)]" +
          "[--btn-fg-plain:theme(colors.secondary.500)] [--btn-from-hover:theme(colors.secondary.50)] [--btn-to-hover:theme(colors.secondary.100)]",
        success:
          "[--btn-bg:theme(colors.success.600)] [--btn-fg:theme(colors.success.50)]" +
          "[--btn-bg-soft:theme(colors.success.100)] [--btn-fg-soft:theme(colors.success.950)]" +
          "[--btn-border:theme(colors.success.200)] [--btn-fg-outlined:theme(colors.success.950)] [--btn-from:theme(colors.success.50)] [--btn-to:theme(colors.success.100)]" +
          "[--btn-fg-plain:theme(colors.success.600)] [--btn-from-hover:theme(colors.success.50)] [--btn-to-hover:theme(colors.success.100)]",
        warning:
          "[--btn-bg:theme(colors.warning.500)] [--btn-fg:theme(colors.warning.50)]" +
          "[--btn-bg-soft:theme(colors.warning.100)] [--btn-fg-soft:theme(colors.warning.950)]" +
          "[--btn-border:theme(colors.warning.200)] [--btn-fg-outlined:theme(colors.warning.950)] [--btn-from:theme(colors.warning.50)] [--btn-to:theme(colors.warning.100)]" +
          "[--btn-fg-plain:theme(colors.warning.500)] [--btn-from-hover:theme(colors.warning.50)] [--btn-to-hover:theme(colors.warning.100)]",
        info:
          "[--btn-bg:theme(colors.info.500)] [--btn-fg:theme(colors.info.50)]" +
          "[--btn-bg-soft:theme(colors.info.100)] [--btn-fg-soft:theme(colors.info.950)]" +
          "[--btn-border:theme(colors.info.200)] [--btn-fg-outlined:theme(colors.info.950)] [--btn-from:theme(colors.info.50)] [--btn-to:theme(colors.info.100)]" +
          "[--btn-fg-plain:theme(colors.info.500)] [--btn-from-hover:theme(colors.info.50)] [--btn-to-hover:theme(colors.info.100)]",
        destructive:
          "[--btn-bg:theme(colors.destructive.600)] [--btn-fg:theme(colors.destructive.50)]" +
          "[--btn-bg-soft:theme(colors.destructive.100)] [--btn-fg-soft:theme(colors.destructive.950)]" +
          "[--btn-border:theme(colors.destructive.200)] [--btn-fg-outlined:theme(colors.destructive.950)] [--btn-from:theme(colors.destructive.50)] [--btn-to:theme(colors.destructive.100)]" +
          "[--btn-fg-plain:theme(colors.destructive.600)] [--btn-from-hover:theme(colors.destructive.50)] [--btn-to-hover:theme(colors.destructive.100)]",
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
        none: "rounded-none",
        xs: "rounded-[var(--radius-xs)]",
        sm: "rounded-[var(--radius-sm)]",
        md: "rounded-[var(--radius-md)]",
        lg: "rounded-[var(--radius-lg)]",
        xl: "rounded-[var(--radius-xl)]",
        full: "rounded-[var(--radius-full)]",
        default: "rounded-[var(--radius)]",
      },
    },
    defaultVariants: {
      color: "default",
      variant: "solid",
      size: "md",
      shape: "default",
    },
  }
);

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface ButtonProps
  extends Omit<HTMLMotionProps<"button">, "color" | "children">,
    VariantProps<typeof buttonVariants> {
  /** Button content */
  children?: ReactNode;
  /** Composition slot for high-level UI orchestration (e.g. Next.js Link) */
  asChild?: boolean;
  /** Display a Spinner and disable interactions */
  loading?: boolean;
  /** Ref to the underlying button element */
  ref?: ForwardedRef<HTMLButtonElement>;

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

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

// Motion-enabled Slot for asChild composition (e.g., with Next.js Link)
const MotionSlot = motion.create(Slot);

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
      tooltipSide = "top",
      tooltipSideOffset = 8,
      tooltipAlign = "center",

      ...props
    },
    ref
  ) => {
    const Comp = asChild ? MotionSlot : motion.button;
    const isDisabled = loading || disabled;

    function getSpinnerSize() {
      if (size === "xs" || size === "sm") return "xs";
      if (size === "lg" || size === "xl") return "md";
      return "sm";
    }

    const content = (
      <Comp
        ref={ref}
        className={cn(
          buttonVariants({ className, color, shape, size, variant })
        )}
        disabled={isDisabled}
        type={type}
        // Physics-based interactions - the soul of the button
        whileHover={isDisabled ? undefined : { scale: 1.02 }}
        whileTap={isDisabled ? undefined : { scale: 0.97 }}
        transition={springs.snappy}
        {...props}
      >
        {loading ? (
          <Fragment>
            <Spinner
              aria-hidden="true"
              className="size-[1.25em] text-current"
              focusable="false"
              size={getSpinnerSize()}
            />
            {children}
          </Fragment>
        ) : (
          children
        )}
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
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
