/**
 * Text input component with integrated password visibility toggle.
 *
 * @remarks
 * Supports various sizes and error states. Styled with Tailwind CSS variants.
 *
 * @example
 * ```tsx
 * <Input type="email" placeholder="Email" />
 * <Input type="password" placeholder="Password" />
 * ```
 *
 * @public
 */

"use client";

import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/src/lib/index";

// ═══════════════════════════════════════════════════════════════════════════
// VARIANTS
// ═══════════════════════════════════════════════════════════════════════════

const inputVariants = cva(
	[
		"block w-full border-2 border-surface-300 dark:border-surface-700",
		"bg-white dark:bg-surface-950",
		"font-mono text-surface-900 text-xs uppercase tracking-wider dark:text-surface-50",
		"placeholder:font-mono placeholder:text-xs placeholder:uppercase placeholder:tracking-wider",
		"placeholder:text-surface-500 dark:placeholder:text-surface-400",
		"rounded-none ring-offset-background",
		"transition-all duration-200 ease-out",
		"hover:border-surface-900 hover:bg-white dark:hover:border-surface-100 dark:hover:bg-surface-950",
		"focus-visible:border-surface-900 focus-visible:bg-surface-50 focus-visible:outline-none dark:focus-visible:border-surface-100 dark:focus-visible:bg-surface-900",
		// Disabled / Read-only states
		"disabled:cursor-not-allowed disabled:opacity-50",
		"read-only:cursor-default read-only:bg-surface-100 dark:read-only:bg-surface-900",
		// Autofill Overrides
		"[&:-webkit-autofill]:shadow-[0_0_0_1000px_white_inset] dark:[&:-webkit-autofill]:shadow-[0_0_0_1000px_rgb(9,9,11)_inset]",
		"[&:-webkit-autofill]:!-webkit-text-fill-color:var(--foreground)",
		"[&[data-com-onepassword-filled]]:shadow-[0_0_0_1000px_white_inset] dark:[&[data-com-onepassword-filled]]:shadow-[0_0_0_1000px_rgb(9,9,11)_inset]",
	],
	{
		variants: {
			error: {
				false: "",
				true: "border-destructive-500 bg-destructive-50 focus-visible:border-destructive-600 dark:border-destructive-500 dark:bg-destructive-950/50",
			},
			shape: {
				none: "rounded-none",
				xs: "rounded-none",
				sm: "rounded-none",
				md: "rounded-none",
				lg: "rounded-none",
				xl: "rounded-none",
				full: "rounded-none",
				default: "rounded-none",
			},
			size: {
				xs: "h-9 px-3 py-2",
				sm: "h-11 px-4 py-2.5",
				md: "h-12 px-5 py-3",
				lg: "h-14 px-6 py-4",
				xl: "h-16 px-8 py-5",
				onboarding: "h-20 px-10 text-base",
			},
		},
		defaultVariants: {
			error: false,
			shape: "default",
			size: "md",
		},
	},
);

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface InputProps
	extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "shape" | "ref">,
		VariantProps<typeof inputVariants> {
	/** Unique identifier for the input element */
	id?: string;
	/** Display a destructive error state */
	hasError?: boolean;
	/** Ref to the underlying input element */
	ref?: React.ForwardedRef<HTMLInputElement>;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Input
 *
 * A scalable input primitive with native support for password toggling.
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, hasError = false, shape, size, type = "text", ...props }, ref) => {
		const [isPasswordVisible, setPasswordVisible] = React.useState(false);
		const reactId = React.useId();
		const inputId = props.id || `input-${reactId}`;

		const handleTogglePassword = () => setPasswordVisible(!isPasswordVisible);

		return (
			<div className="group relative flex w-full flex-row">
				<input
					ref={ref}
					aria-describedby={hasError ? `${inputId}-error` : undefined}
					aria-invalid={hasError}
					className={cn(inputVariants({ error: hasError, shape, size }), className)}
					id={inputId}
					type={type === "password" && isPasswordVisible ? "text" : type}
					{...props}
				/>
				{type === "password" && (
					<button
						aria-controls={inputId}
						aria-label={isPasswordVisible ? "Hide password" : "Show password"}
						aria-pressed={isPasswordVisible}
						className={cn(
							"absolute inset-y-0 right-0 flex items-center justify-center text-muted-foreground",
							"outline-none transition-colors hover:text-foreground focus-visible:text-primary",
							// Align padding with the input's horizontal padding
							size === "xs" && "px-3",
							size === "sm" && "px-4",
							size === "md" && "px-5",
							size === "lg" && "px-6",
							size === "xl" && "px-8",
							size === "onboarding" && "px-10",
						)}
						type="button"
						onClick={handleTogglePassword}
					>
						{isPasswordVisible ? (
							<EyeClosedIcon size={getIconSize(size)} />
						) : (
							<EyeOpenIcon size={getIconSize(size)} />
						)}
					</button>
				)}
			</div>
		);
	},
);

Input.displayName = "Input";

// ═══════════════════════════════════════════════════════════════════════════
// INTERNAL UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

const getIconSize = (size: InputProps["size"]) => {
	if (size === "xs") return 14;
	if (size === "sm") return 16;
	if (size === "lg") return 20;
	if (size === "xl" || size === "onboarding") return 24;
	return 18;
};

const EyeOpenIcon = ({ size }: { size: number }) => (
	<svg
		aria-hidden="true"
		fill="none"
		height={size}
		stroke="currentColor"
		strokeLinecap="round"
		strokeLinejoin="round"
		strokeWidth="2"
		viewBox="0 0 24 24"
		width={size}
		xmlns="http://www.w3.org/2000/svg"
	>
		<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
		<circle cx="12" cy="12" r="3" />
	</svg>
);

const EyeClosedIcon = ({ size }: { size: number }) => (
	<svg
		aria-hidden="true"
		fill="none"
		height={size}
		stroke="currentColor"
		strokeLinecap="round"
		strokeLinejoin="round"
		strokeWidth="2"
		viewBox="0 0 24 24"
		width={size}
		xmlns="http://www.w3.org/2000/svg"
	>
		<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
		<line x1="1" x2="23" y1="1" y2="23" />
	</svg>
);

export { Input };
