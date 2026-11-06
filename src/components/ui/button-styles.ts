import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/src/lib/index";

const buttonFrame = cva(
	"t-interactive t-pressable group/button inline-flex shrink-0 cursor-pointer select-none items-center justify-center gap-[var(--button-content-gap)] whitespace-nowrap rounded-none border border-transparent bg-clip-padding font-medium text-[length:var(--foundation-type-control-size)] leading-[var(--foundation-type-control-leading)] outline-none [--button-content-gap:0.5rem] focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset disabled:pointer-events-none aria-invalid:border-transparent aria-invalid:ring-2 aria-invalid:ring-destructive aria-invalid:ring-inset data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
	{
		variants: {
			size: {
				default: "h-[var(--foundation-control-height-md)] px-3",
				xs: "h-[var(--foundation-control-height-xs)] px-2.5 text-[length:var(--foundation-type-control-compact-size)] leading-[var(--foundation-type-control-compact-leading)] [--button-content-gap:0.25rem] [&_svg:not([class*='size-'])]:size-3.5",
				sm: "h-[var(--foundation-control-height-sm)] px-3 text-[length:var(--foundation-type-control-size)] leading-[var(--foundation-type-control-leading)] [--button-content-gap:0.375rem] [&_svg:not([class*='size-'])]:size-3.5",
				lg: "h-[var(--foundation-control-height-lg)] px-4 text-sm/5",
				xl: "h-[var(--foundation-control-height-xl)] px-4",
				icon: "size-[var(--foundation-control-height-md)]",
				"icon-xs":
					"size-[var(--foundation-control-height-xs)] [&_svg:not([class*='size-'])]:size-3.5",
				"icon-sm": "size-[var(--foundation-control-height-sm)]",
				"icon-lg": "size-[var(--foundation-control-height-lg)]",
				"icon-xl": "size-[var(--foundation-control-height-xl)]",
			},
		},
		defaultVariants: {
			size: "default",
		},
	},
);

export type ButtonSize = NonNullable<VariantProps<typeof buttonFrame>["size"]> | "md" | "xl";
type ButtonAppearance = "solid" | "soft" | "outline" | "plain";
type ButtonColor =
	| "default"
	| "primary"
	| "secondary"
	| "accent"
	| "success"
	| "warning"
	| "info"
	| "destructive";

type ButtonLegacyVariant =
	| "default"
	| "outlined"
	| "secondary"
	| "accent"
	| "ghost"
	| "destructive"
	| "success"
	| "warning"
	| "info"
	| "link";

type ButtonVariant = ButtonAppearance | ButtonLegacyVariant;

