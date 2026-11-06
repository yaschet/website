"use client";

import type { ReactNode } from "react";
import { Spinner } from "./spinner";
import { StateSwap } from "./state-swap";

/** Actions and navigation share one balanced, smoothly resizing glyph chamber. */
export function ButtonContent({
	children,
	icon,
	loading = false,
	iconOnly = false,
	iconPosition = "start",
}: {
	children?: ReactNode;
	icon?: ReactNode;
	loading?: boolean;
	iconOnly?: boolean;
	iconPosition?: "start" | "end";
}) {
	return (
		<span
			className="foundation-button-pending"
			data-icon-only={iconOnly || undefined}
			data-has-icon={icon != null || iconOnly || undefined}
			data-icon-position={iconPosition}
		>
			<span className="foundation-button-icon-space" aria-hidden="true">
				<StateSwap
					className="foundation-button-icon"
					value={loading ? "pending" : "idle"}
					items={{
						idle: iconOnly ? (icon ?? children) : icon,
						pending: (
							<Spinner
								aria-hidden="true"
								className="text-current"
								focusable="false"
								style={{ width: "100%", height: "100%" }}
							/>
						),
					}}
				/>
			</span>
			{!iconOnly && <span className="foundation-button-pending-copy">{children}</span>}
		</span>
	);
}
