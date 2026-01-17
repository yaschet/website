"use client";

import { Reveal, ScrollReveal } from "@/src/components/ui/reveal";
import { SwissGridProvider, SwissGridSection } from "@/src/components/ui/swiss-grid-canvas";
import { LocationBadge, TimeBadge } from "@/src/components/ui/context-badges";
import { HeroGradient } from "@/src/components/ui/hero-gradient";
import { ContactForm } from "@/src/components/forms/contact-form";

export default function ContactPage() {
	return (
		<SwissGridProvider>
			<div className="min-h-screen text-surface-900 selection:bg-surface-900 selection:text-surface-50 dark:text-surface-50 dark:selection:bg-surface-100 dark:selection:text-surface-900">
				<main className="relative z-10 flex min-h-screen flex-col">
					{/* Nav Row */}
					<SwissGridSection id="nav" className="relative z-20 w-full">
						<Reveal phase={1} className="w-full">
							<div className="h-[118px] w-full">
								<div className="mx-auto flex h-full max-w-3xl items-center justify-between px-6 sm:px-8">
									<div className="hidden sm:block">
										<LocationBadge />
									</div>
									<div className="flex-1" />
									<div className="hidden sm:block">
										<TimeBadge />
									</div>
								</div>
							</div>
						</Reveal>
					</SwissGridSection>

					{/* Header */}
					<SwissGridSection id="contact-header" className="relative w-full">
						<HeroGradient className="absolute inset-x-0 top-0 z-0 h-screen" />

						<Reveal phase={1} className="relative z-10 w-full">
							<section className="w-full">
								<div className="mx-auto max-w-3xl px-6 py-8 sm:px-8">
									<p className="mb-2 font-medium text-xs uppercase tracking-widest text-surface-400 dark:text-surface-500">
										Contact
									</p>
									<h1 className="text-heading-xl text-surface-900 dark:text-surface-100">
										Let's build something serious.
									</h1>
									<p className="mt-4 max-w-xl text-body-lg text-surface-500 dark:text-surface-400">
										Whether you have a specific project in mind or just want to
										explore a potential partnership, I'm all ears.
									</p>
								</div>
							</section>
						</Reveal>
					</SwissGridSection>

					{/* Form Section */}
					<SwissGridSection id="form" className="w-full">
						<ScrollReveal phase={2} className="w-full">
							<section className="w-full">
								<div className="mx-auto max-w-3xl px-6 py-16 sm:px-8">
									<ContactForm />
								</div>
							</section>
						</ScrollReveal>
					</SwissGridSection>

					{/* Footer */}
					<footer className="mt-auto w-full">
						<div className="mx-auto max-w-3xl px-6 py-12 sm:px-8">
							<ScrollReveal phase={3}>
								<p className="text-body-sm text-surface-400 dark:text-surface-500">
									© {new Date().getFullYear()} Yassine Chettouch
								</p>
							</ScrollReveal>
						</div>
					</footer>
				</main>
			</div>
		</SwissGridProvider>
	);
}
