import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/src/components/forms/contact-form";
import { PageContainer } from "@/src/components/layout/containers";
import { PageIntro } from "@/src/components/layout/page-intro";
import { SiteFooter } from "@/src/components/layout/site-footer";
import { SiteHeader } from "@/src/components/layout/site-header";
import { Button } from "@/src/components/ui/button";
import { Reveal, ScrollReveal } from "@/src/components/ui/reveal";
import { SwissGridBox, SwissGridRow } from "@/src/components/ui/swiss-grid";

export const metadata: Metadata = {
	title: "Contact | Yassine Chettouch",
	description: "Let's build something serious together.",
	alternates: {
		canonical: "/contact",
	},
};

export default function ContactPage() {
	return (
		<div className="flex flex-1 flex-col text-surface-900 selection:bg-surface-900 selection:text-surface-50 dark:text-surface-50 dark:selection:bg-surface-100 dark:selection:text-surface-900">
			<main className="relative z-10 flex flex-1 flex-col">
				{/* Nav Row */}
				<Reveal phase={1} className="w-full">
					<SiteHeader />
				</Reveal>

				{/* Header */}
				<section id="contact-header" className="relative w-full">
					<Reveal phase={1} className="relative z-10 w-full">
						<section className="w-full">
							<PageContainer className="portfolio-section-top">
								<SwissGridBox>
									<SwissGridRow>
										<div className="portfolio-box-pad">
											<PageIntro
												eyebrow="Contact"
												title="Let’s talk."
												description="Product engineering, systems work, and focused consulting."
											>
												<div className="portfolio-inline-meta">
													<span className="portfolio-caption text-surface-500 dark:text-surface-400">
														Response in 24 to 48 hours
													</span>
													<span className="portfolio-caption text-surface-500 dark:text-surface-400">
														Rabat (GMT+1)
													</span>
												</div>
											</PageIntro>
										</div>
									</SwissGridRow>
									<SwissGridRow>
										<div className="portfolio-box-pad">
											<div className="grid gap-10 md:grid-cols-3">
												<div className="flex min-h-[180px] flex-col justify-between gap-5">
													<div className="space-y-2.5">
														<p className="portfolio-kicker text-surface-500 dark:text-surface-400">
															Email
														</p>
														<h2 className="portfolio-body-lg font-medium text-surface-900 dark:text-surface-100">
															hello@yaschet.dev
														</h2>
														<p className="portfolio-body-sm text-surface-600 dark:text-surface-400">
															Best for project scope, retainers, or
															direct inquiries.
														</p>
													</div>
													<Button
														asChild
														size="md"
														variant="solid"
														color="primary"
													>
														<Link href="mailto:hello@yaschet.dev">
															Email
														</Link>
													</Button>
												</div>

												<div className="flex min-h-[180px] flex-col justify-between gap-5">
													<div className="space-y-2.5">
														<p className="portfolio-kicker text-surface-500 dark:text-surface-400">
															Schedule
														</p>
														<h2 className="portfolio-body-lg font-medium text-surface-900 dark:text-surface-100">
															15-minute intro
														</h2>
														<p className="portfolio-body-sm text-surface-600 dark:text-surface-400">
															Quick scoping, timing, or fit before we
															go deeper.
														</p>
													</div>
													<Button
														asChild
														size="md"
														variant="soft"
														color="default"
													>
														<Link
															href="https://cal.com/yassinechettouch/15min"
															target="_blank"
														>
															Book a call
														</Link>
													</Button>
												</div>

												<div className="flex min-h-[180px] flex-col justify-between gap-5">
													<div className="space-y-2.5">
														<p className="portfolio-kicker text-surface-500 dark:text-surface-400">
															Presence
														</p>
														<h2 className="portfolio-body-lg font-medium text-surface-900 dark:text-surface-100">
															Public profiles
														</h2>
														<p className="portfolio-body-sm text-surface-600 dark:text-surface-400">
															Background, recent work, and public
															activity.
														</p>
													</div>
													<div className="flex flex-wrap gap-2.5">
														<Button
															asChild
															size="md"
															variant="soft"
															color="default"
														>
															<Link
																href="https://linkedin.com/in/yassinechettouch"
																target="_blank"
															>
																LinkedIn
															</Link>
														</Button>
														<Button
															asChild
															size="md"
															variant="soft"
															color="default"
														>
															<Link
																href="https://github.com/yaschet"
																target="_blank"
															>
																GitHub
															</Link>
														</Button>
														<Button
															asChild
															size="md"
															variant="soft"
															color="default"
														>
															<Link
																href="https://x.com/yaschett"
																target="_blank"
															>
																X
															</Link>
														</Button>
													</div>
												</div>
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
