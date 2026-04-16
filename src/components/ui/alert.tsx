"use client";

import { XIcon } from "@phosphor-icons/react";
import { cva, type VariantProps } from "class-variance-authority";
import { AnimatePresence, type MotionProps, motion } from "framer-motion";
import * as React from "react";

import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/index";

const alertVariants = cva(
	"portfolio-body-sm relative flex w-full flex-row flex-wrap items-start justify-start gap-[var(--portfolio-space-tight)] overflow-hidden rounded-[var(--radius)] border p-[var(--portfolio-space-related)]",
	{
		defaultVariants: {
			variant: "default",
		},
		variants: {
			variant: {
				default:
					"border-surface-200 bg-surface-1 text-foreground dark:border-surface-800 dark:bg-surface-2",
				destructive:
					"border-destructive-200 bg-destructive-50/50 text-destructive-500 dark:border-destructive-800 dark:bg-destructive-950/20 dark:text-destructive-500",
				info: "border-info-200 bg-info-50/50 text-info-500 dark:border-info-800 dark:bg-info-950/20 dark:text-info-500",
				success:
					"border-success-200 bg-success-50/50 text-success-500 dark:border-success-800 dark:bg-success-950/20 dark:text-success-500",
				warning:
					"border-warning-200 bg-warning-50/50 text-warning-500 dark:border-warning-800 dark:bg-warning-950/20 dark:text-warning-500",
			},
		},
	},
);

export interface AlertProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof alertVariants> {
	onClose?: () => void;
	withCloseButton?: boolean;
	show?: boolean;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
	(
		{ children, className, onClose, show = true, variant, withCloseButton = true, ...props },
		ref,
	) => {
		return (
			<AnimatePresence mode="wait">
				{show && (
					<motion.div
						ref={ref}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						className={cn(alertVariants({ variant }), className)}
						exit={{ opacity: 0, scale: 0.95, y: 5 }}
						initial={{ opacity: 0, scale: 0.95, y: -5 }}
						role="alert"
						transition={{ duration: 0.2, ease: "easeOut" }}
						{...(props as MotionProps)}
					>
						<div className="flex flex-1 flex-col items-start justify-start gap-1">
							{children}
						</div>

						{withCloseButton && (
							<Button
								className="mt-[2px]"
								color={variant === "destructive" ? "destructive" : "default"}
								size="icon-sm"
								type="button"
								variant="soft"
								onClick={onClose}
							>
								<XIcon weight="bold" />
								<span className="sr-only">Dismiss</span>
							</Button>
						)}
					</motion.div>
				)}
			</AnimatePresence>
		);
	},
);
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
	({ className, ...props }, ref) => (
		<h5
			ref={ref}
			className={cn("portfolio-control-label text-foreground", className)}
			{...props}
		/>
	),
);
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
	HTMLParagraphElement,
	React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
	<div ref={ref} className={cn("text-pretty text-current/90", className)} {...props} />
));
AlertDescription.displayName = "AlertDescription";

const AlertIcon = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({ children, className, ...props }, ref) => (
		<div
			ref={ref}
			className={cn("mt-[2px] size-[var(--portfolio-icon-sm)] opacity-90", className)}
			{...props}
		>
			{children}
		</div>
	),
);
AlertIcon.displayName = "AlertIcon";

export { Alert, AlertDescription, AlertIcon, AlertTitle };
