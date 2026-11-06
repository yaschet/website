import type { ComponentProps, ReactNode } from "react";
import {
	type ButtonStyleOptions,
	buttonVariants,
	resolveButtonStyle,
} from "@/src/components/ui/button-styles";
import { PortfolioLink as Link } from "@/src/components/ui/portfolio-link";
import { LinkFeedback } from "./link-feedback";

type ButtonLinkProps = Omit<ComponentProps<typeof Link>, "color"> &
	ButtonStyleOptions & {
		icon?: ReactNode;
		iconPosition?: "start" | "end";
	};

/** A native navigation link with the complete Foundation button material contract. */
export function ButtonLink({
	variant = "solid",
	color,
	size = "default",
	shape: _shape,
	className,
	children,
	icon,
	iconPosition = "end",
	...props
}: ButtonLinkProps) {
	const style = resolveButtonStyle(variant ?? "solid", color);
	return (
		<Link
			transitionTypes={["navigation"]}
			data-slot="button"
			data-appearance={style.appearance}
			data-color={style.color}
			data-size={size}
			className={buttonVariants({ variant, color, size, className })}
			{...props}
		>
			<LinkFeedback
				icon={icon}
				iconPosition={iconPosition}
				iconOnly={size?.startsWith("icon")}
			>
				{children}
			</LinkFeedback>
		</Link>
	);
}
