import { PageContainer } from "@/src/components/layout/containers";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/src/components/ui/accordion";
import { ArrowButtonLink } from "@/src/components/ui/arrow-button-link";
import { ScrollReveal } from "@/src/components/ui/reveal";
import { SwissGridBox, SwissGridRow } from "@/src/components/ui/swiss-grid";
import styles from "./working-together.module.css";

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
				<PageContainer mobileBleed>
					<SwissGridBox>
						<SwissGridRow>
							<div className="portfolio-box-pad portfolio-editorial-section">
								<h2
									id="working-together-heading"
									className="portfolio-section-heading"
								>
									Working together
								</h2>
								<p className="portfolio-body-md max-w-[60ch] text-muted-foreground">
									Bring a new product or an existing system that needs work. We
									start by understanding the workflow and agreeing on a useful
									first scope.
								</p>
								<Accordion type="single" collapsible className={styles.questions}>
									{PROJECT_QUESTIONS.map(({ question, answer }, index) => (
										<AccordionItem
											key={question}
											value={`question-${index}`}
											className={styles.item}
										>
											<AccordionTrigger className={styles.trigger}>
												{question}
											</AccordionTrigger>
											<AccordionContent className={styles.answer}>
												{answer}
											</AccordionContent>
										</AccordionItem>
									))}
								</Accordion>
								<div>
									<ArrowButtonLink href="/contact" variant="solid">
										Discuss a project
									</ArrowButtonLink>
								</div>
							</div>
						</SwissGridRow>
					</SwissGridBox>
				</PageContainer>
			</ScrollReveal>
		</section>
	);
}
