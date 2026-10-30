import Link from "next/link";
import { cn } from "@/src/lib/utils";

interface ConfidentialWorkCalloutProps {
	className?: string;
	/** Use level two when the note is a standalone section. */
	headingLevel?: 2 | 3;
}

export function ConfidentialWorkCallout({
	className,
	headingLevel = 3,
}: ConfidentialWorkCalloutProps) {
	const Heading = headingLevel === 2 ? "h2" : "h3";
	return (
		<div
			className={cn(
				"portfolio-project-card portfolio-confidential-work w-full min-w-0 bg-[var(--portfolio-panel)] text-card-foreground",
				className,
			)}
		>
			<div className="portfolio-project-copy portfolio-project-overview portfolio-confidential-note">
				<Heading className="portfolio-project-title portfolio-capsize-project-title min-w-0">
					Confidential work
				</Heading>
				<p className="portfolio-project-description portfolio-body-sm text-muted-foreground">
					Other work spans legal translation, education, onboarding, operations, and
					reconciliation. Most of it is private. Happy to discuss it{" "}
					<Link
						transitionTypes={["navigation"]}
						href="/contact"
						className="portfolio-confidential-link font-medium text-foreground underline underline-offset-4"
					>
						in a call
					</Link>
					.
				</p>
			</div>
		</div>
	);
}
