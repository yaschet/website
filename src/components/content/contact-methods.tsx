import { ButtonLink } from "@/src/components/ui/button-link";
import { SITE_BOOKING_URL, SITE_EMAIL } from "@/src/constants/site";

const CONTACT_METHODS = [
	{
		kicker: "Email",
		title: SITE_EMAIL,
		description: "A few lines about what you have in mind are enough to start.",
		actions: [
			{
				label: "Email",
				href: `mailto:${SITE_EMAIL}`,
				variant: "solid" as const,
				color: "primary" as const,
			},
		],
	},
	{
		kicker: "Call",
		title: "Talk it through",
		description: "A 15-minute call to meet and talk about what you need.",
		actions: [
			{
				label: "Book a call",
				href: SITE_BOOKING_URL,
				variant: "soft" as const,
				color: "default" as const,
				target: "_blank" as const,
			},
		],
	},
	{
		kicker: "Elsewhere",
		title: "Find me online",
		description: "My background, code and recent posts.",
		actions: [
			{
				label: "LinkedIn",
				href: "https://linkedin.com/in/yassinechettouch",
				variant: "soft" as const,
				color: "default" as const,
				target: "_blank" as const,
			},
			{
				label: "GitHub",
				href: "https://github.com/yaschet",
				variant: "soft" as const,
				color: "default" as const,
				target: "_blank" as const,
			},
			{
				label: "X",
				href: "https://x.com/yaschett",
				variant: "soft" as const,
				color: "default" as const,
				target: "_blank" as const,
			},
		],
	},
] as const;

export function ContactMethods() {
	return (
		<div className="portfolio-contact-methods">
			{CONTACT_METHODS.map((method) => (
				<div key={method.kicker} className="portfolio-contact-method">
					<div className="portfolio-card-copy">
						<p className="portfolio-kicker text-muted-foreground">{method.kicker}</p>
						<h2 className="portfolio-detail-title text-foreground">{method.title}</h2>
						<p className="portfolio-detail-copy text-muted-foreground">
							{method.description}
						</p>
					</div>
					<div className="portfolio-control-row">
						{method.actions.map((action) => (
							<ButtonLink
								key={action.label}
								size="md"
								variant={action.variant}
								color={action.color}
								href={action.href}
								target={"target" in action ? action.target : undefined}
								rel={"target" in action ? "noreferrer" : undefined}
							>
								{action.label}
							</ButtonLink>
						))}
					</div>
				</div>
			))}
		</div>
	);
}
