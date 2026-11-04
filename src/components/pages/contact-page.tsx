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
										description="Tell me what you are building, who it is for and where you need help."
									/>
								</SwissGridRow>
								<SwissGridRow>
									<div className="portfolio-box-pad">
										<ProseContainer className="portfolio-contact-context">
											<div className="portfolio-card-copy">
												<h2 className="portfolio-detail-title text-foreground">
													Engagement
												</h2>
												<p className="portfolio-detail-copy text-muted-foreground">
													Projects are quoted after a scope review. We
													agree on the deliverables, cost and timeline
													before work starts.
												</p>
											</div>
											<div className="portfolio-card-copy">
												<h2 className="portfolio-detail-title text-foreground">
													Process
												</h2>
												<p className="portfolio-detail-copy text-muted-foreground">
													Start with the problem, your users and any
													existing product. We discuss what needs to
													change and define a useful first scope.
												</p>
												<p className="portfolio-detail-copy text-muted-foreground">
													Based in Rabat, Morocco. I work remotely, using
													written updates and calls when a decision needs
													one.
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
