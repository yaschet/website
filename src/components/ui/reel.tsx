import type { ReactNode } from "react";

/** The owning control keeps its real icon/spinner chamber and accessible name. */
export function ReelIcon({
	children,
	direction = "right",
}: {
	children: ReactNode;
	direction?: "right" | "up-right";
}) {
	return (
		<span className="portfolio-reel-icon" data-direction={direction} aria-hidden="true">
			<span data-reel-out="">{children}</span>
			<span data-reel-in="">{children}</span>
		</span>
	);
}
