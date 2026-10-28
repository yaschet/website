import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/src/lib/index";

const iconChamberVariants = cva(
	"inline-flex aspect-square shrink-0 items-center justify-center overflow-hidden rounded-none [&_svg]:pointer-events-none [&_svg]:shrink-0",
	{
		variants: {
			size: {
				xs: "size-[var(--foundation-control-height-xs)] [&_svg:not([class*='size-'])]:size-3",
				sm: "size-[var(--foundation-control-height-sm)] [&_svg:not([class*='size-'])]:size-3.5",
				default:
					"size-[var(--foundation-control-height-md)] [&_svg:not([class*='size-'])]:size-4",
				lg: "size-[var(--foundation-control-height-lg)] [&_svg:not([class*='size-'])]:size-[18px]",
				xl: "size-[var(--foundation-control-height-xl)] [&_svg:not([class*='size-'])]:size-6",
			},
			color: {
				default: "bg-primary-soft text-primary-ink",
				primary: "bg-primary-soft text-primary-ink",
				secondary: "bg-secondary-soft text-secondary-ink",
				accent: "bg-accent-soft text-accent-ink",
				success: "bg-success-soft text-success-ink",
				warning: "bg-warning-soft text-warning-ink",
				info: "bg-info-soft text-info-ink",
				destructive: "bg-destructive-soft text-destructive-ink",
			},
		},
		defaultVariants: {
			size: "sm",
			color: "secondary",
		},
	},
);

type IconChamberProps = Omit<React.ComponentProps<"span">, "color"> &
	VariantProps<typeof iconChamberVariants>;

function IconChamber({ className, size = "sm", color = "secondary", ...props }: IconChamberProps) {
	return (
		<span
			data-slot="icon-chamber"
			data-size={size}
			data-color={color}
			className={cn(iconChamberVariants({ size, color }), className)}
			{...props}
		/>
	);
}

export { IconChamber, type IconChamberProps, iconChamberVariants };
