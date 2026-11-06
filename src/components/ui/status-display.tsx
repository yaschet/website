import type { ComponentProps, ReactNode } from "react";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { IconChamber } from "@/src/components/ui/icon-chamber";
import { cn } from "@/src/lib/index";

const states = ["idle", "pending", "success", "error"] as const;
export type StatusDisplayState = (typeof states)[number];
export type StatusDisplayItem = { icon: ReactNode; description: ReactNode; title?: string };

/** One persistent feedback surface; only the active state's text is accessible. */
export function StatusDisplay({
	state,
	items,
	className,
	...props
}: Omit<ComponentProps<"div">, "children"> & {
	state: StatusDisplayState;
	items: Record<StatusDisplayState, StatusDisplayItem>;
}) {
	return (
		<Alert
			{...props}
			role="status"
			aria-atomic="true"
			appearance="chamber"
			variant={
				state === "error" ? "destructive" : state === "success" ? "success" : "default"
			}
			data-state={state}
			className={cn("status-display t-interactive", className)}
		>
			<IconChamber aria-hidden="true">
				<span className="t-icon-swap status-display-icons">
					{states.map((key) => (
						<span key={key} className="t-icon" data-active={key === state}>
							{items[key].icon}
						</span>
					))}
				</span>
			</IconChamber>
			<AlertDescription className="t-state-label status-display-copy">
				{states.map((key) => (
					<div
						key={key}
						data-status-copy=""
						data-has-title={Boolean(items[key].title)}
						data-active={key === state}
						aria-hidden={key !== state}
						inert={key !== state}
					>
						{items[key].title ? (
							<strong className="status-display-title">{items[key].title}</strong>
						) : null}
						{items[key].description}
					</div>
				))}
			</AlertDescription>
		</Alert>
	);
}
