import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/src/lib/index";
import styles from "./containers.module.css";

interface PageContainerProps extends ComponentPropsWithoutRef<"div"> {
	/** Let an inset content frame own the mobile gutter, avoiding two nested insets. */
	mobileBleed?: boolean;
}

export function PageContainer({ className, mobileBleed = false, ...props }: PageContainerProps) {
	return (
		<div
			data-mobile-bleed={mobileBleed || undefined}
			className={cn(
				"mx-auto w-full max-w-5xl px-[var(--portfolio-page-gutter-mobile)] sm:px-[var(--portfolio-page-gutter-desktop)]",
				mobileBleed && styles.mobileBleed,
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
