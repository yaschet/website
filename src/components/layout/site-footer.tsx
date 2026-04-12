"use client";

import Link from "next/link";

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
				<div className="mx-auto max-w-3xl py-8">
					<div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
						{/* Copyright & Email */}
						<div className="flex flex-col items-center gap-1 sm:items-start">
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

						{/* Social Links */}
						<nav className="flex items-center gap-6" aria-label="Social Links">
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
					</div>
					<div className="mt-3 text-center text-[11px] text-surface-500 sm:text-right dark:text-surface-400">
						<a
							href="https://github.com/yaschet/website"
							target="_blank"
							rel="noreferrer"
							className="font-mono uppercase tracking-[0.2em] transition-colors hover:text-accent-600 dark:hover:text-accent-400"
						>
							source
						</a>
						<span className="ml-2">built by hand, in code</span>
					</div>
				</div>
			</section>
		</footer>
	);
}
