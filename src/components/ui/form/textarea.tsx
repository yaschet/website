/**
 * Multi-line text input component.
 *
 * @remarks
 * Extends standard textarea attributes with explicit error state support and custom styling.
 *
 * @example
 * ```tsx
 * <Textarea placeholder="Enter your message" hasError={Boolean(errors.message)} />
 * ```
 *
 * @public
 */

"use client";

import * as React from "react";
import { cn } from "@/src/lib/index";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
	hasError?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
	({ className, hasError, ...props }, ref) => {
		return (
			<textarea
				className={cn(
					"flex min-h-[calc(var(--portfolio-grid-step)*8)] w-full",
					"border-2 border-surface-300 dark:border-surface-700",
					"bg-white dark:bg-surface-950",
					"portfolio-chip-label",
					"text-surface-900 dark:text-surface-50",
					"placeholder:font-mono placeholder:text-xs placeholder:uppercase placeholder:tracking-[0.08em]",
					"placeholder:text-surface-500 dark:placeholder:text-surface-400",
					"px-[var(--portfolio-control-pad-default)] py-[var(--portfolio-control-pad-default)]",
					"rounded-none ring-offset-background",
					"transition-all duration-200 ease-out",
					"hover:border-surface-900 hover:bg-white",
					"dark:hover:border-surface-100 dark:hover:bg-surface-950",
					"focus-visible:border-surface-900 focus-visible:bg-surface-50 focus-visible:outline-none",
					"dark:focus-visible:border-surface-100 dark:focus-visible:bg-surface-900",
					"disabled:cursor-not-allowed disabled:opacity-50",
					hasError &&
						"border-destructive-500 bg-destructive-50 focus-visible:border-destructive-600 dark:border-destructive-500 dark:bg-destructive-950/50",
					className,
				)}
				ref={ref}
				{...props}
			/>
		);
	},
);
Textarea.displayName = "Textarea";

export { Textarea };
