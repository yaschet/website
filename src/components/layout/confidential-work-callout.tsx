import Link from "next/link";
import { cn } from "@/src/lib/utils";

interface ConfidentialWorkCalloutProps {
	className?: string;
}

export function ConfidentialWorkCallout({ className }: ConfidentialWorkCalloutProps) {
	return (
		<div className={cn("portfolio-box-pad", className)}>
			<div className="portfolio-callout">
				<p className="portfolio-kicker text-surface-600 dark:text-surface-400">
					Confidential Work
				</p>
				<p className="portfolio-body-sm portfolio-callout-copy text-surface-600 dark:text-surface-400">
					Other work spans legal translation, education, onboarding, operations, and
					reconciliation. Most of it is private. Happy to discuss it{" "}
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
