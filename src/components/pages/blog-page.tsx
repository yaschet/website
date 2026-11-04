import { FileText } from "@phosphor-icons/react/dist/ssr/FileText";
import { PageContainer } from "@/src/components/layout/containers";
import { PageIntroPanel } from "@/src/components/layout/page-intro";
import { SiteFooter } from "@/src/components/layout/site-footer";
import { ArrowButtonLink } from "@/src/components/ui/arrow-button-link";
import { EditorialEmptyState } from "@/src/components/ui/editorial-empty-state";
import { InstrumentActionBand } from "@/src/components/ui/instrument-action-band";
import {
	INVERTED_ACTION_BAND_SOLID_BUTTON_CLASS,
	INVERTED_ACTION_BAND_TITLE_CLASS,
} from "@/src/components/ui/instrument-action-band-theme";
import { PortfolioLink } from "@/src/components/ui/portfolio-link";
import { Reveal, ScrollReveal } from "@/src/components/ui/reveal";
import { SwissGridBox, SwissGridRow } from "@/src/components/ui/swiss-grid";
import type { PostSummaryEntry } from "@/src/content/types";
import { formatDate } from "@/src/lib/format-date";

function BlogClosingCta() {
	return (
		<InstrumentActionBand fieldSpeed={0.28} fieldVariant="terrain" tone="inverted">
			<h2
				className={`portfolio-heading-lg portfolio-capsize-heading-lg ${INVERTED_ACTION_BAND_TITLE_CLASS}`}
			>
				See selected work.
			</h2>
			<ArrowButtonLink
				href="/case-studies"
				variant="solid"
				color="default"
				className={INVERTED_ACTION_BAND_SOLID_BUTTON_CLASS}
			>
				View case studies
			</ArrowButtonLink>
		</InstrumentActionBand>
	);
}

export function BlogPageContent({ posts }: { posts: readonly PostSummaryEntry[] }) {
	return (
		<div className="flex flex-1 flex-col text-foreground selection:bg-foreground selection:text-background">
			<main className="relative z-10 flex flex-1 flex-col">
				{/* 2. CONTENT CELL */}
				<section id="blog-content" className="w-full">
					<PageContainer mobileBleed className="portfolio-section-top">
						<SwissGridBox>
							<SwissGridRow>
								<PageIntroPanel
									eyebrow="Writing"
									title="Blog"
									description="Notes on systems, tradeoffs, and shipped work."
								/>
							</SwissGridRow>
							{posts.map((post) => (
								<SwissGridRow key={post.id}>
									<article className="portfolio-box-pad portfolio-stack-group">
										<div className="portfolio-inline-meta portfolio-caption text-muted-foreground">
											<time dateTime={post.date}>
												{formatDate(post.date)}
											</time>
											<span>{post.readingTime} min read</span>
										</div>
										<h2 className="portfolio-heading-sm portfolio-capsize-heading-sm">
											<PortfolioLink
												href={post.urlPath}
												className="t-interactive decoration-foreground/30 underline-offset-4 hover:underline focus-visible:underline"
											>
												{post.title}
											</PortfolioLink>
										</h2>
										<p className="portfolio-body-md text-muted-foreground">
											{post.description}
										</p>
									</article>
								</SwissGridRow>
							))}
							{posts.length === 0 && (
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
							)}
						</SwissGridBox>
					</PageContainer>
				</section>

				<section id="blog-cta" className="w-full">
					<ScrollReveal phase={2} className="w-full">
						<PageContainer mobileBleed className="portfolio-section-top">
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
