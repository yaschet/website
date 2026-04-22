"use client";

import {
	Briefcase,
	ChatCenteredText,
	FileText,
	House,
	Moon,
	Sun,
	User,
} from "@phosphor-icons/react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import type { ComponentType, CSSProperties } from "react";
import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { useRevealState } from "@/src/components/providers/reveal-provider";
import { HoverTooltip } from "@/src/components/ui/hover-tooltip";
import { cn, tweens } from "@/src/lib/index";

type NavItem = {
	name: string;
	link: string;
	icon: ComponentType<{
		className?: string;
		style?: CSSProperties;
		weight?: "regular" | "bold";
	}>;
};

const navItems: NavItem[] = [
	{ name: "Home", link: "/", icon: House },
	{ name: "About", link: "/about", icon: User },
	{ name: "Case Studies", link: "/case-studies", icon: Briefcase },
	{ name: "Blog", link: "/blog", icon: FileText },
	{ name: "Contact", link: "/contact", icon: ChatCenteredText },
];

const NAV_BUTTON_SIZE = "var(--portfolio-control-default)";
const NAV_ICON_SIZE = "var(--portfolio-icon-sm)";

function getActiveTab(pathname: string): string {
	const activeItem = navItems.find((item) =>
		item.link === "/" ? pathname === "/" : pathname.startsWith(item.link),
	);

	return activeItem?.link ?? "";
}

