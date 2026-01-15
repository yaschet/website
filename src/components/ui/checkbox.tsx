'use client';

import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { type VariantProps, cva } from 'class-variance-authority';
import { motion } from 'motion/react';
import * as React from 'react';
import { cn } from '@library/utils';

/**
 * Checkbox component with beautiful Framer Motion animations.
 * Built on Radix UI primitives for accessibility.
 * Styled to match Animate UI's checkbox design.
 *
 * Features:
 * - Scale animations on hover/tap
 * - Path drawing animation for checkmark
 * - Indeterminate state support
 * - Multiple color, size, and border radius variants
 */

// Checkbox variants
const checkboxVariants = cva(
    [
        'peer shrink-0 flex items-center justify-center outline-none',
        'focus-visible:ring-[3px] focus-visible:ring-offset-2',
        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'transition-colors duration-500',
    ],
    {
        variants: {
            variant: {
                default: [
                    'bg-background border border-input',
                    'data-[state=checked]:bg-surface-950 data-[state=checked]:border-surface-950',
                    'data-[state=checked]:text-surface-50',
                    'data-[state=indeterminate]:bg-surface-950 data-[state=indeterminate]:border-surface-950',
                    'data-[state=indeterminate]:text-surface-50',
                    'dark:data-[state=checked]:bg-surface-50 dark:data-[state=checked]:border-surface-50',
                    'dark:data-[state=checked]:text-surface-950',
                    'dark:data-[state=indeterminate]:bg-surface-50 dark:data-[state=indeterminate]:border-surface-50',
                    'dark:data-[state=indeterminate]:text-surface-950',
                    'focus-visible:ring-ring/50',
                ],
                accent: [
                    'bg-input border-0',
                    'data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
                    'data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground',
                    'focus-visible:ring-ring/50',
                ],
                info: [
                    'bg-background border border-info/30',
                    'data-[state=checked]:bg-info data-[state=checked]:border-info',
                    'data-[state=checked]:text-info-foreground',
                    'data-[state=indeterminate]:bg-info data-[state=indeterminate]:border-info',
                    'data-[state=indeterminate]:text-info-foreground',
                    'focus-visible:ring-info/50',
                ],
                primary: [
                    'bg-background border border-primary/30',
                    'data-[state=checked]:bg-primary data-[state=checked]:border-primary',
                    'data-[state=checked]:text-primary-foreground',
                    'data-[state=indeterminate]:bg-primary data-[state=indeterminate]:border-primary',
                    'data-[state=indeterminate]:text-primary-foreground',
                    'focus-visible:ring-primary/50',
                ],
                success: [
                    'bg-background border border-success/30',
                    'data-[state=checked]:bg-success data-[state=checked]:border-success',
                    'data-[state=checked]:text-success-foreground',
                    'data-[state=indeterminate]:bg-success data-[state=indeterminate]:border-success',
                    'data-[state=indeterminate]:text-success-foreground',
                    'focus-visible:ring-success/50',
                ],
                warning: [
                    'bg-background border border-warning/30',
                    'data-[state=checked]:bg-warning data-[state=checked]:border-warning',
                    'data-[state=checked]:text-warning-foreground',
                    'data-[state=indeterminate]:bg-warning data-[state=indeterminate]:border-warning',
                    'data-[state=indeterminate]:text-warning-foreground',
                    'focus-visible:ring-warning/50',
                ],
                destructive: [
                    'bg-background border border-destructive/30',
                    'data-[state=checked]:bg-destructive data-[state=checked]:border-destructive',
                    'data-[state=checked]:text-destructive-foreground',
                    'data-[state=indeterminate]:bg-destructive data-[state=indeterminate]:border-destructive',
                    'data-[state=indeterminate]:text-destructive-foreground',
                    'focus-visible:ring-destructive/50',
                ],
            },
            size: {
                sm: 'size-4.5', // 18px
                default: 'size-5', // 20px
                lg: 'size-6', // 24px
            },
            radius: {
                sm: 'rounded-[5px]', // Small radius
                default: 'rounded-sm', // Default radius (~3px)
                md: 'rounded-md', // Medium radius (~6px)
                lg: 'rounded-[7px]', // Large radius
                full: 'rounded-full', // Fully rounded
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
            radius: 'default',
        },
    },
);

// Indicator size variants
const indicatorSizeVariants = {
    sm: 'size-3', // 12px
    default: 'size-3.5', // 14px
    lg: 'size-4', // 16px
} as const;

// Props interface with NextUI compatibility
export type CheckboxProps = {
    /**
     * Color variant of the checkbox
     */
    color?: 'default' | 'accent' | 'info' | 'primary' | 'success' | 'warning' | 'destructive';

    /**
     * NextUI compatibility: alias for checked
     */
    isSelected?: boolean;

    /**
     * NextUI compatibility: alias for defaultChecked
     */
    defaultSelected?: boolean;

    /**
     * NextUI compatibility: alias for disabled
     */
    isDisabled?: boolean;

    /**
     * NextUI compatibility: alias for required
     */
    isRequired?: boolean;

    /**
     * NextUI compatibility: alias for onCheckedChange
     */
    onValueChange?: (checked: boolean) => void;

    /**
     * Whether the checkbox is in an indeterminate state
     */
    indeterminate?: boolean;
} & Omit<React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>, 'color' | 'asChild'> &
    VariantProps<typeof checkboxVariants>;

const Checkbox = React.forwardRef<React.ElementRef<typeof CheckboxPrimitive.Root>, CheckboxProps>(
    (
        {
            checked,
            className,
            color,
            defaultChecked,
            defaultSelected,
            disabled,
            indeterminate,
            isDisabled,
            isRequired,
            isSelected,
            onCheckedChange,
            onValueChange,
            radius,
            required,
            size = 'default',
            variant,
            ...props
        },
        ref,
    ) => {
        // Handle NextUI prop aliases
        const finalChecked = checked ?? isSelected;
        const finalDefaultChecked = defaultChecked ?? defaultSelected;
        const finalDisabled = disabled ?? isDisabled;
        const finalRequired = required ?? isRequired;
        const finalColor = color ?? variant ?? 'default';

        // Combine onCheckedChange and onValueChange
        const handleCheckedChange = React.useCallback(
            (checked: CheckboxPrimitive.CheckedState) => {
                onCheckedChange?.(checked);
                if (typeof checked === 'boolean') {
                    onValueChange?.(checked);
                }
            },
            [onCheckedChange, onValueChange],
        );

        // Determine the indicator size based on checkbox size
        const indicatorSize = indicatorSizeVariants[size ?? 'default'];

        return (
            <CheckboxPrimitive.Root
                ref={ref}
                asChild
                checked={indeterminate ? 'indeterminate' : finalChecked}
                className={cn(checkboxVariants({ variant: finalColor, size, radius }), className)}
                defaultChecked={finalDefaultChecked}
                disabled={finalDisabled}
                required={finalRequired}
                onCheckedChange={handleCheckedChange}
                {...props}
            >
                <motion.button
                    type="button"
                    whileHover={{ scale: finalDisabled ? 1 : 1.05 }}
                    whileTap={{ scale: finalDisabled ? 1 : 0.95 }}
                >
                    <CheckboxPrimitive.Indicator
                        asChild
                        forceMount
                        className={cn('flex items-center justify-center', indicatorSize)}
                    >
                        <motion.svg
                            className={indicatorSize}
                            fill="none"
                            initial={false}
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="3.5"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            {/* Checkmark path - matches Animate UI */}
                            <motion.path
                                animate={{
                                    pathLength: finalChecked === true && !indeterminate ? 1 : 0,
                                    opacity: finalChecked === true && !indeterminate ? 1 : 0,
                                }}
                                d="M4.5 12.75l6 6 9-13.5"
                                initial={{ pathLength: 0, opacity: 0 }}
                                transition={{
                                    duration: 0.2,
                                    delay: finalChecked === true && !indeterminate ? 0.2 : 0,
                                }}
                            />

                            {/* Indeterminate line */}
                            <motion.line
                                animate={{
                                    pathLength: indeterminate ? 1 : 0,
                                    opacity: indeterminate ? 1 : 0,
                                }}
                                initial={{ pathLength: 0, opacity: 0 }}
                                strokeLinecap="round"
                                transition={{
                                    duration: 0.2,
                                }}
                                x1="5"
                                x2="19"
                                y1="12"
                                y2="12"
                            />
                        </motion.svg>
                    </CheckboxPrimitive.Indicator>
                </motion.button>
            </CheckboxPrimitive.Root>
        );
    },
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };
