import Link from "next/link";
import { cn } from "@/src/lib/utils";

interface ConfidentialWorkCalloutProps {
	className?: string;
}

export function ConfidentialWorkCallout({ className }: ConfidentialWorkCalloutProps) {
	return (
		<div className={cn("portfolio-box-pad", className)}>
			<div className="portfolio-callout">
				<p className="portfolio-kicker bg-surface-950 px-2 py-0.5 text-surface-50 dark:bg-surface-50 dark:text-surface-950">
					Confidential Work
				</p>
				<p className="portfolio-body-sm portfolio-callout-copy text-surface-600 dark:text-surface-400">
					Work in legal translation, international education, customer onboarding,
					back-office tooling, and financial reconciliation. Most of it is under NDA. The
					case studies below are anonymized. Happy to go deeper{" "}
					<Link
						href="/contact"
						className="font-medium text-surface-900 underline decoration-surface-300 underline-offset-4 transition-colors hover:decoration-surface-900 dark:text-surface-100 dark:decoration-surface-700 dark:hover:decoration-surface-100"
					>
						in a call
					</Link>{" "}
					.
				</p>
			</div>
		</div>
	);
}
