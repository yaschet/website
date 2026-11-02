const PRINCIPLES = [
	{
		title: "Choose familiar tools.",
		description:
			"I choose tools for the requirements and the people maintaining the product. Familiar infrastructure and clear TypeScript make it easier to understand the system and change it later.",
	},
	{
		title: "Check consequential decisions.",
		description:
			"Billing, eligibility and extracted document data need explicit rules and verification. I use tests, evaluations and manual review where a plausible answer is not enough.",
	},
	{
		title: "Make ownership explicit.",
		description:
			"We agree on the scope, who makes decisions and how progress will be reviewed. I explain technical tradeoffs in terms of what they change for the product and its users.",
	},
	{
		title: "Follow through to deployment.",
		description:
			"Design, application code, data and deployment are connected parts of the work. I follow a change through the system and leave the source and operating decisions understandable at handover.",
	},
] as const;

export function AboutPrinciples() {
	return (
		<div className="portfolio-principles">
			{PRINCIPLES.map((principle) => (
				<div key={principle.title} className="portfolio-principle">
					<div className="portfolio-card-copy">
						<h3 className="portfolio-detail-title text-foreground">
							{principle.title}
						</h3>
						<p className="portfolio-detail-copy text-muted-foreground">
							{principle.description}
						</p>
					</div>
				</div>
			))}
		</div>
	);
}
