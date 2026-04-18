import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/src/components/forms/contact-form";
import { PageContainer, ProseContainer } from "@/src/components/layout/containers";
import { PageIntro } from "@/src/components/layout/page-intro";
import { SiteFooter } from "@/src/components/layout/site-footer";
import { SiteHeader } from "@/src/components/layout/site-header";
import { Button } from "@/src/components/ui/button";
import {
	INSTRUMENT_DOT_RADIUS,
	INSTRUMENT_GRID_MIN_INSET,
	INSTRUMENT_GRID_STEP,
} from "@/src/components/ui/instrument-field-metrics";
import { Reveal, ScrollReveal } from "@/src/components/ui/reveal";
import { SwissGridBox, SwissGridRow } from "@/src/components/ui/swiss-grid";
import { InstrumentField } from "@/src/components/ui/topographic-dot-field";

export const metadata: Metadata = {
	title: "Contact | Yassine Chettouch",
	description:
		"Internal systems, workflow software, and customer-facing products where clear interfaces sit on top of heavy logic.",
	alternates: {
		canonical: "/contact",
	},
};

const CONTACT_METHODS = [
	{
		kicker: "Email",
		title: "hello@yaschet.dev",
		description: "Best for project scope and retainers.",
		actions: [
			{
				label: "Email",
				href: "mailto:hello@yaschet.dev",
				variant: "solid" as const,
				color: "primary" as const,
			},
		],
	},
	{
		kicker: "Schedule",
		title: "Intro call",
		description: "Quick fit check before a deeper conversation.",
		actions: [
			{
				label: "Book a call",
				href: "https://cal.com/yassinechettouch/15min",
				variant: "soft" as const,
				color: "default" as const,
				target: "_blank" as const,
			},
		],
	},
	{
		kicker: "Presence",
		title: "Public profiles",
		description: "Background, shipped work, and recent activity.",
		actions: [
			{
				label: "LinkedIn",
				href: "https://linkedin.com/in/yassinechettouch",
				variant: "soft" as const,
				color: "default" as const,
				target: "_blank" as const,
			},
			{
				label: "GitHub",
				href: "https://github.com/yaschet",
				variant: "soft" as const,
				color: "default" as const,
				target: "_blank" as const,
			},
			{
				label: "X",
				href: "https://x.com/yaschett",
				variant: "soft" as const,
				color: "default" as const,
				target: "_blank" as const,
			},
		],
	},
] as const;

function ContactInstrumentPlane() {
	return (
		<div className="absolute inset-0" aria-hidden="true">
			<InstrumentField
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
		<div className="flex flex-1 flex-col text-surface-900 selection:bg-surface-900 selection:text-surface-50 dark:text-surface-50 dark:selection:bg-surface-100 dark:selection:text-surface-900">
			<main className="relative z-10 flex flex-1 flex-col">
				{/* Nav Row */}
				<SiteHeader />

				{/* Header */}
				<section id="contact-header" className="relative w-full">
					<Reveal phase={1} className="relative z-10 w-full">
						<section className="w-full">
							<PageContainer className="portfolio-section-top">
								<SwissGridBox>
									<SwissGridRow>
										<div className="relative isolate overflow-hidden">
											<ContactInstrumentPlane />
											<div className="portfolio-box-pad relative z-[1]">
												<PageIntro
													eyebrow="CONTACT"
													title="Let’s talk."
													description="Internal systems, workflow software, and customer-facing products where clear interfaces sit on top of heavy logic."
												/>
											</div>
										</div>
									</SwissGridRow>
									<SwissGridRow>
										<div className="portfolio-box-pad">
											<ProseContainer className="portfolio-prose">
												<div className="portfolio-card-copy">
													<p className="portfolio-kicker text-surface-500 dark:text-surface-400">
														ENGAGEMENT
													</p>
													<p className="portfolio-body-lg text-surface-900 dark:text-surface-100">
														Retainer engagements start at
														<strong className="font-medium text-surface-900 dark:text-surface-100">
															{" "}
															$4,500/month
														</strong>
														. Most fixed-scope builds start at $8,000+,
														depending on integration risk, compliance
														needs, and ownership scope.
													</p>
												</div>
												<div className="portfolio-card-copy">
													<h2 className="portfolio-body-lg font-medium text-surface-900 dark:text-surface-100">
														Process
													</h2>
													<p className="portfolio-body-sm text-surface-600 dark:text-surface-400">
														Most work starts with a short paid
														diagnostic or a tightly scoped first build.
													</p>
													<p className="portfolio-body-sm text-surface-600 dark:text-surface-400">
														Based in Rabat (GMT+1), with full overlap
														across EU and UK hours and good overlap with
														US East Coast mornings. If the work is
														messy, operationally important, or hard to
														untangle, email below.
													</p>
												</div>
											</ProseContainer>
										</div>
									</SwissGridRow>
									<SwissGridRow>
										<div className="portfolio-box-pad">
											<div className="grid gap-[var(--portfolio-space-section)] md:grid-cols-3">
												{CONTACT_METHODS.map((method) => (
													<div
														key={method.kicker}
														className="portfolio-stack-group min-h-[calc(var(--portfolio-grid-step)*9)] justify-between"
													>
														<div className="portfolio-card-copy">
															<p className="portfolio-kicker text-surface-500 dark:text-surface-400">
																{method.kicker}
															</p>
															<h2 className="portfolio-body-lg font-medium text-surface-900 dark:text-surface-100">
																{method.title}
															</h2>
															<p className="portfolio-body-sm text-surface-600 dark:text-surface-400">
																{method.description}
															</p>
														</div>
														<div className="portfolio-control-row">
															{method.actions.map((action) => (
																<Button
																	key={action.label}
																	asChild
																	size="md"
																	variant={action.variant}
																	color={action.color}
																>
																	<Link
																		href={action.href}
																		target={
																			"target" in action
																				? action.target
																				: undefined
																		}
																	>
																		{action.label}
																	</Link>
																</Button>
															))}
														</div>
													</div>
												))}
											</div>
										</div>
									</SwissGridRow>
								</SwissGridBox>
							</PageContainer>
						</section>
					</Reveal>
				</section>

				{/* Form Section */}
				<section id="form" className="w-full">
					<ScrollReveal phase={2} className="w-full">
						<section className="w-full">
							<PageContainer className="portfolio-section">
								<SwissGridBox>
									<SwissGridRow>
										<div className="portfolio-box-pad">
											<ContactForm />
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
