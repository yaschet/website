import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/src/components/forms/contact-form";
import { PageContainer, ProseContainer } from "@/src/components/layout/containers";
import { SiteFooter } from "@/src/components/layout/site-footer";
import { SiteHeader } from "@/src/components/layout/site-header";
import { Button } from "@/src/components/ui/button";
import { Reveal, ScrollReveal } from "@/src/components/ui/reveal";

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
							<PageContainer className="py-16">
								<p className="mb-2 font-medium text-surface-400 text-xs uppercase tracking-widest dark:text-surface-500">
									Contact
								</p>
								<ProseContainer>
									<h1 className="mb-4 text-heading-xl text-surface-900 dark:text-surface-100">
										Get in touch.
									</h1>
									<p className="mt-6 text-body-sm text-surface-500 dark:text-surface-400">
										<a
											href="mailto:hello@yaschet.dev"
											className="font-medium text-surface-900 underline decoration-surface-300 underline-offset-2 transition-colors hover:text-accent-600 hover:decoration-accent-600 dark:text-surface-100 dark:decoration-surface-700 dark:hover:text-accent-400 dark:hover:decoration-accent-400"
										>
											hello@yaschet.dev
										</a>
									</p>
								</ProseContainer>
							</PageContainer>
						</section>
					</Reveal>
				</section>

				{/* Scheduling */}
				<section id="schedule" className="w-full">
					<ScrollReveal phase={2} className="w-full">
						<section className="w-full">
							<PageContainer className="py-12">
								<div className="grid items-start gap-8 md:grid-cols-[1.2fr_0.8fr]">
									<div className="space-y-3">
										<p className="font-mono text-surface-500 text-xs uppercase tracking-[0.18em] dark:text-surface-400">
											Call
										</p>
										<h2 className="text-heading-sm! text-surface-900 dark:text-surface-100">
											15-minute intro call.
										</h2>
										<p className="text-body-sm! text-surface-600 dark:text-surface-400">
											Quick scoping or questions.
										</p>
										<div className="pt-1">
											<Button
												asChild
												size="lg"
												variant="solid"
												color="accent"
											>
												<Link
													href="https://cal.com/yassinechettouch/15min"
													target="_blank"
												>
													Book a call
												</Link>
											</Button>
										</div>
									</div>
									<div className="space-y-3">
										<p className="font-mono text-surface-500 text-xs uppercase tracking-[0.18em] dark:text-surface-400">
											Details
										</p>
										<dl className="grid gap-2 text-body-sm!">
											<div className="grid grid-cols-[96px,1fr] gap-x-4">
												<dt className="text-surface-500 text-xs! dark:text-surface-400">
													Response
												</dt>
												<dd className="text-body-sm! text-surface-900 dark:text-surface-100">
													24 to 48 hours
												</dd>
											</div>
											<div className="grid grid-cols-[96px,1fr] gap-x-4">
												<dt className="text-surface-500 text-xs! dark:text-surface-400">
													Timezone
												</dt>
												<dd className="text-body-sm! text-surface-900 dark:text-surface-100">
													Rabat (GMT+1)
												</dd>
											</div>
										</dl>
										<div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-body-sm!">
											<Link
												href="mailto:yassinechettouch@gmail.com"
												className="text-surface-900 transition-colors hover:text-surface-700 dark:text-surface-100 dark:hover:text-surface-50"
											>
												Email
											</Link>
											<Link
												href="https://linkedin.com/in/yassinechettouch"
												target="_blank"
												className="text-surface-900 transition-colors hover:text-surface-700 dark:text-surface-100 dark:hover:text-surface-50"
											>
												LinkedIn
											</Link>
											<Link
												href="https://github.com/yaschet"
												target="_blank"
												className="text-surface-900 transition-colors hover:text-surface-700 dark:text-surface-100 dark:hover:text-surface-50"
											>
												GitHub
											</Link>
											<Link
												href="https://x.com/yaschett"
												target="_blank"
												className="text-surface-900 transition-colors hover:text-surface-700 dark:text-surface-100 dark:hover:text-surface-50"
											>
												X
											</Link>
										</div>
									</div>
								</div>
							</PageContainer>
						</section>
					</ScrollReveal>
				</section>

				{/* Form Section */}
				<section id="form" className="w-full">
					<ScrollReveal phase={2} className="w-full">
						<section className="w-full">
							<PageContainer className="py-12">
								<div>
									<ContactForm />
								</div>
							</PageContainer>
						</section>
					</ScrollReveal>
				</section>
			</main>
			<SiteFooter />
			<section id="nav-spacer" className="h-29.5 w-full" />
		</div>
	);
}
