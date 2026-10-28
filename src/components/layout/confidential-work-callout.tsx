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
		<div className={cn("portfolio-box-pad", className)}>
			<div className="portfolio-callout">
				<Heading className="font-medium text-base text-foreground leading-6">
					Confidential work
				</Heading>
				<p className="portfolio-body-sm portfolio-callout-copy text-muted-foreground">
					Other work spans legal translation, education, onboarding, operations, and
					reconciliation. Most of it is private. Happy to discuss it{" "}
					<Link
						transitionTypes={["navigation"]}
						href="/contact"
						className="font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
					>
						in a call
					</Link>
					.
				</p>
			</div>
		</div>
	);
}
