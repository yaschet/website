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
				<Heading className="portfolio-section-heading min-w-0">Confidential work</Heading>
				<p className="portfolio-project-description portfolio-body-md text-muted-foreground">
					Some client work stays private. I can discuss my role and approach without
					sharing confidential details.{" "}
					<Link
						transitionTypes={["navigation"]}
						href="/contact"
						className="portfolio-confidential-link font-medium text-foreground underline underline-offset-4"
					>
						Ask about relevant work
					</Link>
					.
				</p>
			</div>
		</div>
	);
}
