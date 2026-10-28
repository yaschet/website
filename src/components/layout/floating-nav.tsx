"use client";

import {
	RiBriefcaseLine as Briefcase,
	RiChat3Line as ChatCenteredText,
	RiArticleLine as FileText,
	RiHomeLine as House,
	RiMoonLine as Moon,
	RiSunLine as Sun,
	RiUserLine as User,
} from "@remixicon/react";
import { useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import type { ComponentType, CSSProperties, FocusEvent, PointerEvent } from "react";
import { useEffect, useId, useRef, useState } from "react";
import { useRevealState } from "@/src/components/providers/reveal-provider";
import { HoverTooltip, useHoverTooltip } from "@/src/components/ui/hover-tooltip";
import { LinkFeedback } from "@/src/components/ui/link-feedback";
import { PortfolioLink as Link } from "@/src/components/ui/portfolio-link";
import { StateSwap } from "@/src/components/ui/state-swap";
import { toggleThemeWithTransition } from "@/src/lib/theme-transition";

type NavItem = {
	name: string;
	link: string;
	icon: ComponentType<{ className?: string; style?: CSSProperties }>;
};
const navItems: NavItem[] = [
	{ name: "Home", link: "/", icon: House },
	{ name: "About", link: "/about", icon: User },
	{ name: "Case Studies", link: "/case-studies", icon: Briefcase },
	{ name: "Blog", link: "/blog", icon: FileText },
	{ name: "Contact", link: "/contact", icon: ChatCenteredText },
];
function getActiveIndex(pathname: string) {
	return navItems.findIndex((item) =>
		item.link === "/" ? pathname === "/" : pathname.startsWith(item.link),
	);
}

/** The route marker stays put while a separate, clipped hover plane follows exploration. */
export function FloatingNav() {
	const pathname = usePathname();
	const { setTheme, resolvedTheme, theme } = useTheme();
	const activeIndex = getActiveIndex(pathname);
	const [isMounted, setIsMounted] = useState(false);
	const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
	const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
	const [underlay, setUnderlay] = useState({ index: 0, visible: false, snap: true });
	const hoverExited = useRef(true);
	const controls = useRef<(HTMLElement | null)[]>([]);
	const dock = useRef<HTMLElement>(null);
	const hint = useHoverTooltip();
	const tooltipId = useId();
	const { environment } = useRevealState();
	const reducedPreference = useReducedMotion();
	const reduced = isMounted && (reducedPreference || environment === "reduced-motion");
	const keyboard = focusedIndex !== null && hoveredIndex === null;
	const routeHover =
		hoveredIndex !== null && hoveredIndex < navItems.length ? hoveredIndex : null;
	const routeFocus =
		focusedIndex !== null && focusedIndex < navItems.length ? focusedIndex : null;
	const themeHighlighted = hoveredIndex === navItems.length || focusedIndex === navItems.length;

	useEffect(() => {
		setIsMounted(true);
	}, []);
	useEffect(() => {
		if (!isMounted || !["light", "dark", "system"].includes(theme ?? "")) return;
		// biome-ignore lint/suspicious/noDocumentCookie: Non-sensitive preference needed by server rendering; Cookie Store is not supported in every target browser.
		document.cookie = `theme=${theme}; Path=/; Max-Age=31536000; SameSite=Lax`;
	}, [isMounted, theme]);
	const hideHover = () => {
		setHoveredIndex(null);
		setUnderlay((previous) => ({ ...previous, visible: false }));
	};

	const pointerEnter = (event: PointerEvent<HTMLElement>, index: number, label: string) => {
		if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
		if (event.buttons !== 0) return;
		setHoveredIndex(index);
		if (index < navItems.length) {
			setUnderlay({ index, visible: true, snap: hoverExited.current });
			hoverExited.current = false;
		} else {
			setUnderlay((previous) => ({ ...previous, visible: false }));
		}
		hint.show({
			id: String(index),
			label,
			anchor: event.currentTarget,
			boundary: dock.current ?? event.currentTarget,
			align: index === 0 ? "start" : index === navItems.length ? "end" : "center",
		});
	};
	const focus = (event: FocusEvent<HTMLElement>, index: number, label: string) => {
		if (!event.currentTarget.matches(":focus-visible")) return;
		setFocusedIndex(index);
		hint.show(
			{
				id: String(index),
				label,
				anchor: event.currentTarget,
				boundary: dock.current ?? event.currentTarget,
				align: index === 0 ? "start" : index === navItems.length ? "end" : "center",
			},
			true,
		);
	};
	const blur = () => {
		setFocusedIndex(null);
		hint.dismiss();
	};
	const themeToggleLabel =
		isMounted && resolvedTheme
			? `Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`
			: "Toggle theme";
	return (
		<>
			<div className="pointer-events-none fixed right-0 bottom-0 left-0 z-50 flex h-[var(--portfolio-nav-clearance)] items-center justify-center px-[var(--portfolio-page-gutter-mobile)] sm:px-[var(--portfolio-page-gutter-desktop)]">
				<nav
					ref={dock}
					className="portfolio-nav pointer-events-auto"
					aria-label="Main navigation"
					data-motion-input={keyboard ? "keyboard" : undefined}
				>
					<ul
						className="portfolio-nav-rail"
						onPointerLeave={() => {
							hideHover();
							hint.hide();
						}}
					>
						<li>
							<ul className="portfolio-nav-pages" onPointerLeave={hideHover}>
								<li className="portfolio-nav-underlay-clip" aria-hidden="true">
									<span
										className="portfolio-nav-underlay portfolio-nav-active"
										data-instant={reduced || keyboard}
										style={{
											transform: `translateX(calc(${Math.max(0, activeIndex)} * var(--portfolio-control-default)))`,
											opacity: activeIndex >= 0 ? 1 : 0,
										}}
									/>
									<span
										className="portfolio-nav-underlay portfolio-nav-hover"
										data-instant={reduced || keyboard}
										data-snap={underlay.snap}
										style={{
											transform: `translateX(calc(${routeFocus ?? underlay.index} * var(--portfolio-control-default)))`,
											opacity:
												underlay.visible || routeFocus !== null ? 1 : 0,
										}}
										onTransitionEnd={(event) => {
											if (
												event.propertyName === "opacity" &&
												!underlay.visible
											)
												hoverExited.current = true;
										}}
									/>
								</li>
								{navItems.map((item, index) => {
									const Icon = item.icon;
									return (
										<li key={item.link}>
											<Link
												transitionTypes={["navigation"]}
												href={item.link}
												ref={(node) => {
													controls.current[index] = node;
												}}
												aria-label={item.name}
												aria-current={
													activeIndex === index ? "page" : undefined
												}
												aria-describedby={
													hint.target?.id === String(index)
														? tooltipId
														: undefined
												}
												className="portfolio-nav-control"
												data-highlighted={
													activeIndex === index ||
													routeHover === index ||
													routeFocus === index
												}
												onNavigate={() => {
													hint.dismiss();
												}}
												onPointerEnter={(event) =>
													pointerEnter(event, index, item.name)
												}
												onFocus={(event) => focus(event, index, item.name)}
												onBlur={blur}
											>
												<LinkFeedback
													icon={<Icon className="size-4" />}
													iconOnly
												/>
											</Link>
										</li>
									);
								})}
							</ul>
						</li>
						<li className="portfolio-nav-divider" aria-hidden="true" />
						<li>
							<button
								type="button"
								ref={(node) => {
									controls.current[navItems.length] = node;
								}}
								className="portfolio-nav-control theme-toggle"
								data-highlighted={themeHighlighted}
								aria-label={`Theme: ${themeToggleLabel}`}
								aria-describedby={
									hint.target?.id === String(navItems.length)
										? tooltipId
										: undefined
								}
								onPointerEnter={(event) =>
									pointerEnter(event, navItems.length, "Theme")
								}
								onFocus={(event) => focus(event, navItems.length, "Theme")}
								onBlur={blur}
								onClick={(event) => {
									hint.dismiss();
									toggleThemeWithTransition(
										setTheme,
										resolvedTheme,
										event.detail === 0 ? "keyboard" : "pointer",
									);
								}}
							>
								<StateSwap
									value={isMounted && resolvedTheme === "dark" ? "dark" : "light"}
									items={{
										light: <Moon className="size-4" />,
										dark: <Sun className="size-4" />,
									}}
								/>
							</button>
						</li>
					</ul>
				</nav>
			</div>
			<HoverTooltip
				id={tooltipId}
				target={hint.target}
				instant={keyboard}
				onPointerEnter={hint.keepOpen}
				onPointerLeave={hint.hide}
			/>
		</>
	);
}
