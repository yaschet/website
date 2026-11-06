import { ContactMethods } from "@/src/components/content/contact-methods";
import { ContactMessage } from "@/src/components/forms/contact-message";
import { PageContainer, ProseContainer } from "@/src/components/layout/containers";
import { PageIntroPanel } from "@/src/components/layout/page-intro";
import { SiteFooter } from "@/src/components/layout/site-footer";
import { ScrollReveal } from "@/src/components/ui/reveal";
import { SwissGridBox, SwissGridRow } from "@/src/components/ui/swiss-grid";

/** Contact presentation; the route owns server-only delivery availability. */
export function ContactPage({ formEnabled = false }: { formEnabled?: boolean }) {
	return (
		<div className="flex flex-1 flex-col text-foreground selection:bg-foreground selection:text-background">
			<main className="relative z-10 flex flex-1 flex-col">
				{/* Header */}
				<section id="contact-header" className="relative w-full">
					<section className="w-full">
						<PageContainer mobileBleed className="portfolio-section-top">
							<SwissGridBox>
								<SwissGridRow>
									<PageIntroPanel
										eyebrow="Contact"
										title="Let’s talk."
										description="Tell me what you're working on and where you'd like my help."
									/>
								</SwissGridRow>
								<SwissGridRow>
									<div className="portfolio-box-pad">
										<ProseContainer className="portfolio-contact-context">
											<div className="portfolio-card-copy">
												<h2 className="portfolio-detail-title text-foreground">
													Projects and ongoing work
												</h2>
												<p className="portfolio-detail-copy text-muted-foreground">
													Bring an idea, a problem or a clear brief. I can
													build a complete web application, add features
													to your existing product or work with you on
													ongoing development.
												</p>
											</div>
											<div className="portfolio-card-copy">
												<h2 className="portfolio-detail-title text-foreground">
													What happens next
												</h2>
												<p className="portfolio-detail-copy text-muted-foreground">
													We&apos;ll talk through what you need,
													what&apos;s already in place and any deadline.
													If we&apos;re a good fit, I&apos;ll send a
													written proposal covering the work, cost and
													timing before we start.
												</p>
												<p className="portfolio-detail-copy text-muted-foreground">
													Based in Rabat, Morocco. Working remotely, with
													written updates and calls when useful.
												</p>
											</div>
										</ProseContainer>
									</div>
								</SwissGridRow>
								<SwissGridRow>
									<div className="portfolio-box-pad">
										<ContactMethods />
									</div>
								</SwissGridRow>
							</SwissGridBox>
						</PageContainer>
					</section>
				</section>

				{/* Form Section */}
				<section id="form" className="w-full">
					<ScrollReveal phase={2} className="w-full">
						<section className="w-full">
							<PageContainer mobileBleed className="portfolio-section">
								<SwissGridBox>
									<SwissGridRow>
										<div className="portfolio-box-pad">
											<ContactMessage formEnabled={formEnabled} />
										</div>
									</SwissGridRow>
								</SwissGridBox>
							</PageContainer>
						</section>
					</ScrollReveal>
				</section>
			</main>
			<SiteFooter />
			<section id="nav-spacer" className="portfolio-nav-spacer w-full" />
		</div>
	);
}
