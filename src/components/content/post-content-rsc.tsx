import { ArrowLeft, ArrowRight, Clock } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { ModuleContainer, PageContainer, ProseContainer } from "@/src/components/layout/containers";
import { SiteFooter } from "@/src/components/layout/site-footer";
import { RequestAwareSiteHeader as SiteHeader } from "@/src/components/layout/site-header-rsc";
import { mdxComponents } from "@/src/components/mdx/mdx-components";
import { ReadingBracket } from "@/src/components/ui/article-toc";
import { Button } from "@/src/components/ui/button";
import { InstrumentActionBand } from "@/src/components/ui/instrument-action-band";
import {
	INVERTED_ACTION_BAND_SOLID_BUTTON_CLASS,
	INVERTED_ACTION_BAND_TITLE_CLASS,
} from "@/src/components/ui/instrument-action-band-theme";
import { Reveal, ScrollReveal } from "@/src/components/ui/reveal";
import { SwissGridBox, SwissGridRow } from "@/src/components/ui/swiss-grid";
import type { PostEntry } from "@/src/content/types";
import { formatDate } from "@/src/lib/format-date";

interface PostContentProps {
	post: PostEntry;
}

/**
 * Renders the blog post shell and MDX content.
 *
 * @param props - Post entry data for the article page.
 * @returns The composed blog post page content.
 */
export function PostContentRSC({ post }: PostContentProps) {
	return (
		<div className="flex flex-1 flex-col text-surface-900 selection:bg-surface-900 selection:text-surface-50 dark:text-surface-50 dark:selection:bg-surface-100 dark:selection:text-surface-900">
			<main className="relative z-10 flex flex-1 flex-col" style={{ overflowAnchor: "none" }}>
				<Reveal phase={1} className="w-full">
					<SiteHeader />
				</Reveal>

				<section id="post-header" className="w-full">
					<Reveal phase={1} className="w-full">
						<section className="w-full">
							<PageContainer className="portfolio-section-top">
								<SwissGridBox>
									<SwissGridRow>
										<div className="portfolio-box-pad">
											<ModuleContainer className="portfolio-stack-group">
												<Link
													href="/blog"
													className="portfolio-back-link portfolio-kicker"
												>
													<ArrowLeft size={14} weight="bold" />
													<span>Back to Blog</span>
												</Link>

												<div className="portfolio-stack-related">
													<div className="flex flex-col">
														<h1 className="portfolio-masthead-title text-foreground">
															{post.title}
														</h1>

														<ProseContainer className="portfolio-article max-w-none">
															<p className="m-0 text-foreground">
																{post.description}
															</p>
														</ProseContainer>
													</div>

													<div className="portfolio-inline-meta">
														<time className="portfolio-caption font-mono text-muted-foreground tabular-nums">
															{formatDate(post.date)}
														</time>
														<span className="portfolio-caption flex items-center gap-(--portfolio-space-tight) font-mono text-muted-foreground">
															<Clock size={12} weight="bold" />
															{post.readingTime} min read
														</span>
													</div>
												</div>
											</ModuleContainer>
										</div>
									</SwissGridRow>
								</SwissGridBox>
							</PageContainer>
						</section>
					</Reveal>
				</section>

				<section id="post-content" className="w-full">
					<ScrollReveal phase={2} className="w-full">
						<section className="w-full">
							<PageContainer className="portfolio-section-loose">
								<SwissGridBox>
									<SwissGridRow>
										<div className="portfolio-box-pad">
											<ModuleContainer>
												<ProseContainer className="portfolio-article max-w-none">
													<article>
														<post.Content components={mdxComponents} />
													</article>
												</ProseContainer>
											</ModuleContainer>
										</div>
									</SwissGridRow>
								</SwissGridBox>
							</PageContainer>
						</section>
					</ScrollReveal>
				</section>

				<section id="post-cta" className="w-full">
					<ScrollReveal phase={3} className="w-full">
						<section className="w-full">
							<PageContainer className="portfolio-section-loose">
								<SwissGridBox>
									<SwissGridRow>
										<InstrumentActionBand
											fieldSpeed={0.28}
											fieldVariant="terrain"
											tone="inverted"
										>
											<ModuleContainer className="mx-auto w-full">
												<h2
													className={`portfolio-heading-lg portfolio-capsize-heading-lg ${INVERTED_ACTION_BAND_TITLE_CLASS}`}
												>
													Have thoughts on this?
												</h2>
												<Button
													asChild
													size="md"
													variant="solid"
													color="default"
													className={
														INVERTED_ACTION_BAND_SOLID_BUTTON_CLASS
													}
												>
													<Link href="/contact">
														Discuss
														<ArrowRight
															className="size-4"
															weight="bold"
														/>
													</Link>
												</Button>
											</ModuleContainer>
										</InstrumentActionBand>
									</SwissGridRow>
								</SwissGridBox>
							</PageContainer>
						</section>
					</ScrollReveal>
				</section>

				<ReadingBracket />
			</main>
			<SiteFooter />
			<section id="nav-spacer" className="portfolio-nav-spacer w-full" />
		</div>
	);
}
