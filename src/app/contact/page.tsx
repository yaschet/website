import type { Metadata } from "next";
import { ContactMethods } from "@/src/components/content/contact-methods";
import { ContactMessage } from "@/src/components/forms/contact-message";
import { PageContainer, ProseContainer } from "@/src/components/layout/containers";
import { PageIntro } from "@/src/components/layout/page-intro";
import { SiteFooter } from "@/src/components/layout/site-footer";
import { DeferredInstrumentField } from "@/src/components/ui/deferred-instrument-field";
import {
	INSTRUMENT_DOT_RADIUS,
	INSTRUMENT_GRID_MIN_INSET,
	INSTRUMENT_GRID_STEP,
} from "@/src/components/ui/instrument-field-metrics";
import { ScrollReveal } from "@/src/components/ui/reveal";
import { SwissGridBox, SwissGridRow } from "@/src/components/ui/swiss-grid";

export const metadata: Metadata = {
	title: "Contact",
	description:
		"Internal systems, workflow software, and customer-facing products where clear interfaces sit on top of heavy logic.",
	alternates: {
		canonical: "/contact",
	},
};

function ContactInstrumentPlane() {
	return (
		<div className="absolute inset-0" aria-hidden="true">
			<div className="pointer-events-none absolute inset-0 bg-[var(--portfolio-panel)]" />
			<DeferredInstrumentField
				className="pointer-events-none opacity-100 dark:opacity-100"
				interactive
				step={INSTRUMENT_GRID_STEP}
				minInset={INSTRUMENT_GRID_MIN_INSET}
				origin="inset"
				radius={INSTRUMENT_DOT_RADIUS}
				speed={0.28}
				surface="header"
				variant="terrain"
			/>
		</div>
	);
}

export default function ContactPage() {
	return (
		<div className="flex flex-1 flex-col text-foreground selection:bg-foreground selection:text-background">
			<main className="relative z-10 flex flex-1 flex-col">
				{/* Header */}
				<section id="contact-header" className="relative w-full">
					<section className="w-full">
						<PageContainer className="portfolio-section-top">
							<SwissGridBox>
								<SwissGridRow>
									<div
										className="relative isolate overflow-hidden"
										data-instrument-host=""
									>
										<ContactInstrumentPlane />
										<div className="portfolio-box-pad relative z-[1]">
											<PageIntro
												eyebrow="Contact"
												title="Let’s talk."
												description="Internal systems, workflow software, and customer-facing products where clear interfaces sit on top of heavy logic."
											/>
										</div>
									</div>
								</SwissGridRow>
								<SwissGridRow>
									<div className="portfolio-box-pad">
										<ProseContainer className="portfolio-contact-context">
											<div className="portfolio-card-copy">
												<h2 className="portfolio-detail-title text-foreground">
													Engagement
												</h2>
												<p className="portfolio-detail-copy text-muted-foreground">
													Retainer engagements start at
													<strong className="font-medium text-surface-900 dark:text-surface-100">
														{" "}
														$4,500/month
													</strong>
													. Most fixed-scope builds start at{" "}
													<strong className="font-medium text-surface-900 dark:text-surface-100">
														$8,000+
													</strong>
													, depending on integration risk, compliance
													needs, and ownership scope.
												</p>
											</div>
											<div className="portfolio-card-copy">
												<h2 className="portfolio-detail-title text-foreground">
													Process
												</h2>
												<p className="portfolio-detail-copy text-muted-foreground">
													Most work starts with a short paid diagnostic or
													a tightly scoped first build.
												</p>
												<p className="portfolio-detail-copy text-muted-foreground">
													Based in Rabat, Morocco, working with clients
													worldwide. Most collaboration runs async, with
													strong live overlap across EU, UK, Gulf, and US
													East mornings when the work needs it. If the
													work is messy, operationally important, or hard
													to untangle, email below.
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
							<PageContainer className="portfolio-section">
								<SwissGridBox>
									<SwissGridRow>
										<div className="portfolio-box-pad">
											<ContactMessage />
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
