"use client";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";
import { IconChamber } from "@/src/components/ui/icon-chamber";
import { cn } from "@/src/lib/index";

const badgeFrame = cva(
	"group/badge inline-flex w-fit shrink-0 items-center justify-center overflow-hidden whitespace-nowrap rounded-none border border-transparent align-middle font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset aria-invalid:ring-2 aria-invalid:ring-destructive aria-invalid:ring-inset [&>svg]:pointer-events-none",
	{
		variants: {
			size: {
				sm: "h-6 gap-1 px-1 text-[length:var(--foundation-type-meta-size)] leading-[var(--foundation-type-meta-leading)] [&>svg]:size-4!",
				default:
					"h-7 gap-1.5 px-1.5 text-[length:var(--foundation-type-meta-size)] leading-[var(--foundation-type-meta-leading)] [&>svg]:size-4!",
				lg: "h-8 gap-1.5 px-1.5 text-[length:var(--foundation-type-description-size)] leading-5 [&>svg]:size-5!",
			},
		},
		defaultVariants: {
			size: "default",
		},
	},
);

type BadgeSize = NonNullable<VariantProps<typeof badgeFrame>["size"]> | "md";
type BadgeAppearance = "solid" | "soft" | "outline" | "plain";
type BadgeColor =
	| "default"
	| "primary"
	| "secondary"
	| "accent"
	| "success"
	| "warning"
	| "info"
	| "destructive";

type BadgeLegacyVariant =
	| "default"
	| "secondary"
	| "accent"
	| "success"
	| "warning"
	| "info"
	| "destructive"
	| "outlined"
	| "ghost"
	| "link";

type BadgeVariant = BadgeAppearance | BadgeLegacyVariant;

const badgeColorClasses: Record<BadgeAppearance, Record<BadgeColor, string>> = {
	solid: {
		default: "bg-primary text-primary-foreground",
		primary: "bg-primary text-primary-foreground",
		secondary: "bg-secondary-solid text-secondary-solid-foreground",
		accent: "bg-accent-solid text-accent-solid-foreground",
		success: "bg-success text-success-foreground",
		warning: "bg-warning text-warning-foreground",
		info: "bg-info text-info-foreground",
		destructive: "bg-destructive text-destructive-foreground",
	},
	soft: {
		default: "bg-primary-soft text-primary-ink",
		primary: "bg-primary-soft text-primary-ink",
		secondary: "bg-secondary-soft text-secondary-ink",
		accent: "bg-accent-soft text-accent-ink",
		success: "bg-success-soft text-success-ink",
		warning: "bg-warning-soft text-warning-ink",
		info: "bg-info-soft text-info-ink",
		destructive: "bg-destructive-soft text-destructive-ink",
	},
	outline: {
		default: "bg-primary-soft text-primary-ink",
		primary: "bg-primary-soft text-primary-ink",
		secondary: "bg-secondary-soft text-secondary-ink",
		accent: "bg-accent-soft text-accent-ink",
		success: "bg-success-soft text-success-ink",
		warning: "bg-warning-soft text-warning-ink",
		info: "bg-info-soft text-info-ink",
		destructive: "bg-destructive-soft text-destructive-ink",
	},
	plain: {
		default: "bg-transparent text-primary-ink",
		primary: "bg-transparent text-primary-ink",
		secondary: "bg-transparent text-secondary-ink",
		accent: "bg-transparent text-accent-ink",
		success: "bg-transparent text-success-ink",
		warning: "bg-transparent text-warning-ink",
		info: "bg-transparent text-info-ink",
		destructive: "bg-transparent text-destructive-ink",
	},
};

