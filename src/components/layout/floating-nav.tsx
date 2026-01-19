/**
 * FloatingNav component.
 *
 * @remarks
 * Fixed-position navigation bar.
 *
 * @example
 * ```tsx
 * <FloatingNav />
 * ```
 *
 * @public
 */

"use client";

import {
	Briefcase,
	ChatCenteredText,
	FileText,
	House,
	type Icon,
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
	{ name: "Work", link: "/projects", icon: Briefcase },
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
	const [hoveredTab, setHoveredTab] = useState<string | null>(null);
	const themeButtonRef = useRef<HTMLButtonElement>(null);

	const { phase } = useReveal();

	useEffect(() => {
		setMounted(true);
	}, []);

	// Block rendering until mounted to prevent hydration mismatch (theme-related)
	if (!mounted) return null;

	const isEnabled = phase >= 1;

	// Determine active state based on route matching
	const activeItem = navItems.find((item) =>
		item.link === "/" ? pathname === "/" : pathname.startsWith(item.link),
	);
	const activeTab = activeItem?.link || "";

	// Hover-first priority for the sliding indicator
	const currentTab = hoveredTab ?? activeTab;

	/**
	 * Toggles the theme with a view transition.
	 */
	const toggleTheme = async () => {
		const newTheme = resolvedTheme === "dark" ? "light" : "dark";

		// Fallback for no View Transitions
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
		<div className="pointer-events-none fixed top-8 right-0 left-0 z-50 flex items-center justify-center px-6">
			<motion.nav
				initial={{ opacity: 0, y: -20, scale: 0.98 }}
				animate={
					isEnabled ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: -20, scale: 0.98 }
				}
				transition={springs.responsive}
				className={cn(
					"pointer-events-auto relative flex items-center gap-1 p-1.5",
					// OPTIMIZATION: Removed blur for 240Hz performance (Swiss Design: Opacity > Blur)
					"bg-white/95 dark:bg-surface-950/95",
					"border border-surface-200/80 dark:border-surface-800/80",
					"rounded-[var(--radius)]",
				)}
				style={{
					// PERF: GPU Layer Promotion + Layout Isolation
					willChange: "transform",
					contain: "layout style",
					boxShadow: [
						"0 1px 2px rgba(0, 0, 0, 0.04)",
						"0 4px 8px -2px rgba(0, 0, 0, 0.06)",
						"0 12px 24px -4px rgba(0, 0, 0, 0.08)",
					].join(", "),
				}}
				role="navigation"
				aria-label="Main navigation"
				onMouseLeave={() => setHoveredTab(null)}
			>
				<ul className="relative flex items-center gap-1">
					{navItems.map((item) => {
						const isActive = item.link === activeTab;
						const isHovered = item.link === hoveredTab;
						const Icon = item.icon;

						return (
							<li key={item.link} className="relative">
								<Link
									href={item.link}
									className={cn(
										"relative flex items-center justify-center transition-colors duration-200",
										"rounded-[var(--radius)]",
										isActive
											? "text-surface-900 dark:text-surface-50"
											: "text-surface-500 dark:text-surface-400",
										"hover:text-surface-900 dark:hover:text-surface-50",
									)}
									style={{
										width: BUTTON_SIZE,
										height: BUTTON_SIZE,
									}}
									onMouseEnter={() => setHoveredTab(item.link)}
									aria-current={isActive ? "page" : undefined}
								>
									{currentTab === item.link && (
										<motion.div
											layoutId="nav-slot"
											className="absolute inset-0 -z-10 rounded-[var(--radius)] bg-surface-100 dark:bg-surface-800"
											transition={springs.layout}
										/>
									)}
									<motion.div
										whileHover={{ scale: 1.1 }}
										whileTap={{ scale: 0.9 }}
										transition={springs.snappy}
									>
										<Icon
											className="shrink-0"
											style={{ width: ICON_SIZE, height: ICON_SIZE }}
											weight="duotone"
										/>
									</motion.div>
								</Link>

								<AnimatePresence>
									{isHovered && (
										<motion.div
											initial={{ opacity: 0, y: 4, scale: 0.98 }}
											animate={{ opacity: 1, y: 0, scale: 1 }}
											exit={{ opacity: 0, y: 4, scale: 0.98 }}
											transition={{ duration: 0.15, ease: "easeOut" }}
											className={cn(
												"pointer-events-none absolute top-full left-1/2 z-20 mt-3 -translate-x-1/2 whitespace-nowrap",
												"px-2 py-1.5 font-bold text-xs",
												"bg-white dark:bg-surface-900",
												"text-surface-700 dark:text-surface-300",
												"border border-surface-200 dark:border-surface-800",
												"rounded-none shadow-md", // Absolute zero for tooltips
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
					className="mx-1 h-6 w-px bg-surface-200 dark:bg-surface-800"
					aria-hidden="true"
				/>

				<motion.button
					ref={themeButtonRef}
					onMouseEnter={() => setHoveredTab("theme-toggle")}
					onClick={toggleTheme}
					whileHover={{ scale: 1.1 }}
					whileTap={{ scale: 0.9 }}
					transition={springs.snappy}
					className={cn(
						"relative z-10 flex items-center justify-center rounded-[var(--radius)]",
						"text-surface-500 dark:text-surface-400",
						"hover:text-surface-900 dark:hover:text-surface-50",
						"outline-none transition-colors duration-200",
						"focus-visible:ring-2 focus-visible:ring-surface-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-surface-950",
					)}
					style={{
						width: BUTTON_SIZE,
						height: BUTTON_SIZE,
					}}
					aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
				>
					{currentTab === "theme-toggle" && (
						<motion.div
							layoutId="nav-slot"
							className="absolute inset-0 -z-10 rounded-[var(--radius)] bg-surface-100 dark:bg-surface-800"
							transition={springs.layout}
						/>
					)}
					<Sun
						className="rotate-0 scale-100 transition-transform duration-300 dark:-rotate-90 dark:scale-0"
						style={{ width: ICON_SIZE, height: ICON_SIZE }}
						weight="duotone"
					/>
					<Moon
						className="absolute rotate-90 scale-0 transition-transform duration-300 dark:rotate-0 dark:scale-100"
						style={{ width: ICON_SIZE, height: ICON_SIZE }}
						weight="duotone"
					/>
				</motion.button>
			</motion.nav>
		</div>
	);
}
