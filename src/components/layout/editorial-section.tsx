import type { ReactNode } from "react";
import { PageContainer } from "@/src/components/layout/containers";
import { ScrollReveal } from "@/src/components/ui/reveal";
import { SwissGridBox, SwissGridRow } from "@/src/components/ui/swiss-grid";

/** The section owns its boundary and equal outer inset; children own their layout. */
export function EditorialSection({
	id,
	title,
	children,
}: {
	id: string;
	title: string;
	children: ReactNode;
}) {
	return (
		<section id={id} aria-labelledby={`${id}-heading`} className="w-full">
			<ScrollReveal phase={2}>
				<PageContainer className="portfolio-section-top">
					<SwissGridBox>
						<SwissGridRow>
							<div className="portfolio-box-pad portfolio-editorial-section">
								<h2 id={`${id}-heading`} className="portfolio-section-heading">
									{title}
								</h2>
								{children}
							</div>
						</SwissGridRow>
					</SwissGridBox>
				</PageContainer>
			</ScrollReveal>
		</section>
	);
}
