"use client";

import type * as React from "react";

import { cn } from "@/src/lib/index";

function Label({ className, htmlFor, children, ...props }: React.ComponentProps<"label">) {
	return (
		<label
			data-slot="label"
			htmlFor={htmlFor}
			className={cn(
				"flex select-none items-center gap-2 font-medium text-[length:var(--foundation-type-label-size)] leading-[var(--foundation-type-label-leading)] peer-disabled:cursor-not-allowed peer-disabled:opacity-50 group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]/field:cursor-not-allowed group-data-[disabled=true]:cursor-not-allowed group-data-[disabled=true]:opacity-50",
				htmlFor && "cursor-pointer",
				className,
			)}
			{...props}
		>
			{children}
		</label>
	);
}

export { Label };
