import type { ComponentProps, ReactNode } from "react";

import { IconChamber } from "@/src/components/ui/icon-chamber";

/** Optional, fixed-size leading chamber shared by modal and panel headings. */
export type OverlayHeadingProps = {
	icon?: ReactNode;
	iconColor?: ComponentProps<typeof IconChamber>["color"];
};

/** Keeps the title and description in one column without stretching the icon. */
export function OverlayHeading({
	icon,
	iconColor = "secondary",
	children,
}: OverlayHeadingProps & { children: ReactNode }) {
	return (
		<>
			{icon && (
				<IconChamber
					className="foundation-overlay-icon"
					size="default"
					color={iconColor}
					aria-hidden="true"
				>
					{icon}
				</IconChamber>
			)}
			<div className="foundation-overlay-heading-copy">{children}</div>
		</>
	);
}
