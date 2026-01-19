"use client";

import Link from "next/link";
import { ScrollReveal } from "@/src/components/ui/reveal";
import { SwissGridSection } from "@/src/components/ui/swiss-grid-canvas";

/**
 * SiteFooter component.
 *
 * @description
 * Renders the site-wide footer with directory listing, context metadata, and network links.
 * Aligns to the Swiss Grid via SwissGridSection.
 *
 * @returns {JSX.Element} The rendered footer component.
 */
export function SiteFooter() {
	return (
		<footer className="relative mt-auto w-full bg-transparent text-surface-900 dark:text-surface-50">
			<SwissGridSection id="footer-institutional" className="w-full">
				<div className="mx-auto max-w-3xl px-6 py-12 sm:px-8">
					<ScrollReveal phase={3}>
						<div className="grid grid-cols-2 gap-x-8 gap-y-12 md:grid-cols-12 md:gap-8">
							{/* Columns 1-4: Directory */}
							<div className="md:col-span-4">
								<nav aria-label="Footer Directory">
									<ul className="flex flex-col gap-3 font-medium text-xs">
										<li className="mb-2 font-bold text-[10px] text-surface-400 uppercase tracking-[0.2em] dark:text-surface-500">
											Directory
										</li>
										<li>
											<Link
												href="/"
												className="transition-colors hover:text-primary-600"
											>
												Home
											</Link>
										</li>
										<li>
											<Link
												href="/about"
												className="transition-colors hover:text-primary-600"
											>
												About
											</Link>
										</li>
										<li>
											<Link
												href="/projects"
												className="transition-colors hover:text-primary-600"
											>
												Work
											</Link>
										</li>
										<li>
											<Link
												href="/blog"
												className="transition-colors hover:text-primary-600"
											>
												Blog
											</Link>
										</li>
									</ul>
								</nav>
							</div>

							{/* Columns 5-8: Context Data */}
							<div className="md:col-span-4">
								<div className="flex flex-col gap-3">
									<p className="mb-2 font-bold text-[10px] text-surface-400 uppercase tracking-[0.2em] dark:text-surface-500">
										Context
									</p>
									<div className="space-y-4">
										<div className="flex items-baseline justify-between gap-4 border-surface-200 border-b pb-1 dark:border-surface-800">
											<span className="text-[10px] uppercase tracking-widest opacity-40">
												Position
											</span>
											<span className="font-medium text-xs">
												Product Engineer
											</span>
										</div>
										<div className="flex items-baseline justify-between gap-4 border-surface-200 border-b pb-1 dark:border-surface-800">
											<span className="text-[10px] uppercase tracking-widest opacity-40">
												Focus
											</span>
											<span className="font-medium text-xs">
												Systems Design
											</span>
										</div>
										<div className="flex items-baseline justify-between gap-4 border-surface-200 border-b pb-1 dark:border-surface-800">
											<span className="text-[10px] uppercase tracking-widest opacity-40">
												Location
											</span>
											<span className="font-medium text-xs">
												Rabat, Morocco
											</span>
										</div>
									</div>
								</div>
							</div>

							{/* Columns 9-12: Network & Standards */}
							<div className="md:col-span-4">
								<div className="flex flex-col gap-3">
									<p className="mb-2 font-bold text-[10px] text-surface-400 uppercase tracking-[0.2em] dark:text-surface-500">
										Network
									</p>
									<nav
										className="flex flex-col gap-3 font-medium text-xs"
										aria-label="Footer Social Links"
									>
										<Link
											href="https://github.com/yaschet"
											target="_blank"
											className="flex items-center justify-between transition-colors hover:text-primary-600"
										>
											GitHub
											<span className="opacity-30">GH</span>
										</Link>
										<Link
											href="https://linkedin.com/in/yaschet"
											target="_blank"
											className="flex items-center justify-between transition-colors hover:text-primary-600"
										>
											LinkedIn
											<span className="opacity-30">LN</span>
										</Link>
										<Link
											href="https://x.com/yaschet"
											target="_blank"
											className="flex items-center justify-between transition-colors hover:text-primary-600"
										>
											Twitter
											<span className="opacity-30">TW</span>
										</Link>
									</nav>
								</div>
							</div>
						</div>
					</ScrollReveal>
				</div>
			</SwissGridSection>

			<SwissGridSection id="footer-footnote" className="w-full">
				<div className="mx-auto max-w-3xl px-6 py-8 sm:px-8">
					<div className="flex flex-col items-center justify-between gap-4 md:flex-row">
						<span className="font-medium text-[9px] uppercase tracking-[0.3em] opacity-30">
							© 2026 / International Engineering Standard
						</span>
						<div className="flex items-center gap-4 font-medium text-[9px] uppercase tracking-[0.3em] opacity-30">
							<span className="h-px w-4 bg-surface-900 dark:bg-surface-50" />
							<span>Built with Precision</span>
						</div>
					</div>
				</div>
			</SwissGridSection>
		</footer>
	);
}
