import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/src/lib/index";

export function PageContainer({ className, ...props }: ComponentPropsWithoutRef<"div">) {
	return (
		<div
			className={cn(
				"mx-auto w-full max-w-5xl px-[var(--portfolio-box-pad-mobile)] sm:px-[var(--portfolio-space-2)]",
				className,
			)}
			{...props}
		/>
	);
}

export function ModuleContainer({ className, ...props }: ComponentPropsWithoutRef<"div">) {
	return <div className={cn("w-full max-w-4xl", className)} {...props} />;
}

export function ProseContainer({ className, ...props }: ComponentPropsWithoutRef<"div">) {
	return <div className={cn("w-full max-w-[68ch]", className)} {...props} />;
}
