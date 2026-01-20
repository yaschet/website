"use client";

import Link from "next/link";
import { ScrollReveal } from "@/src/components/ui/reveal";
import { SwissGridSection } from "@/src/components/ui/swiss-grid-canvas";

/**
 * SiteFooter component.
 *
 * @description
 * Minimal footer with copyright and social links.
 * Everything else is handled by the floating nav and context badges.
 *
 * @returns {JSX.Element} The rendered footer component.
 */
export function SiteFooter() {
	return (
		<footer className="relative mt-auto w-full bg-transparent text-surface-900 dark:text-surface-50">
			<SwissGridSection id="footer" className="w-full">
				<div className="mx-auto max-w-3xl px-6 py-8 sm:px-8">
					<ScrollReveal phase={3}>
						<div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
							{/* Copyright */}
							<span className="font-medium text-surface-400 text-xs dark:text-surface-500">
								© 2026 Yassine Chettouch
							</span>

							{/* Social Links */}
							<nav className="flex items-center gap-6" aria-label="Social Links">
								<Link
									href="https://github.com/yaschet"
									target="_blank"
									className="font-medium text-surface-400 text-xs transition-colors hover:text-surface-900 dark:text-surface-500 dark:hover:text-surface-100"
								>
									GitHub
								</Link>
								<Link
									href="https://linkedin.com/in/yaschet"
									target="_blank"
									className="font-medium text-surface-400 text-xs transition-colors hover:text-surface-900 dark:text-surface-500 dark:hover:text-surface-100"
								>
									LinkedIn
								</Link>
								<Link
									href="https://x.com/yaschet"
									target="_blank"
									className="font-medium text-surface-400 text-xs transition-colors hover:text-surface-900 dark:text-surface-500 dark:hover:text-surface-100"
								>
									X
								</Link>
							</nav>
						</div>
					</ScrollReveal>
				</div>
			</SwissGridSection>
		</footer>
	);
}
