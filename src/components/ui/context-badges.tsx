import { CountryFlagMA, SquareFlag } from "react-square-flags";
import { ContextPanel } from "@/src/components/ui/context-panel";
import { cn } from "@/src/lib/index";

export { MarqueeBadge } from "./marquee-badge";
export { TimeBadge } from "./time-badge";

/** The flag and time glyph share the rail's square chamber and text baseline. */
export function LocationBadge({ className }: { className?: string }) {
	return (
		<ContextPanel
			className={cn(
				"portfolio-context-badge portfolio-context-trigger portfolio-location",
				className,
			)}
			label="About my location: Rabat, Morocco"
			title="Working together"
			action="Discuss a project"
			rows={[
				{ label: "Based in", value: "Rabat, Morocco" },
				{ label: "Work", value: "Remote · worldwide" },
				{ label: "Contact", value: "Email & scheduled calls" },
			]}
		>
			<span className="portfolio-context-chamber" aria-hidden="true">
				<SquareFlag flag={CountryFlagMA} size="100%" />
			</span>
			<span className="portfolio-context-label">
				Rabat<span className="portfolio-location-country">, Morocco</span>
			</span>
		</ContextPanel>
	);
}