const buttonColorClasses: Record<ButtonAppearance, Record<ButtonColor, string>> = {
	solid: {
		default:
			"bg-primary text-primary-foreground not-aria-disabled:hover:bg-primary-hover not-aria-disabled:active:bg-primary-active",
		primary:
			"bg-primary text-primary-foreground not-aria-disabled:hover:bg-primary-hover not-aria-disabled:active:bg-primary-active",
		secondary:
			"bg-secondary-solid text-secondary-solid-foreground not-aria-disabled:hover:bg-secondary-hover not-aria-disabled:active:bg-secondary-active",
		accent: "bg-accent-solid text-accent-solid-foreground not-aria-disabled:hover:bg-accent-solid-hover not-aria-disabled:active:bg-accent-solid-active",
		success:
			"bg-success text-success-foreground not-aria-disabled:hover:bg-success-hover not-aria-disabled:active:bg-success-active",
		warning:
			"bg-warning text-warning-foreground not-aria-disabled:hover:bg-warning-hover not-aria-disabled:active:bg-warning-active",
		info: "bg-info text-info-foreground not-aria-disabled:hover:bg-info-hover not-aria-disabled:active:bg-info-active",
		destructive:
			"bg-destructive text-destructive-foreground not-aria-disabled:hover:bg-destructive-hover not-aria-disabled:active:bg-destructive-active",
	},
	soft: {
		default:
			"bg-primary-soft text-primary-ink not-aria-disabled:hover:bg-primary-soft-hover not-aria-disabled:active:bg-primary-soft-active",
		primary:
			"bg-primary-soft text-primary-ink not-aria-disabled:hover:bg-primary-soft-hover not-aria-disabled:active:bg-primary-soft-active",
		secondary:
			"bg-secondary-soft text-secondary-ink not-aria-disabled:hover:bg-secondary-soft-hover not-aria-disabled:active:bg-secondary-soft-active",
		accent: "bg-accent-soft text-accent-ink not-aria-disabled:hover:bg-accent-soft-hover not-aria-disabled:active:bg-accent-soft-active",
		success:
			"bg-success-soft text-success-ink not-aria-disabled:hover:bg-success-soft-hover not-aria-disabled:active:bg-success-soft-active",
		warning:
			"bg-warning-soft text-warning-ink not-aria-disabled:hover:bg-warning-soft-hover not-aria-disabled:active:bg-warning-soft-active",
		info: "bg-info-soft text-info-ink not-aria-disabled:hover:bg-info-soft-hover not-aria-disabled:active:bg-info-soft-active",
		destructive:
			"bg-destructive-soft text-destructive-ink not-aria-disabled:hover:bg-destructive-soft-hover not-aria-disabled:active:bg-destructive-soft-active",
	},
	outline: {
		default:
			"bg-primary-soft text-primary-ink not-aria-disabled:hover:bg-primary-soft-hover not-aria-disabled:active:bg-primary-soft-active",
		primary:
			"bg-primary-soft text-primary-ink not-aria-disabled:hover:bg-primary-soft-hover not-aria-disabled:active:bg-primary-soft-active",
		secondary:
			"bg-secondary-soft text-secondary-ink not-aria-disabled:hover:bg-secondary-soft-hover not-aria-disabled:active:bg-secondary-soft-active",
		accent: "bg-accent-soft text-accent-ink not-aria-disabled:hover:bg-accent-soft-hover not-aria-disabled:active:bg-accent-soft-active",
		success:
			"bg-success-soft text-success-ink not-aria-disabled:hover:bg-success-soft-hover not-aria-disabled:active:bg-success-soft-active",
		warning:
			"bg-warning-soft text-warning-ink not-aria-disabled:hover:bg-warning-soft-hover not-aria-disabled:active:bg-warning-soft-active",
		info: "bg-info-soft text-info-ink not-aria-disabled:hover:bg-info-soft-hover not-aria-disabled:active:bg-info-soft-active",
		destructive:
			"bg-destructive-soft text-destructive-ink not-aria-disabled:hover:bg-destructive-soft-hover not-aria-disabled:active:bg-destructive-soft-active",
	},
	plain: {
		default:
			"bg-transparent text-primary-ink not-aria-disabled:hover:bg-primary-soft-hover not-aria-disabled:active:bg-primary-soft-active",
		primary:
			"bg-transparent text-primary-ink not-aria-disabled:hover:bg-primary-soft-hover not-aria-disabled:active:bg-primary-soft-active",
		secondary:
			"bg-transparent text-secondary-ink not-aria-disabled:hover:bg-secondary-soft-hover not-aria-disabled:active:bg-secondary-soft-active",
		accent: "bg-transparent text-accent-ink not-aria-disabled:hover:bg-accent-soft-hover not-aria-disabled:active:bg-accent-soft-active",
		success:
			"bg-transparent text-success-ink not-aria-disabled:hover:bg-success-soft-hover not-aria-disabled:active:bg-success-soft-active",
		warning:
			"bg-transparent text-warning-ink not-aria-disabled:hover:bg-warning-soft-hover not-aria-disabled:active:bg-warning-soft-active",
		info: "bg-transparent text-info-ink not-aria-disabled:hover:bg-info-soft-hover not-aria-disabled:active:bg-info-soft-active",
		destructive:
			"bg-transparent text-destructive-ink not-aria-disabled:hover:bg-destructive-soft-hover not-aria-disabled:active:bg-destructive-soft-active",
	},
};

const legacyButtonStyles: Record<
	ButtonLegacyVariant,
	{ appearance: ButtonAppearance; color: ButtonColor; link?: boolean }
> = {
	default: { appearance: "solid", color: "default" },
	outlined: { appearance: "outline", color: "default" },
	secondary: { appearance: "soft", color: "secondary" },
	accent: { appearance: "solid", color: "accent" },
	ghost: { appearance: "plain", color: "default" },
	destructive: { appearance: "solid", color: "destructive" },
	success: { appearance: "solid", color: "success" },
	warning: { appearance: "solid", color: "warning" },
	info: { appearance: "solid", color: "info" },
	link: { appearance: "plain", color: "primary", link: true },
};

export type ButtonStyleOptions = {
	variant?: ButtonVariant | null;
	color?: ButtonColor | null;
	size?: ButtonSize | null;
	className?: string;
	shape?: string | null;
};

export function resolveButtonStyle(variant: ButtonVariant = "default", color?: ButtonColor | null) {
	if (["solid", "soft", "outline", "plain"].includes(variant)) {
		return {
			appearance: variant as ButtonAppearance,
			color: color ?? "default",
			link: false,
		};
	}

	const legacy = legacyButtonStyles[variant as ButtonLegacyVariant];

	return {
		appearance: legacy.appearance,
		color: color ?? legacy.color,
		link: legacy.link ?? false,
	};
}

export function buttonVariants({
	variant = "default",
	color,
	size = "default",
	className,
}: ButtonStyleOptions = {}) {
	const resolved = resolveButtonStyle(variant ?? "default", color);

	return cn(
		buttonFrame({ size: size === "md" ? "default" : size }),
		buttonColorClasses[resolved.appearance][resolved.color],
		resolved.link && "underline-offset-4 hover:underline",
		className,
	);
}
