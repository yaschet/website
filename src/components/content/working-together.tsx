import { PageContainer } from "@/src/components/layout/containers";
import { ScrollReveal } from "@/src/components/ui/reveal";
import { SwissGridBox, SwissGridRow } from "@/src/components/ui/swiss-grid";

const PROJECT_QUESTIONS = [
	{
		question: "What can you help with?",
		answer: "Web applications, internal tools and integrations. I can build something new or improve an existing product, from its interface to the systems behind it.",
	},
	{
		question: "How do we start?",
		answer: "Bring the problem you want to solve. We discuss who uses the product, what gets in their way and what needs to change, then agree on the next step.",
	},
	{
		question: "How do pricing and timing work?",
		answer: "I review the requirements and any existing code before quoting. We agree on the scope, deliverables, cost and timeline before the build starts.",
	},
	{
		question: "What happens at handover?",
		answer: "Source code, deployment and documentation are agreed as part of the scope. If you need ongoing support or further development, we discuss that separately.",
	},
] as const;

export function WorkingTogether() {
	return (
		<section
			id="working-together"
			aria-labelledby="working-together-heading"
			className="mt-10 w-full"
		>
			<ScrollReveal phase={2}>
				<PageContainer>
					<SwissGridBox>
						<SwissGridRow>
							<div className="portfolio-box-pad portfolio-editorial-section">
								<h2
									id="working-together-heading"
									className="portfolio-section-heading"
								>
									Working together
								</h2>
								<div className="grid min-w-0 gap-[var(--portfolio-space-group)] sm:grid-cols-2">
									{PROJECT_QUESTIONS.map(({ question, answer }) => (
										<div key={question} className="portfolio-card-copy min-w-0">
											<h3 className="portfolio-detail-title text-foreground">
												{question}
											</h3>
											<p className="portfolio-detail-copy text-muted-foreground">
												{answer}
											</p>
										</div>
									))}
								</div>
							</div>
						</SwissGridRow>
					</SwissGridBox>
				</PageContainer>
			</ScrollReveal>
		</section>
	);
}
