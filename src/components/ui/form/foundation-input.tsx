"use client";
import { Input as InputPrimitive } from "@base-ui/react/input";
import type * as React from "react";

import { cn } from "@/src/lib/index";

function FoundationInput({
	className,
	type,
	controlSize = "default",
	...props
}: React.ComponentProps<"input"> & {
	controlSize?: "default" | "lg";
}) {
	return (
		<InputPrimitive
			type={type}
			data-slot="input"
			data-control-size={controlSize}
			className={cn(
				"t-interactive h-[var(--foundation-control-height-md)] w-full min-w-0 cursor-text rounded-none border-0 bg-control-surface px-3 py-1.5 text-[length:var(--foundation-type-control-size)] leading-[var(--foundation-type-control-leading)] outline-none ring-1 ring-input ring-inset file:inline-flex file:h-7 file:border-0 file:bg-transparent file:font-medium file:text-[length:var(--foundation-type-control-compact-size)] file:text-foreground placeholder:text-muted-foreground focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-control-surface disabled:opacity-50 aria-invalid:border-transparent aria-invalid:ring-1 aria-invalid:ring-destructive/50 aria-invalid:ring-inset",
				controlSize === "lg" && "h-[var(--foundation-control-height-lg)]",
				className,
			)}
			{...props}
		/>
	);
}

export { FoundationInput };
