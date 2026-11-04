"use client";

import { RiEyeLine, RiEyeOffLine } from "@remixicon/react";
import { type ComponentProps, forwardRef, useId, useState } from "react";
import { cn } from "@/src/lib/index";
import { Button } from "../button";
import { FoundationInput } from "./foundation-input";

const heights = {
	xs: "h-[var(--foundation-control-height-xs)]",
	sm: "h-[var(--foundation-control-height-sm)]",
	md: "h-[var(--foundation-control-height-md)]",
	lg: "h-[var(--foundation-control-height-lg)]",
	xl: "h-[var(--foundation-control-height-xl)]",
	onboarding: "h-[var(--foundation-control-height-xl)]",
} as const;

/** Keeps existing portfolio field props while rendering the owned Foundation input. */
export interface InputProps extends Omit<ComponentProps<"input">, "size"> {
	hasError?: boolean;
	size?: keyof typeof heights | null;
	/** Kept for existing call sites; Foundation geometry is square. */
	shape?: string | null;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
	{ className, hasError, shape: _shape, size = "md", type = "text", id, ...props },
	ref,
) {
	const generatedId = useId();
	const inputId = id ?? `input-${generatedId}`;
	const [visible, setVisible] = useState(false);
	const password = type === "password";
	const invalid = hasError || props["aria-invalid"] || undefined;
	const [keyboard, setKeyboard] = useState(false);
	return (
		<div
			className={cn("relative flex w-full", password && "foundation-password-field")}
			data-slot={password ? "input-group" : undefined}
			data-size={size ?? "md"}
			aria-invalid={password ? invalid : undefined}
			data-motion-input={keyboard ? "keyboard" : undefined}
			onKeyDownCapture={() => setKeyboard(true)}
			onPointerDownCapture={() => setKeyboard(false)}
		>
			<FoundationInput
				{...props}
				ref={ref}
				data-slot={password ? "input-group-control" : "input"}
				id={inputId}
				type={password && visible ? "text" : type}
				aria-invalid={invalid}
				className={cn(heights[size ?? "md"], className)}
			/>
			{password && (
				<Button
					variant="plain"
					size="icon"
					data-input-group-action=""
					type="button"
					disabled={props.disabled}
					aria-controls={inputId}
					aria-label={visible ? "Hide password" : "Show password"}
					aria-pressed={visible}
					className="foundation-input-reveal absolute inset-y-0 right-0"
					onPointerDown={(event) => {
						if (event.button === 0 && document.activeElement?.id === inputId)
							event.preventDefault();
					}}
					onClick={() => setVisible((current) => !current)}
				>
					<span
						className="t-icon-swap"
						data-state={visible ? "b" : "a"}
						aria-hidden="true"
					>
						<RiEyeLine className="t-icon size-4" data-icon="a" />
						<RiEyeOffLine className="t-icon size-4" data-icon="b" />
					</span>
				</Button>
			)}
		</div>
	);
});