const badgeInteractiveClasses: Record<BadgeAppearance, Record<BadgeColor, string>> = {
	solid: {
		default: "hover:bg-primary-hover active:bg-primary-active",
		primary: "hover:bg-primary-hover active:bg-primary-active",
		secondary: "hover:bg-secondary-hover active:bg-secondary-active",
		accent: "hover:bg-accent-solid-hover active:bg-accent-solid-active",
		success: "hover:bg-success-hover active:bg-success-active",
		warning: "hover:bg-warning-hover active:bg-warning-active",
		info: "hover:bg-info-hover active:bg-info-active",
		destructive: "hover:bg-destructive-hover active:bg-destructive-active",
	},
	soft: {
		default: "hover:bg-primary-soft-hover active:bg-primary-soft-active",
		primary: "hover:bg-primary-soft-hover active:bg-primary-soft-active",
		secondary: "hover:bg-secondary-soft-hover active:bg-secondary-soft-active",
		accent: "hover:bg-accent-soft-hover active:bg-accent-soft-active",
		success: "hover:bg-success-soft-hover active:bg-success-soft-active",
		warning: "hover:bg-warning-soft-hover active:bg-warning-soft-active",
		info: "hover:bg-info-soft-hover active:bg-info-soft-active",
		destructive: "hover:bg-destructive-soft-hover active:bg-destructive-soft-active",
	},
	outline: {
		default: "hover:bg-primary-soft-hover active:bg-primary-soft-active",
		primary: "hover:bg-primary-soft-hover active:bg-primary-soft-active",
		secondary: "hover:bg-secondary-soft-hover active:bg-secondary-soft-active",
		accent: "hover:bg-accent-soft-hover active:bg-accent-soft-active",
		success: "hover:bg-success-soft-hover active:bg-success-soft-active",
		warning: "hover:bg-warning-soft-hover active:bg-warning-soft-active",
		info: "hover:bg-info-soft-hover active:bg-info-soft-active",
		destructive: "hover:bg-destructive-soft-hover active:bg-destructive-soft-active",
	},
	plain: {
		default: "hover:bg-primary-soft-hover active:bg-primary-soft-active",
		primary: "hover:bg-primary-soft-hover active:bg-primary-soft-active",
		secondary: "hover:bg-secondary-soft-hover active:bg-secondary-soft-active",
		accent: "hover:bg-accent-soft-hover active:bg-accent-soft-active",
		success: "hover:bg-success-soft-hover active:bg-success-soft-active",
		warning: "hover:bg-warning-soft-hover active:bg-warning-soft-active",
		info: "hover:bg-info-soft-hover active:bg-info-soft-active",
		destructive: "hover:bg-destructive-soft-hover active:bg-destructive-soft-active",
	},
};

const legacyBadgeStyles: Record<
	BadgeLegacyVariant,
	{ appearance: BadgeAppearance; color: BadgeColor; link?: boolean }
> = {
	default: { appearance: "solid", color: "default" },
	secondary: { appearance: "soft", color: "secondary" },
	accent: { appearance: "soft", color: "accent" },
	success: { appearance: "soft", color: "success" },
	warning: { appearance: "soft", color: "warning" },
	info: { appearance: "soft", color: "info" },
	destructive: { appearance: "soft", color: "destructive" },
	outlined: { appearance: "outline", color: "default" },
	ghost: { appearance: "plain", color: "default" },
	link: { appearance: "plain", color: "primary", link: true },
};

type BadgeStyleOptions = {
	variant?: BadgeVariant | null;
	color?: BadgeColor | null;
	size?: BadgeSize | null;
	interactive?: boolean;
	className?: string;
};

function resolveBadgeStyle(variant: BadgeVariant = "default", color?: BadgeColor | null) {
	if (["solid", "soft", "outline", "plain"].includes(variant)) {
		return {
			appearance: variant as BadgeAppearance,
			color: color ?? "default",
			link: false,
		};
	}

	const legacy = legacyBadgeStyles[variant as BadgeLegacyVariant];

	return {
		appearance: legacy.appearance,
		color: color ?? legacy.color,
		link: legacy.link ?? false,
	};
}

function badgeVariants({
	variant = "default",
	color,
	size = "default",
	interactive = false,
	className,
}: BadgeStyleOptions = {}) {
	const resolved = resolveBadgeStyle(variant ?? "default", color);

	return cn(
		badgeFrame({ size: size === "md" ? "default" : size }),
		badgeColorClasses[resolved.appearance][resolved.color],
		interactive && "t-interactive t-pressable cursor-pointer",
		interactive && badgeInteractiveClasses[resolved.appearance][resolved.color],
		resolved.link && "underline-offset-4 hover:underline",
		className,
	);
}

type BadgeProps = Omit<useRender.ComponentProps<"span">, "color"> &
	BadgeStyleOptions & { chamber?: ReactNode; shape?: "default" | "sm" | "md" | "full" };

function Badge({
	className,
	variant = "default",
	color,
	size = "default",
	interactive = false,
	render,
	shape: _shape,
	chamber,
	children,
	...props
}: BadgeProps) {
	const resolvedStyle = resolveBadgeStyle(variant ?? "default", color);

	return useRender({
		defaultTagName: "span",
		props: mergeProps<"span">(
			{
				children: chamber ? (
					<>
						<IconChamber size="xs" aria-hidden="true">
							{chamber}
						</IconChamber>
						<span data-slot="badge-label">{children}</span>
					</>
				) : (
					children
				),
				className: badgeVariants({
					variant,
					color,
					size,
					interactive: interactive && render != null,
					className,
				}),
			},
			props,
		),
		render,
		state: {
			slot: "badge",
			appearance: resolvedStyle.appearance,
			color: resolvedStyle.color,
			variant,
			size,
			interactive,
			chamber: Boolean(chamber),
		},
	});
}

export {
	Badge,
	type BadgeAppearance,
	type BadgeColor,
	type BadgeProps,
	type BadgeVariant,
	badgeVariants,
};
