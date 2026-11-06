import type { ReactNode } from "react";
import { IconChamber } from "@/src/components/ui/icon-chamber";
import { cn } from "@/src/lib/utils";

interface EditorialEmptyStateProps {
	eyebrow?: string;
	icon?: ReactNode;
	title: string;
	description: ReactNode;
	actions?: ReactNode;
	note?: ReactNode;
	className?: string;
}

export function EditorialEmptyState({
	eyebrow,
	icon,
	title,
	description,
	actions,
	note,
	className,
}: EditorialEmptyStateProps) {
	return (
		<div className={cn("portfolio-box-pad", className)}>
			<div className="portfolio-stack-group mx-auto w-full max-w-[32rem] items-center justify-center text-center">
				{icon && (
					<IconChamber
						size="default"
						color="secondary"
						aria-hidden="true"
						className="[&_svg:not([class*='size-'])]:size-5 [&_svg]:size-5"
					>
						{icon}
					</IconChamber>
				)}

				{eyebrow && (
					<p className="portfolio-kicker text-surface-600 dark:text-surface-400">
						{eyebrow}
					</p>
				)}

				<div className="portfolio-stack-related items-center">
					<h2 className="portfolio-heading-sm portfolio-capsize-heading-sm text-surface-900 dark:text-surface-50">
						{title}
					</h2>
					<p className="portfolio-body-sm portfolio-callout-copy text-surface-600 dark:text-surface-400">
						{description}
					</p>
				</div>

				{actions && <div className="portfolio-control-row justify-center">{actions}</div>}

				{note && (
					<p className="portfolio-body-xs max-w-[28rem] text-surface-600 dark:text-surface-400">
						{note}
					</p>
				)}
			</div>
		</div>
	);
}
