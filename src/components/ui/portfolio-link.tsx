"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ComponentProps, createContext, useContext, useTransition } from "react";
import { startRouteTransition, supersedeRouteTransition } from "@/src/lib/route-transition";

const PendingContext = createContext(false);

export function usePortfolioLinkPending() {
	return useContext(PendingContext);
}

/** Keep native Link semantics and prefetching; enhance eligible pointer navigations only. */
export function PortfolioLink({
	href,
	replace,
	scroll,
	transitionTypes,
	onNavigate,
	...props
}: ComponentProps<typeof Link>) {
	const router = useRouter();
	const [pending, startTransition] = useTransition();
	return (
		<PendingContext.Provider value={pending}>
			<Link
				{...props}
				href={href}
				replace={replace}
				scroll={scroll}
				transitionTypes={transitionTypes}
				onNavigate={(event) => {
					let prevented = false;
					onNavigate?.({
						preventDefault: () => {
							prevented = true;
							event.preventDefault();
						},
					});
					if (prevented || typeof href !== "string") return;
					// Fragment activation is a browser scroll, including repeated activation
					// of the current hash. Next's same-URL route bailout must not swallow it.
					if (href.startsWith("#") && scroll !== false) {
						event.preventDefault();
						supersedeRouteTransition();
						if (replace) window.location.replace(href);
						else window.location.assign(href);
						return;
					}
					const enhanced = startRouteTransition(href, () => {
						startTransition(() => {
							const options = { scroll, transitionTypes };
							if (replace) router.replace(href, options);
							else router.push(href, options);
						});
					});
					if (enhanced) event.preventDefault();
				}}
			/>
		</PendingContext.Provider>
	);
}
