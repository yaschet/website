import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import Link from "next/link";
import { SiteHeroField } from "@/src/components/layout/site-hero-field";

const HERO_COLUMN_MAX_WIDTH = "calc(var(--portfolio-grid-step) * 50)";
const HERO_BODY_MAX_WIDTH = "58ch";

export function SiteHero() {
	return (
		<section
			id="hero"
			className="relative isolate w-full overflow-hidden"
			data-instrument-host=""
		>
			<SiteHeroField />
			<div className="portfolio-box-pad relative z-10">
				<div
					className="portfolio-stack-related w-full"
					style={{ maxWidth: HERO_COLUMN_MAX_WIDTH }}
				>
					<div className="portfolio-stack-related">
						<h1
							className="portfolio-heading-xl portfolio-capsize-heading-xl w-fit max-w-full text-surface-800 dark:text-surface-100"
							style={{ margin: 0 }}
						>
							Complex systems, clean interfaces.
						</h1>
						<p
							className="portfolio-body-lg text-surface-700 dark:text-surface-300"
							style={{ maxWidth: HERO_BODY_MAX_WIDTH, margin: 0 }}
						>
							I build CRMs, billing systems, document workflows, and{" "}
							<span className="whitespace-nowrap">AI pipelines</span> that replace
							manual work. Internal tools and SaaS for small businesses, made to feel
							simple to use.
						</p>
					</div>
					<div className="portfolio-control-row pointer-events-auto">
						<Link
							href="/case-studies"
							className="portfolio-control-label inline-flex h-[var(--portfolio-control-default)] items-center gap-[var(--portfolio-control-gap)] bg-surface-900 px-[var(--portfolio-control-pad-default)] text-surface-50 transition-colors duration-150 hover:bg-surface-800 focus-visible:bg-surface-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface-400 focus-visible:ring-offset-2 dark:bg-surface-100 dark:text-surface-950 dark:focus-visible:bg-surface-200 dark:hover:bg-surface-200"
						>
							Case Studies
							<ArrowRightIcon className="size-4" weight="bold" />
						</Link>
						<Link
							href="/contact"
							className="portfolio-control-label inline-flex h-[var(--portfolio-control-default)] items-center gap-[var(--portfolio-control-gap)] bg-surface-100 px-[var(--portfolio-control-pad-default)] text-surface-800 transition-colors duration-150 hover:bg-surface-200 focus-visible:bg-surface-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface-400 focus-visible:ring-offset-2 dark:bg-surface-800 dark:text-surface-200 dark:focus-visible:bg-surface-700 dark:hover:bg-surface-700"
						>
							Email
						</Link>
					</div>
				</div>
			</div>
		</section>
	);
}
