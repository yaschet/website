import { ContactForm } from "@/src/components/forms/contact-form";
import { SITE_BOOKING_URL, SITE_EMAIL } from "@/src/constants/site";

/** The page owns the perimeter; this composition owns the heading-to-fields gap. */
export function ContactMessage({ formEnabled = false }: { formEnabled?: boolean }) {
	return (
		<div className="portfolio-contact-compose">
			<div className="portfolio-card-copy">
				<h2 className="portfolio-section-heading">Send a message</h2>
				<p className="portfolio-detail-copy text-muted-foreground">
					{formEnabled ? (
						"A short description is enough to start. If you have an existing product, include a link."
					) : (
						<>
							For project scope, questions or an introduction,{" "}
							<a
								className="font-medium text-foreground underline underline-offset-4"
								href={`mailto:${SITE_EMAIL}`}
							>
								email me
							</a>{" "}
							or{" "}
							<a
								className="font-medium text-foreground underline underline-offset-4"
								href={SITE_BOOKING_URL}
								target="_blank"
								rel="noreferrer"
							>
								book a call
							</a>
							.
						</>
					)}
				</p>
			</div>
			{formEnabled && <ContactForm />}
		</div>
	);
}
