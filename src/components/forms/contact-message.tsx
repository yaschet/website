import { ContactForm } from "@/src/components/forms/contact-form";

/** The page owns the perimeter; this composition owns the heading-to-fields gap. */
export function ContactMessage() {
	return (
		<div className="portfolio-contact-compose">
			<div className="portfolio-card-copy">
				<h2 className="portfolio-section-heading">Send a message</h2>
				<p className="portfolio-detail-copy text-muted-foreground">
					Project scope, questions, or an introduction.
				</p>
			</div>
			<ContactForm />
		</div>
	);
}
