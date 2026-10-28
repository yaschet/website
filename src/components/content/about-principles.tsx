const PRINCIPLES = [
	{
		title: "Boring infrastructure over new toys.",
		description:
			"I'd rather use Postgres than five new databases, standard TypeScript than clever abstractions, and proven libraries than whatever launched last week. Novel stacks create debt. Boring stacks ship and keep shipping through pivots.",
	},
	{
		title: "Verified AI, not vibe coding.",
		description:
			"I use Claude Code, Cursor, and Codex every day for scaffolding, refactors, tests, and reading new codebases. I don't ship unverified AI output into anything that touches money, eligibility, or user-visible correctness. Those paths get tests, evals, and a manual pass before they go live.",
	},
	{
		title: "One owner per decision.",
		description:
			"I work best when one person owns decisions end to end. Committee scoping tends to produce committee software. If a project has four stakeholders who can each override the architecture, I'm probably not the right fit.",
	},
	{
		title: "End to end.",
		description:
			"I don't hand off at the edge of my tickets. I follow the work from first commit to the deployment logs. If something breaks at 2am, I'm the one reading the stack trace.",
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
