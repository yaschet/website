/**
 * FloatingNav component.
 *
 * @remarks
 * "Interaction Engineered" navigation bar.
 * features:
 * - Unified Physics Object (Whole button squish)
 * - Contiguous Hit Zones (Zero gaps)
 * - Optimistic State
 * - High-Contrast Swiss Design
 *
 * @public
 */

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
import type { ComponentType, CSSProperties, ReactElement, MouseEvent } from "react";
import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { useReveal } from "@/src/components/providers/reveal-provider";
import { HoverTooltip } from "@/src/components/ui/hover-tooltip";
import { cn, springs } from "@/src/lib/index";

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

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

const BUTTON_SIZE = 40;
const ICON_SIZE = 20;

function getActiveTab(pathname: string): string {
	const activeItem = navItems.find((item) =>
		item.link === "/" ? pathname === "/" : pathname.startsWith(item.link),
	);

	return activeItem?.link ?? "";
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * FloatingNav - Main navigation.
 */
export function FloatingNav() {
	const pathname = usePathname();
	const { setTheme, resolvedTheme } = useTheme();
	const activeTab = getActiveTab(pathname);

	const [isMounted, setIsMounted] = useState(false);
	const [hoveredTab, setHoveredTab] = useState<string | null>(null);
	const [isThemeHovered, setIsThemeHovered] = useState(false);
	const [optimisticTab, setOptimisticTab] = useState(activeTab);

	const { phase } = useReveal();

	useEffect(() => {
		setIsMounted(true);
	}, []);

	useEffect(() => {
		setOptimisticTab(activeTab);
	}, [activeTab]);

	const isEnabled = phase >= 1;
	const currentTab = hoveredTab ?? optimisticTab;
	const themeToggleLabel =
		isMounted && resolvedTheme
			? `Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`
			: "Toggle theme";

	/**
	 * Toggles the theme with an instant, restrained view transition.
	 */
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
				// Trigger the transition acknowledgment in the topographic field synchronously with DOM swap
				window.dispatchEvent(new CustomEvent("theme-toggled"));
			});
		});
	};

	return (
		<div className="pointer-events-none fixed right-0 bottom-0 left-0 z-50 flex h-[var(--portfolio-nav-clearance)] items-center justify-center px-5">
			<motion.nav
				initial={{ y: 20, opacity: 0 }}
				animate={isEnabled ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
				transition={springs.responsive}
				className={cn(
					"pointer-events-auto relative flex items-center p-2.5",
					// SWISS DESIGN: Solid, High Contrast, No Blur
					"bg-surface-950 dark:bg-surface-50",
					"border border-surface-800 dark:border-surface-200",
					// Enforce 0px radius
					"rounded-(--radius)",
					// SHADOW: Allowed here for "Floating" context, but kept tight
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
									onClick={() => setOptimisticTab(item.link)} // Optimistic update
									className={cn(
										"relative flex items-center justify-center transition-colors duration-200",
										"rounded-(--radius)",
										// Invert text color when pill is behind item
										isVisuallyActive
											? "text-surface-950 dark:text-surface-50" // High Contrast (Black on White Pill, White on Black Pill)
											: "text-surface-400 hover:text-surface-50 dark:text-surface-500 dark:hover:text-surface-950", // Muted -> Hover
									)}
									style={{
										width: BUTTON_SIZE,
										height: BUTTON_SIZE,
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
										transition={springs.snappy}
									>
										{currentTab === item.link && (
											<motion.div
												layoutId="nav-bg"
												className="absolute inset-0 -z-10 bg-surface-50 dark:bg-surface-950"
												transition={springs.snappy}
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
												style={{ width: ICON_SIZE, height: ICON_SIZE }}
												weight={isActive ? "bold" : "regular"} // Visual state change
											/>
										</motion.div>
									</motion.div>
								</Link>

								<HoverTooltip
									visible={currentTab === item.link && hoveredTab === item.link}
									className="bottom-[calc(100%+15px)] mb-0"
								>
									{item.name}
								</HoverTooltip>
							</li>
						);
					})}
				</ul>

				<div
					className="mx-2 my-1 w-px shrink-0 self-stretch bg-surface-800 dark:bg-surface-200"
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
					transition={springs.snappy}
					className={cn(
						"relative z-10 flex items-center justify-center rounded-(--radius)",
						isThemeHovered
							? "text-surface-950 dark:text-surface-50" // INVERTED
							: "text-surface-400 hover:text-surface-50 dark:text-surface-500 dark:hover:text-surface-950",
						"outline-none transition-colors duration-200",
					)}
					style={{
						width: BUTTON_SIZE,
						height: BUTTON_SIZE,
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
						transition={springs.snappy}
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
							className="rotate-0 scale-100 transition-transform duration-300 dark:-rotate-90 dark:scale-0"
							style={{ width: ICON_SIZE, height: ICON_SIZE }}
							weight="regular"
						/>
						<Moon
							className="absolute rotate-90 scale-0 transition-transform duration-300 dark:rotate-0 dark:scale-100"
							style={{ width: ICON_SIZE, height: ICON_SIZE }}
							weight="regular"
						/>
					</motion.div>
					<HoverTooltip
						visible={isThemeHovered}
						className="bottom-[calc(100%+15px)] mb-0"
					>
						Theme
					</HoverTooltip>
				</motion.button>
			</motion.nav>
		</div>
	);
}
