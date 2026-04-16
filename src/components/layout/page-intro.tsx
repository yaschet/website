import type { ReactNode } from "react";
import { ProseContainer } from "@/src/components/layout/containers";
import { HeadingReveal } from "@/src/components/ui/heading-reveal";
import { cn } from "@/src/lib/utils";

interface PageIntroProps {
	eyebrow?: string;
	title: string;
	description?: ReactNode;
	children?: ReactNode;
	className?: string;
	align?: "left" | "center";
}

export function PageIntro({
	eyebrow,
	title,
	description,
	children,
	className,
	align = "left",
}: PageIntroProps) {
	const isCentered = align === "center";

	return (
		<div
			className={cn(
				"portfolio-stack-related",
				isCentered && "items-center text-center",
				className,
			)}
		>
			{eyebrow && (
				<p className="portfolio-kicker text-surface-400 dark:text-surface-500">{eyebrow}</p>
			)}

			<div className={cn("portfolio-stack-tight", isCentered && "items-center")}>
				<HeadingReveal
					as="h1"
					phase={1}
					className="portfolio-heading-xl portfolio-capsize-heading-xl text-surface-900 dark:text-surface-100"
				>
					{title}
				</HeadingReveal>

				{description && (
					<ProseContainer className={cn(isCentered && "mx-auto")}>
						<p className="portfolio-body-lg text-surface-600 dark:text-surface-400">
							{description}
						</p>
					</ProseContainer>
				)}

				{children && <div className="pt-[var(--portfolio-space-tight)]">{children}</div>}
			</div>
		</div>
	);
}
