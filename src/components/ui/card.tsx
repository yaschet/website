/**
 * Compound component for displaying grouped content.
 *
 * @remarks
 * Includes subcomponents for Header, Title, Description, Content, and Footer.
 *
 * @example
 * ```tsx
 * <Card>
 *   <CardHeader>
 *     <CardTitle>Title</CardTitle>
 *     <CardDescription>Description</CardDescription>
 *   </CardHeader>
 *   <CardContent>Content</CardContent>
 *   <CardFooter>Footer</CardFooter>
 * </Card>
 * ```
 *
 * @public
 */

import * as React from "react";
import { cn } from "@/src/lib/index";

// ═══════════════════════════════════════════════════════════════════════════
// UI PRIMITIVES
// ═══════════════════════════════════════════════════════════════════════════

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({ className, ...props }, ref) => (
		<div
			ref={ref}
			className={cn(
				"flex w-full flex-col rounded-[var(--radius)] border border-border bg-card text-card-foreground shadow-sm",
				className,
			)}
			{...props}
		/>
	),
);
Card.displayName = "Card";

/**
 * CardHeader - High-level layout grouping within a card.
 */
const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({ className, ...props }, ref) => (
		<div ref={ref} className={cn("flex w-full flex-col gap-2 p-6", className)} {...props} />
	),
);
CardHeader.displayName = "CardHeader";

/**
 * CardTitle - Semantic heading for card context.
 */
const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
	({ className, ...props }, ref) => (
		<h3
			ref={ref}
			className={cn("w-full font-bold text-xl leading-none tracking-tight", className)}
			{...props}
		/>
	),
);
CardTitle.displayName = "CardTitle";

/**
 * CardDescription - Supporting typography for the card title.
 */
const CardDescription = React.forwardRef<
	HTMLParagraphElement,
	React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
	<p ref={ref} className={cn("w-full font-normal text-base text-muted", className)} {...props} />
));
CardDescription.displayName = "CardDescription";

/**
 * CardContent - The primary data container within a card.
 */
const CardContent = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement> & { asChild?: boolean }
>(({ asChild = false, children, className, ...props }, ref) => {
	if (asChild) {
		return React.cloneElement(
			React.Children.only(children) as React.ReactElement<
				React.HTMLAttributes<HTMLElement> & { ref?: React.Ref<unknown> }
			>,
			{
				...props,
				ref,
				className: cn("w-full p-6 pt-0", className),
			},
		);
	}
	return (
		<div ref={ref} className={cn("w-full p-6 pt-0", className)} {...props}>
			{children}
		</div>
	);
});
CardContent.displayName = "CardContent";

/**
 * CardFooter - Actionable or metadata area at the card terminus.
 */
const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({ className, ...props }, ref) => (
		<div ref={ref} className={cn("flex w-full items-center p-6 pt-0", className)} {...props} />
	),
);
CardFooter.displayName = "CardFooter";

/**
 * DefaultCard - Integrated container pattern for rapid composition.
 */
const DefaultCard = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({ className, ...props }, ref) => (
		<div
			ref={ref}
			className={cn(
				"w-full rounded-[var(--radius)] border border-border bg-card p-4 text-card-foreground shadow-sm md:p-6",
				className,
			)}
			{...props}
		/>
	),
);
DefaultCard.displayName = "DefaultCard";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, DefaultCard };
