"use client";

import Link from "next/link";
import { PageContainer } from "@/src/components/layout/containers";

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
		<footer className="relative z-10 w-full bg-transparent text-surface-900 dark:text-surface-50">
			<section id="footer" className="w-full">
				<PageContainer className="portfolio-footer-pad">
					<div className="flex flex-col gap-3 text-center sm:flex-row sm:items-start sm:justify-between sm:text-left">
						<div className="flex flex-col gap-1">
							<span className="font-medium text-surface-600 text-xs dark:text-surface-300">
								© 2026 Yassine Chettouch
							</span>
							<a
								href="mailto:hello@yaschet.dev"
								className="font-medium text-surface-500 text-xs transition-colors hover:text-accent-600 dark:text-surface-400 dark:hover:text-accent-400"
							>
								hello@yaschet.dev
							</a>
						</div>

						<div className="flex flex-col gap-1 sm:items-end">
							<nav
								className="flex items-center justify-center gap-6 sm:justify-end"
								aria-label="Social Links"
							>
								<Link
									href="https://linkedin.com/in/yassinechettouch"
									target="_blank"
									className="font-medium text-surface-600 text-xs transition-colors hover:text-accent-600 dark:text-surface-300 dark:hover:text-accent-400"
								>
									LinkedIn
								</Link>
								<Link
									href="https://github.com/yaschet"
									target="_blank"
									className="font-medium text-surface-600 text-xs transition-colors hover:text-accent-600 dark:text-surface-300 dark:hover:text-accent-400"
								>
									GitHub
								</Link>
								<Link
									href="https://x.com/yaschett"
									target="_blank"
									className="font-medium text-surface-600 text-xs transition-colors hover:text-accent-600 dark:text-surface-300 dark:hover:text-accent-400"
								>
									X
								</Link>
							</nav>

							<a
								href="https://github.com/yaschet/website"
								target="_blank"
								rel="noreferrer"
								className="font-medium text-surface-500 text-xs transition-colors hover:text-accent-600 dark:text-surface-400 dark:hover:text-accent-400"
							>
								Source
							</a>
						</div>
					</div>
				</PageContainer>
			</section>
		</footer>
	);
}
