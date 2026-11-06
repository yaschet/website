"use client";

import { useLinkStatus } from "next/link";
import { type ReactNode, useEffect, useState } from "react";
import { ButtonContent } from "./button-content";
import { usePortfolioLinkPending } from "./portfolio-link";

/** Delay only the indicator, never the navigation. Cached links do not flash progress. */
export function LinkFeedback({
	children,
	icon,
	iconPosition,
	iconOnly,
}: {
	children?: ReactNode;
	icon?: ReactNode;
	iconPosition?: "start" | "end";
	iconOnly?: boolean;
}) {
	const { pending: nativePending } = useLinkStatus();
	const transitionPending = usePortfolioLinkPending();
	const pending = nativePending || transitionPending;
	const [visible, setVisible] = useState(false);
	useEffect(() => {
		if (!pending) {
			setVisible(false);
			return;
		}
		const timer = window.setTimeout(() => setVisible(true), 150);
		return () => window.clearTimeout(timer);
	}, [pending]);
	return (
		<span
			className="inline-flex"
			data-slot="link-feedback"
			data-loading={pending && visible ? "" : undefined}
			aria-busy={pending || undefined}
		>
			<ButtonContent
				icon={icon}
				iconPosition={iconPosition}
				iconOnly={iconOnly}
				loading={pending && visible}
			>
				{children}
			</ButtonContent>
		</span>
	);
}
