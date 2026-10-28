import type { ReactNode } from "react";
import { ProseContainer } from "@/src/components/layout/containers";
import { HeadingReveal } from "@/src/components/ui/heading-reveal";
import { Reveal, revealSequence } from "@/src/components/ui/reveal";
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
				<Reveal delay={revealSequence.eyebrow}>
					<p className="portfolio-kicker text-muted-foreground">{eyebrow}</p>
				</Reveal>
			)}

			<div className={cn("portfolio-stack-related", isCentered && "items-center")}>
				<HeadingReveal
					as="h1"
					delay={revealSequence.heading}
					className="portfolio-hero-title portfolio-capsize-hero text-[32px] text-foreground leading-[40px] sm:text-[48px] sm:leading-[56px] min-[360px]:text-[36px] min-[360px]:leading-[44px]"
				>
					{title}
				</HeadingReveal>

				{description && (
					<Reveal delay={revealSequence.body}>
						<ProseContainer className={cn(isCentered && "mx-auto")}>
							<p className="portfolio-intro-copy text-muted-foreground">
								{description}
							</p>
						</ProseContainer>
					</Reveal>
				)}

				{children && <Reveal delay={revealSequence.children}>{children}</Reveal>}
			</div>
		</div>
	);
}
