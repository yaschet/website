import { PageContainer } from "@/src/components/layout/containers";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/src/components/ui/accordion";
import { ScrollReveal } from "@/src/components/ui/reveal";
import { SwissGridBox, SwissGridRow } from "@/src/components/ui/swiss-grid";
import { cn } from "@/src/lib/utils";
import styles from "./working-together.module.css";

const PROJECT_QUESTIONS = [
	{
		question: "What can I hire you for?",
		answer: "Complete web applications, new features and improvements to existing software. You can bring a clear technical brief or a problem you need help solving.",
	},
	{
		question: "Do you take on ongoing work?",
		answer: "Yes. I take on ongoing development and support, whether I built the original product or not. We agree on priorities, the time I can commit and the cost before we start.",
	},
	{
		question: "What do you need to get started?",
		answer: "Tell me what you need, why it matters and any deadline you're working toward. Share your existing software or brief if you have one. If the details aren't clear yet, we can work them out together.",
	},
	{
		question: "How do pricing and timing work?",
		answer: "I review the work before giving you a price and expected timeline. The written proposal explains what's included, the payment terms and what I need from you. I also explain running costs, such as hosting. We agree before I start.",
	},
	{
		question: "What is it like to work with you?",
		answer: "You work directly with me, see working versions and give feedback before release. I explain the choices and keep you updated on what's ready, what needs your input and what's next.",
	},
	{
		question: "What if we need to change the plan?",
		answer: "We talk about it before I build the change. I check what's already included, explain any effect on price or timing, and let you decide whether to proceed.",
	},
	{
		question: "What happens after launch?",
		answer: "I check the live product and hand over the code and instructions your team needs. We agree upfront on support after launch, including fixes for problems in my work. You can keep working with me or continue with another developer.",
	},
] as const;

export function WorkingTogether({ className }: { className?: string }) {
	return (
		<section
			id="working-together"
			aria-labelledby="working-together-heading"
			className={cn("mt-10 w-full", className)}
		>
			<ScrollReveal phase={2}>
				<PageContainer mobileBleed>
					<SwissGridBox className={styles.frame}>
						<SwissGridRow>
							<div className={`${styles.header} portfolio-editorial-section`}>
								<h2
									id="working-together-heading"
									className="portfolio-section-heading"
								>
									Working together
								</h2>
								<p className="portfolio-body-md max-w-[60ch] text-muted-foreground">
									You stay involved in the decisions without having to manage
									every technical detail. We agree on the work and cost upfront,
									and you review working software along the way.
								</p>
							</div>
						</SwissGridRow>
						<SwissGridRow>
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
						</SwissGridRow>
					</SwissGridBox>
				</PageContainer>
			</ScrollReveal>
		</section>
	);
}
