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
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useReveal } from "@/src/components/providers/reveal-provider";
import { cn, springs } from "@/src/lib/index";

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

type NavItem = {
	name: string;
	link: string;
	icon: React.ElementType;
};

const navItems: NavItem[] = [
	{ name: "Home", link: "/", icon: House },
	{ name: "About", link: "/about", icon: User },
	{ name: "Projects", link: "/projects", icon: Briefcase }, // Rename "Work" -> "Projects" to match URL
	{ name: "Blog", link: "/blog", icon: FileText },
	{ name: "Contact", link: "/contact", icon: ChatCenteredText },
];

const BUTTON_SIZE = 40;
const ICON_SIZE = 18;

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * FloatingNav - Main navigation.
 */
export function FloatingNav() {
	const pathname = usePathname();
	const { setTheme, resolvedTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	// Separate hover state from active state to avoid conflict
	const [hoveredTab, setHoveredTab] = useState<string | null>(null);
	// OPTIMISTIC UI: Track active tab locally to support instant click feedback
	const [optimisticTab, setOptimisticTab] = useState<string | null>(null);

	const themeButtonRef = useRef<HTMLButtonElement>(null);

	const { phase } = useReveal();

	useEffect(() => {
		setMounted(true);
	}, []);

	// Sync optimistic state with actual pathname when it changes (correction)
	useEffect(() => {
		const activeItem = navItems.find((item) =>
			item.link === "/" ? pathname === "/" : pathname.startsWith(item.link),
		);
		setOptimisticTab(activeItem?.link || "");
	}, [pathname]);

	if (!mounted) return null;

	const isEnabled = phase >= 1;

	// Visual Priority: Hover > Optimistic Click > Actual Pathname
	const currentTab = hoveredTab ?? optimisticTab;

	/**
	 * Toggles the theme with a view transition.
	 */
	const toggleTheme = async () => {
		const newTheme = resolvedTheme === "dark" ? "light" : "dark";

		if (
			!(document as Document & { startViewTransition?: unknown }).startViewTransition ||
			window.matchMedia("(prefers-reduced-motion: reduce)").matches
		) {
			setTheme(newTheme);
			return;
		}

		await (
			document as Document & {
				startViewTransition: (cb: () => void) => { ready: Promise<void> };
			}
		).startViewTransition(() => {
			flushSync(() => {
				setTheme(newTheme);
			});
		}).ready;

		const animation = document.documentElement.animate(
			{
				clipPath: ["inset(0 0 100% 0)", "inset(0 0 0 0)"],
			},
			{
				duration: 550,
				easing: "cubic-bezier(0.19, 1, 0.22, 1)",
				pseudoElement: "::view-transition-new(root)",
			},
		);

		animation.onfinish = () => {
			document.documentElement.classList.remove(
				"transition-bg-light",
				"transition-bg-dark",
				"view-transition-active",
			);
		};
	};

	return (
		<div className="pointer-events-none fixed top-6 right-0 left-0 z-50 flex items-center justify-center px-6">
			<motion.nav
				initial={{ y: -20, opacity: 0 }}
				animate={isEnabled ? { y: 0, opacity: 1 } : { y: -20, opacity: 0 }}
				transition={springs.responsive}
				className={cn(
					"pointer-events-auto relative flex items-center p-1.5",
					// SWISS DESIGN: Solid, High Contrast, No Blur
					"bg-surface-0 dark:bg-surface-950",
					"border border-surface-200 dark:border-surface-800",
					// Enforce 0px radius
					"rounded-[var(--radius)]",
					// SHADOW: Allowed here for "Floating" context, but kept tight
					"shadow-sm",
				)}
				style={{
					willChange: "transform",
					contain: "layout style",
				}}
				role="navigation"
				aria-label="Main navigation"
				onMouseLeave={() => setHoveredTab(null)}
			>
				<ul className="relative flex items-center">
					{navItems.map((item) => {
						const isActive = item.link === optimisticTab; // Logical state (for Icon weight)
						const isVisuallyActive = currentTab === item.link; // Visual state (for Colors)
						const Icon = item.icon;

						return (
							<li key={item.link} className="relative z-0">
								<Link
									href={item.link}
									onClick={() => setOptimisticTab(item.link)} // Optimistic update
									className={cn(
										"relative flex items-center justify-center transition-colors duration-200",
										"rounded-[var(--radius)]",
										// Invert text color when pill is behind item
										isVisuallyActive
											? "text-surface-50 dark:text-surface-950" // High Contrast
											: "text-surface-500 hover:text-surface-900 dark:text-surface-400 dark:hover:text-surface-50", // Muted -> Hover
									)}
									style={{
										width: BUTTON_SIZE,
										height: BUTTON_SIZE,
									}}
									onMouseEnter={() => setHoveredTab(item.link)}
									aria-current={isActive ? "page" : undefined}
								>
									{/* Animation Container: Handles scale effects independently of Link routing */}
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
												className="absolute inset-0 -z-10 bg-surface-900 dark:bg-surface-50"
												transition={springs.snappy}
												style={{ borderRadius: "var(--radius)" }}
												// React to parent tap
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

								<AnimatePresence>
									{currentTab === item.link && hoveredTab === item.link && (
										<motion.div
											initial={{ opacity: 0, y: 8, scale: 0.95 }}
											animate={{ opacity: 1, y: 0, scale: 1 }}
											exit={{ opacity: 0, y: 4, scale: 0.98 }}
											transition={springs.snappy}
											className={cn(
												"pointer-events-none absolute top-full left-1/2 z-20 mt-3 -translate-x-1/2 whitespace-nowrap",
												"px-2.5 py-1.5 font-medium text-xs tracking-wide",
												"bg-surface-950 text-surface-50", // Inverse tooltip
												"dark:bg-surface-50 dark:text-surface-950",
												"rounded-none",
												"shadow-xl",
											)}
										>
											{item.name}
										</motion.div>
									)}
								</AnimatePresence>
							</li>
						);
					})}
				</ul>

				<div
					className="mx-1 h-5 w-px bg-surface-200 dark:bg-surface-800"
					aria-hidden="true"
				/>

				<motion.button
					ref={themeButtonRef}
					onMouseEnter={() => setHoveredTab("theme-toggle")}
					onClick={toggleTheme}
					// INTERACTION: Match Link Physics
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
						"relative z-10 flex items-center justify-center rounded-[var(--radius)]",
						// COLOR SYNC: Theme Button
						currentTab === "theme-toggle"
							? "text-surface-50 dark:text-surface-950" // INVERTED
							: "text-surface-500 hover:text-surface-900 dark:text-surface-400 dark:hover:text-surface-50",
						"outline-none transition-colors duration-200",
					)}
					style={{
						width: BUTTON_SIZE,
						height: BUTTON_SIZE,
					}}
					aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
				>
					{currentTab === "theme-toggle" && (
						<motion.div
							layoutId="nav-bg"
							className="absolute inset-0 -z-10 bg-surface-900 dark:bg-surface-50"
							transition={springs.snappy}
							style={{ borderRadius: "var(--radius)" }}
							variants={{
								tap: {
									scale: 0.95,
								},
							}}
						/>
					)}
					{/* FIX: Add relative/flex container for absolute icon positioning */}
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
				</motion.button>
			</motion.nav>
		</div>
	);
}
