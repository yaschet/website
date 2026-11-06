import type * as React from "react";

import { cn } from "@/src/lib/index";

function Textarea({
	className,
	hasError,
	...props
}: React.ComponentProps<"textarea"> & { hasError?: boolean }) {
	return (
		<textarea
			data-slot="textarea"
			aria-invalid={hasError || undefined}
			className={cn(
				"t-interactive field-sizing-content flex min-h-18 w-full cursor-text resize-none rounded-none border border-transparent bg-control-surface px-3 py-2.5 text-[length:var(--foundation-type-control-size)] leading-[var(--foundation-type-control-leading)] outline-none ring-1 ring-input ring-inset placeholder:text-muted-foreground focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset disabled:cursor-not-allowed disabled:bg-control-surface disabled:opacity-50 aria-invalid:border-transparent aria-invalid:ring-1 aria-invalid:ring-destructive/50 aria-invalid:ring-inset",
				className,
			)}
			{...props}
		/>
	);
}

export { Textarea };
