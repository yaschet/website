import { RiLoaderLine } from "@remixicon/react";
import type { ComponentProps } from "react";
import { cn } from "@/src/lib/index";

const sizes = { xs: 16, sm: 20, md: 24, lg: 32, xl: 48 } as const;
const colors = {
	default: "text-current",
	primary: "text-primary",
	secondary: "text-secondary-foreground",
	accent: "text-accent-ink",
	info: "text-info",
	success: "text-success",
	warning: "text-warning",
	destructive: "text-destructive",
	white: "text-white",
} as const;

/** The same Remix loader used by Foundation, with existing portfolio size aliases. */
export interface SpinnerProps extends Omit<ComponentProps<"svg">, "color" | "children"> {
	size?: keyof typeof sizes | number;
	color?: keyof typeof colors;
}

/** Announces loading unless the caller marks this decorative alongside visible text. */
export function Spinner({
	className,
	size = "xs",
	color = "default",
	style,
	...props
}: SpinnerProps) {
	const pixels = typeof size === "number" ? size : sizes[size];
	return (
		<RiLoaderLine
			data-slot="spinner"
			role="status"
			aria-label="Loading"
			className={cn("animate-spin", colors[color], className)}
			style={{ width: pixels, height: pixels, ...style }}
			{...props}
		/>
	);
}
