"use client";

import Link from "next/link";
import { PageContainer } from "@/src/components/layout/containers";
import { ShellReveal } from "@/src/components/ui/reveal";

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
		<ShellReveal phase={1} className="w-full">
			<footer className="relative z-10 w-full bg-transparent text-surface-900 dark:text-surface-50">
				<section id="footer" className="w-full">
					<PageContainer className="portfolio-footer-pad">
						<div className="flex flex-col gap-[var(--portfolio-space-related)] text-center sm:flex-row sm:items-start sm:justify-between sm:text-left">
							<div className="portfolio-stack-tight">
								<span className="portfolio-caption font-medium text-surface-600 dark:text-surface-300">
									© 2026 Yassine Chettouch
								</span>
								<a
									href="mailto:hello@yaschet.dev"
									className="portfolio-caption font-medium text-surface-500 transition-colors hover:text-surface-900 dark:text-surface-400 dark:hover:text-surface-50"
								>
									hello@yaschet.dev
								</a>
							</div>

							<div className="portfolio-stack-tight sm:items-end">
								<nav
									className="flex items-center justify-center gap-[var(--portfolio-space-related)] sm:justify-end"
									aria-label="Social Links"
								>
									<Link
										href="https://linkedin.com/in/yassinechettouch"
										target="_blank"
										className="portfolio-caption font-medium text-surface-600 transition-colors hover:text-surface-900 dark:text-surface-300 dark:hover:text-surface-50"
									>
										LinkedIn
									</Link>
									<Link
										href="https://github.com/yaschet"
										target="_blank"
										className="portfolio-caption font-medium text-surface-600 transition-colors hover:text-surface-900 dark:text-surface-300 dark:hover:text-surface-50"
									>
										GitHub
									</Link>
									<Link
										href="https://x.com/yaschett"
										target="_blank"
										className="portfolio-caption font-medium text-surface-600 transition-colors hover:text-surface-900 dark:text-surface-300 dark:hover:text-surface-50"
									>
										X
									</Link>
								</nav>

								<a
									href="https://github.com/yaschet/website"
									target="_blank"
									rel="noreferrer"
									className="portfolio-caption font-medium text-surface-500 transition-colors hover:text-surface-900 dark:text-surface-400 dark:hover:text-surface-50"
								>
									Source
								</a>
							</div>
						</div>
					</PageContainer>
				</section>
			</footer>
		</ShellReveal>
	);
}