export function FloatingNav() {
	const pathname = usePathname();
	const { setTheme, resolvedTheme, theme } = useTheme();
	const activeTab = getActiveTab(pathname);

	const [isMounted, setIsMounted] = useState(false);
	const [hoveredTab, setHoveredTab] = useState<string | null>(null);
	const [isThemeHovered, setIsThemeHovered] = useState(false);
	const [optimisticTab, setOptimisticTab] = useState(activeTab);

	const { environment, phase } = useRevealState();

	useEffect(() => {
		setIsMounted(true);
	}, []);

	useEffect(() => {
		setOptimisticTab(activeTab);
	}, [activeTab]);

	useEffect(() => {
		if (!isMounted) return;
		if (theme !== "light" && theme !== "dark" && theme !== "system") return;

		document.cookie = `theme=${theme}; Path=/; Max-Age=31536000; SameSite=Lax`;
	}, [isMounted, theme]);

	const isEnabled = phase >= 1;
	const isReduced = environment === "reduced-motion";
	const isAutomation = environment === "automation";
	const currentTab = hoveredTab ?? optimisticTab;
	const themeToggleLabel =
		isMounted && resolvedTheme
			? `Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`
			: "Toggle theme";

	const toggleTheme = () => {
		const newTheme = resolvedTheme === "dark" ? "light" : "dark";

		if (
			!(document as Document & { startViewTransition?: unknown }).startViewTransition ||
			window.matchMedia("(prefers-reduced-motion: reduce)").matches
		) {
			setTheme(newTheme);
			return;
		}

		(
			document as Document & { startViewTransition: (cb: () => void) => void }
		).startViewTransition(() => {
			flushSync(() => {
				setTheme(newTheme);
			});
		});
	};

	return (
		<div className="pointer-events-none fixed right-0 bottom-0 left-0 z-50 flex h-[var(--portfolio-nav-clearance)] items-center justify-center px-[var(--portfolio-page-gutter-mobile)] sm:px-[var(--portfolio-page-gutter-desktop)]">
			<motion.nav
				initial={isAutomation ? false : { y: isReduced ? 0 : 20, opacity: 0 }}
				animate={isEnabled ? { y: 0, opacity: 1 } : { y: isReduced ? 0 : 20, opacity: 0 }}
				transition={isReduced ? tweens.reduced : tweens.shell}
				className={cn(
					"pointer-events-auto portfolio-solid-frame relative flex items-center p-[var(--portfolio-space-tight)]",
					"bg-surface-950 dark:bg-surface-50",
					"rounded-(--radius)",
					"shadow-sm",
				)}
				style={{
					willChange: "transform",
					contain: "layout style",
				}}
				role="navigation"
				aria-label="Main navigation"
			>
				<ul className="relative flex items-center" onMouseLeave={() => setHoveredTab(null)}>
					{navItems.map((item) => {
						const isActive = item.link === optimisticTab;
						const isVisuallyActive = currentTab === item.link;
						const Icon = item.icon;

						return (
							<li key={item.link} className="relative z-0">
								<Link
									href={item.link}
									onClick={() => setOptimisticTab(item.link)}
									className={cn(
										"relative flex items-center justify-center transition-colors duration-200",
										"rounded-(--radius)",
										isVisuallyActive
											? "text-surface-950 dark:text-surface-50"
											: "text-surface-400 hover:text-surface-50 dark:text-surface-500 dark:hover:text-surface-950",
									)}
									style={{
										width: NAV_BUTTON_SIZE,
										height: NAV_BUTTON_SIZE,
									}}
									onMouseEnter={() => setHoveredTab(item.link)}
									onFocus={() => setHoveredTab(item.link)}
									onBlur={() => setHoveredTab(null)}
									aria-current={isActive ? "page" : undefined}
								>
									<motion.div
										className="relative flex h-full w-full items-center justify-center"
										initial="idle"
										whileHover="hover"
										whileTap="tap"
										variants={{
											idle: { scale: 1 },
											hover: { scale: 1 },
											tap: { scale: 0.92 },
										}}
										transition={tweens.interaction}
									>
										{currentTab === item.link && (
											<motion.div
												layoutId="nav-bg"
												className="absolute inset-0 -z-10 bg-surface-50 dark:bg-surface-950"
												transition={tweens.interaction}
												style={{ borderRadius: "var(--radius)" }}
												variants={{
													tap: {
														scale: 0.95,
													},
												}}
											/>
										)}

										<motion.div
											variants={{
												hover: { scale: 1.05 },
												tap: { scale: 1 },
											}}
										>
											<Icon
												className="shrink-0"
												style={{
													width: NAV_ICON_SIZE,
													height: NAV_ICON_SIZE,
												}}
												weight={isActive ? "bold" : "regular"}
											/>
										</motion.div>
									</motion.div>
								</Link>

								<HoverTooltip
									visible={currentTab === item.link && hoveredTab === item.link}
									offset="mb-[var(--portfolio-overlay-gap)]"
									className="-translate-y-[var(--portfolio-space-tight)]"
								>
									{item.name}
								</HoverTooltip>
							</li>
						);
					})}
				</ul>

				<div
					className="portfolio-solid-divider-y mx-[var(--portfolio-space-tight)] shrink-0 self-stretch"
					aria-hidden="true"
				/>

				<motion.button
					onMouseEnter={() => setIsThemeHovered(true)}
					onMouseLeave={() => setIsThemeHovered(false)}
					onFocus={() => setIsThemeHovered(true)}
					onBlur={() => setIsThemeHovered(false)}
					onClick={toggleTheme}
					initial="idle"
					whileHover="hover"
					whileTap="tap"
					variants={{
						idle: { scale: 1 },
						hover: { scale: 1 },
						tap: { scale: 0.92 },
					}}
					transition={tweens.interaction}
					className={cn(
						"relative z-10 flex items-center justify-center rounded-(--radius)",
						isThemeHovered
							? "text-surface-950 dark:text-surface-50"
							: "text-surface-400 hover:text-surface-50 dark:text-surface-500 dark:hover:text-surface-950",
						"outline-none transition-colors duration-200",
					)}
					style={{
						width: NAV_BUTTON_SIZE,
						height: NAV_BUTTON_SIZE,
					}}
					aria-label={themeToggleLabel}
				>
					<motion.div
						className="absolute inset-0 -z-10 bg-surface-50 dark:bg-surface-950"
						initial={false}
						animate={{
							opacity: isThemeHovered ? 1 : 0,
							scale: isThemeHovered ? 1 : 0.92,
						}}
						transition={tweens.interaction}
						style={{ borderRadius: "var(--radius)" }}
					/>
					<motion.div
						className="relative flex h-full w-full items-center justify-center"
						variants={{
							hover: { scale: 1.05 },
							tap: { scale: 1 },
						}}
					>
						<Sun
							className="rotate-0 scale-100 transition-transform duration-200 dark:-rotate-90 dark:scale-0"
							style={{ width: NAV_ICON_SIZE, height: NAV_ICON_SIZE }}
							weight="regular"
						/>
						<Moon
							className="absolute rotate-90 scale-0 transition-transform duration-200 dark:rotate-0 dark:scale-100"
							style={{ width: NAV_ICON_SIZE, height: NAV_ICON_SIZE }}
							weight="regular"
						/>
					</motion.div>
					<HoverTooltip
						visible={isThemeHovered}
						offset="mb-[var(--portfolio-overlay-gap)]"
						className="-translate-y-[var(--portfolio-space-tight)]"
					>
						Theme
					</HoverTooltip>
				</motion.button>
			</motion.nav>
		</div>
	);
}
