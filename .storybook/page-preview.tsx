import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** A padded, contained viewport for route states, including fixed loading chrome. */
export function WorkshopPagePreview({
	children,
	routeState = false,
}: {
	children: ReactNode;
	routeState?: boolean;
}) {
	return (
		<div className="workshop-stage">
			<div
				className={cn(
					"workshop-page-frame workshop-viewport",
					routeState && "workshop-route-state",
				)}
			>
				{children}
			</div>
		</div>
	);
}
