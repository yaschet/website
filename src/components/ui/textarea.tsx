"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
	hasError?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
	({ className, hasError, ...props }, ref) => {
		return (
			<textarea
				className={cn(
					// Base structure
					"flex min-h-[160px] w-full",
					// Borders - 2px for premium punch
					"border-2 border-surface-300 dark:border-surface-700",
					// Backgrounds - white/dark for high contrast
					"bg-white dark:bg-surface-950",
					// Typography - monospace, uppercase, wide tracking
					"font-mono text-xs uppercase tracking-wider",
					"text-surface-900 dark:text-surface-50",
					// Placeholder styling
					"placeholder:font-mono placeholder:text-xs placeholder:uppercase placeholder:tracking-wider",
					"placeholder:text-surface-500 dark:placeholder:text-surface-400",
					// Spacing
					"px-5 py-4",
					// Shape
					"rounded-none ring-offset-background",
					// Transitions
					"transition-all duration-200 ease-out",
					// Hover states
					"hover:border-surface-900 hover:bg-white",
					"dark:hover:border-surface-100 dark:hover:bg-surface-950",
					// Focus states - bold, no layout shift
					"focus-visible:border-surface-900 focus-visible:bg-surface-50 focus-visible:outline-none",
					"dark:focus-visible:border-surface-100 dark:focus-visible:bg-surface-900",
					// Disabled state
					"disabled:cursor-not-allowed disabled:opacity-50",
					// Error state override
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
