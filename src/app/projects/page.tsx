"use client";

import { ArrowRight } from "@phosphor-icons/react";
import Link from "next/link";
// Static Assets
import Asset1 from "@/public/images/placeholders/asset-1.jpg";
import Asset2 from "@/public/images/placeholders/asset-2.jpg";
import Asset3 from "@/public/images/placeholders/asset-3.jpg";
import Asset4 from "@/public/images/placeholders/asset-4.jpg";
import Asset5 from "@/public/images/placeholders/asset-5.jpg";
import Asset6 from "@/public/images/placeholders/asset-6.jpg";
import Asset7 from "@/public/images/placeholders/asset-7.jpg";
import Asset8 from "@/public/images/placeholders/asset-8.jpg";
import Asset9 from "@/public/images/placeholders/asset-9.jpg";
import Asset10 from "@/public/images/placeholders/asset-10.jpg";
import Asset11 from "@/public/images/placeholders/asset-11.jpg";
import Asset12 from "@/public/images/placeholders/asset-12.jpg";
import { Button } from "@/src/components/ui/button";
import { MonolithCard } from "@/src/components/ui/monolith-card";
import { Reveal, ScrollReveal } from "@/src/components/ui/reveal";
import { SwissGridProvider, SwissGridSection } from "@/src/components/ui/swiss-grid-canvas";

export default function ProjectsPage() {
	return (
		<SwissGridProvider>
			<div className="min-h-screen text-surface-900 selection:bg-surface-900 selection:text-surface-50 dark:text-surface-50 dark:selection:bg-surface-100 dark:selection:text-surface-900">
				<main className="relative z-10 flex min-h-screen flex-col pt-32">
					{/* Header */}
					<SwissGridSection id="projects-header" className="w-full">
						<Reveal phase={1} className="w-full">
							<section className="w-full">
								<div className="mx-auto max-w-3xl px-6 sm:px-8">
									<p className="mb-2 font-medium text-surface-400 text-xs uppercase tracking-widest dark:text-surface-500">
										Work
									</p>
									<h1 className="mb-4 text-heading-xl text-surface-900 dark:text-surface-100">
										Selected Projects
									</h1>
									<p className="max-w-xl text-body-lg text-surface-600 dark:text-surface-400">
										SaaS platforms, data engines, and internal tools. Complete
										systems built from architecture to production deployment.
									</p>
								</div>
							</section>
						</Reveal>
					</SwissGridSection>

					{/* Projects Grid */}
					<SwissGridSection id="projects-list" className="w-full">
						<ScrollReveal phase={2} className="w-full">
							<section className="w-full">
								<div className="mx-auto max-w-3xl px-6 py-16 sm:px-8">
									<div className="space-y-10">
										{/* Verto */}
										<ScrollReveal phase={2} delay={0.05}>
											<div className="space-y-4">
												<MonolithCard
													index="01"
													title="Verto"
													description="AI-powered translation SaaS with enterprise authentication, Stripe billing integration, and real-time collaborative editing."
													href="/projects/verto"
													tags={[
														"Next.js",
														"Supabase",
														"OpenAI",
														"Stripe",
														"Tiptap",
													]}
													images={[Asset1, Asset2, Asset3, Asset4]}
												/>
												<div className="pl-8 text-sm text-surface-500 dark:text-surface-400">
													<p>
														<strong className="text-surface-700 dark:text-surface-300">
															Challenge:
														</strong>{" "}
														Enterprise-grade security with real-time
														collaboration and billing integration.
													</p>
													<p>
														<strong className="text-surface-700 dark:text-surface-300">
															Solution:
														</strong>{" "}
														Full SaaS with Supabase Auth, Stripe
														integration, and Tiptap-based editor.
													</p>
												</div>
											</div>
										</ScrollReveal>

										{/* Project Phoenix */}
										<ScrollReveal phase={2} delay={0.1}>
											<div className="space-y-4">
												<MonolithCard
													index="02"
													title="Project Phoenix"
													description="Large-scale data matching engine with AI-driven cleansing, semantic search, and resumable processing pipelines."
													href="/projects/phoenix"
													tags={[
														"Meilisearch",
														"OpenAI",
														"PostgreSQL",
														"Data Pipelines",
													]}
													images={[Asset5, Asset6, Asset7, Asset8]}
													isPrivate
												/>
												<div className="pl-8 text-sm text-surface-500 dark:text-surface-400">
													<p>
														<strong className="text-surface-700 dark:text-surface-300">
															Challenge:
														</strong>{" "}
														Match thousands of university programs to
														student profiles with high accuracy.
													</p>
													<p>
														<strong className="text-surface-700 dark:text-surface-300">
															Solution:
														</strong>{" "}
														3-phase system using Meilisearch, OpenAI
														embeddings, and resumable data pipelines.
													</p>
												</div>
											</div>
										</ScrollReveal>

										{/* Onboard Flow */}
										<ScrollReveal phase={2} delay={0.15}>
											<div className="space-y-4">
												<MonolithCard
													index="03"
													title="Onboard Flow"
													description="Intelligent customer portal with step-by-step onboarding, document scanning, and dynamic form logic."
													href="/projects/onboard-flow"
													tags={["React", "Node.js", "PostgreSQL", "OCR"]}
													images={[Asset9, Asset10, Asset11, Asset12]}
													isPrivate
												/>
												<div className="pl-8 text-sm text-surface-500 dark:text-surface-400">
													<p>
														<strong className="text-surface-700 dark:text-surface-300">
															Challenge:
														</strong>{" "}
														Replace a complex static form with a
														high-conversion step-by-step experience.
													</p>
													<p>
														<strong className="text-surface-700 dark:text-surface-300">
															Solution:
														</strong>{" "}
														Typeform-style portal with OCR scanning and
														dynamic question logic. Delivered in 6
														weeks.
													</p>
												</div>
											</div>
										</ScrollReveal>
									</div>
								</div>
							</section>
						</ScrollReveal>
					</SwissGridSection>

					{/* CTA */}
					<SwissGridSection id="projects-cta" className="w-full">
						<ScrollReveal phase={3} className="w-full">
							<section className="w-full">
								<div className="mx-auto max-w-3xl px-6 py-16 sm:px-8">
									<ScrollReveal phase={3}>
										<div className="text-center">
											<h2 className="mb-4 text-heading-lg text-surface-900 dark:text-surface-100">
												Have a project in mind?
											</h2>
											<p className="mb-8 text-body-md text-surface-600 dark:text-surface-400">
												I'm available for new projects. Let's discuss how I
												can help.
											</p>
											<Button
												asChild
												size="lg"
												variant="solid"
												color="primary"
											>
												<Link href="/contact">
													Get in touch
													<ArrowRight className="size-4" weight="bold" />
												</Link>
											</Button>
										</div>
									</ScrollReveal>
								</div>
							</section>
						</ScrollReveal>
					</SwissGridSection>

					{/* Footer */}
					<footer className="mt-auto w-full">
						<div className="mx-auto max-w-3xl px-6 py-12 sm:px-8">
							<p className="text-body-sm text-surface-400 dark:text-surface-500">
								© {new Date().getFullYear()} Yassine Chettouch. Rabat, Morocco.
							</p>
						</div>
					</footer>
				</main>
			</div>
		</SwissGridProvider>
	);
}
