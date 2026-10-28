import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/src/lib/index";

const alertVariants = cva(
	"group/alert relative grid w-full gap-y-1 rounded-none border-0 text-left text-[length:var(--foundation-type-description-size)] leading-[var(--foundation-type-description-leading)] has-[>svg]:grid-cols-[16px_minmax(0,1fr)] has-[>svg]:gap-x-2 has-data-[slot=alert-action]:pr-18 [&>svg]:mt-0.5 [&>svg]:size-4 [&>svg]:text-current has-[>[data-slot=alert-title]]:[&>svg]:row-span-2",
	{
		variants: {
			appearance: {
				surface: "p-3",
				chamber: "grid-cols-[44px_minmax(0,1fr)] items-stretch gap-0 p-0",
			},
			variant: {
				default: "bg-control-surface text-card-foreground",
				success:
					"bg-success-soft text-success-ink *:data-[slot=alert-description]:text-success-ink",
				warning:
					"bg-warning-soft text-warning-ink *:data-[slot=alert-description]:text-warning-ink",
				info: "bg-info-soft text-info-ink *:data-[slot=alert-description]:text-info-ink",
				destructive:
					"bg-destructive-soft text-destructive-ink *:data-[slot=alert-description]:text-destructive-ink",
			},
		},
		defaultVariants: {
			appearance: "surface",
			variant: "default",
		},
	},
);

function Alert({
	className,
	variant,
	appearance = "surface",
	...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
	return (
		<div
			data-slot="alert"
			data-variant={variant ?? "default"}
			data-appearance={appearance}
			role="alert"
			className={cn(alertVariants({ variant, appearance }), className)}
			{...props}
		/>
	);
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="alert-title"
			className={cn(
				"font-medium group-has-[>svg]/alert:col-start-2 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground",
				className,
			)}
			{...props}
		/>
	);
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="alert-description"
			className={cn(
				"text-pretty text-[length:var(--foundation-type-description-size)] text-muted-foreground leading-[var(--foundation-type-description-leading)] group-has-[>svg]/alert:col-start-2 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-2",
				className,
			)}
			{...props}
		/>
	);
}

function AlertAction({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="alert-action"
			className={cn(
				"absolute top-[calc(--spacing(1.25))] right-[calc(--spacing(1.25))]",
				className,
			)}
			{...props}
		/>
	);
}

export { Alert, AlertAction, AlertDescription, AlertTitle };
