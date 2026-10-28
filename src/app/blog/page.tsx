import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import { FileText } from "@phosphor-icons/react/dist/ssr/FileText";
import type { Metadata } from "next";
import { PageContainer } from "@/src/components/layout/containers";
import { PageIntro } from "@/src/components/layout/page-intro";
import { SiteFooter } from "@/src/components/layout/site-footer";
import { ButtonLink } from "@/src/components/ui/button-link";
import { EditorialEmptyState } from "@/src/components/ui/editorial-empty-state";
import { InstrumentActionBand } from "@/src/components/ui/instrument-action-band";
import {
	INVERTED_ACTION_BAND_SOLID_BUTTON_CLASS,
	INVERTED_ACTION_BAND_TITLE_CLASS,
} from "@/src/components/ui/instrument-action-band-theme";
import { Reveal, ScrollReveal } from "@/src/components/ui/reveal";
import { SwissGridBox, SwissGridRow } from "@/src/components/ui/swiss-grid";

export const metadata: Metadata = {
	title: "Blog",
	description: "Technical deep-dives and lessons learned from shipping products.",
	alternates: {
		canonical: "/blog",
	},
};

function BlogClosingCta() {
	return (
		<InstrumentActionBand fieldSpeed={0.28} fieldVariant="terrain" tone="inverted">
			<h2
				className={`portfolio-heading-lg portfolio-capsize-heading-lg ${INVERTED_ACTION_BAND_TITLE_CLASS}`}
			>
				See shipped work.
			</h2>
			<ButtonLink
				href="/case-studies"
				size="md"
				variant="solid"
				color="default"
				className={INVERTED_ACTION_BAND_SOLID_BUTTON_CLASS}
				icon={<ArrowRightIcon className="size-4" weight="bold" />}
			>
				Case Studies
			</ButtonLink>
		</InstrumentActionBand>
	);
}

export default function BlogPage() {
	return (
		<div className="flex flex-1 flex-col text-foreground selection:bg-foreground selection:text-background">
			<main className="relative z-10 flex flex-1 flex-col">
				{/* 2. CONTENT CELL */}
				<section id="blog-content" className="w-full">
					<PageContainer className="portfolio-section-top">
						<SwissGridBox>
							<SwissGridRow>
								<div className="portfolio-box-pad">
									<PageIntro
										eyebrow="Writing"
										title="Blog"
										description="Notes on systems, tradeoffs, and shipped work."
									/>
								</div>
							</SwissGridRow>
							<SwissGridRow>
								<Reveal phase={2} className="w-full">
									<EditorialEmptyState
										icon={
											<FileText
												className="size-[var(--portfolio-icon-sm)] opacity-80"
												weight="regular"
											/>
										}
										title="No posts published."
										description="Writing will appear here when it is ready."
									/>
								</Reveal>
							</SwissGridRow>
						</SwissGridBox>
					</PageContainer>
				</section>

				<section id="blog-cta" className="w-full">
					<ScrollReveal phase={2} className="w-full">
						<PageContainer className="portfolio-section-top">
							<SwissGridBox>
								<SwissGridRow>
									<BlogClosingCta />
								</SwissGridRow>
							</SwissGridBox>
						</PageContainer>
					</ScrollReveal>
				</section>
			</main>
			<SiteFooter />
			<section id="nav-spacer" className="portfolio-nav-spacer w-full" />
		</div>
	);
}
