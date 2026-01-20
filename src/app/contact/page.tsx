import type { Metadata } from "next";
import { ContactForm } from "@/src/components/forms/contact-form";
import { SiteFooter } from "@/src/components/layout/site-footer";
import { LocationBadge, TimeBadge } from "@/src/components/ui/context-badges";
import { Reveal, ScrollReveal } from "@/src/components/ui/reveal";
import { SwissGridProvider, SwissGridSection } from "@/src/components/ui/swiss-grid-canvas";

export const metadata: Metadata = {
	title: "Contact | Yassine Chettouch",
	description: "Let's build something serious together.",
};

export default function ContactPage() {
	return (
		<SwissGridProvider>
			<div className="flex flex-1 flex-col text-surface-900 selection:bg-surface-900 selection:text-surface-50 dark:text-surface-50 dark:selection:bg-surface-100 dark:selection:text-surface-900">
				<main className="relative z-10 flex flex-1 flex-col">
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
						<Reveal phase={1} className="relative z-10 w-full">
							<section className="w-full">
								<div className="mx-auto max-w-3xl px-6 py-8 sm:px-8">
									<p className="mb-2 font-medium text-surface-400 text-xs uppercase tracking-widest dark:text-surface-500">
										Contact
									</p>
									<h1 className="text-heading-xl text-surface-900 dark:text-surface-100">
										Let's talk.
									</h1>
									<p className="mt-4 max-w-xl text-body-lg text-surface-500 dark:text-surface-400">
										Have a project, question, or opportunity? I'd like to hear
										about it.
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
				</main>
				<SiteFooter />
			</div>
		</SwissGridProvider>
	);
}
