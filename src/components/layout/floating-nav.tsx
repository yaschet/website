/**
 * FloatingNav Component
 *
 * A responsive navigation bar that floats above content.
 * Features a sliding active indicator and smooth theme transitions.
 */

"use client";

import {
	Briefcase,
	FileText,
	House,
	type Icon,
	Image as ImageIcon,
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
import { springs } from "@/src/lib/physics";
import { cn } from "@/src/lib/utils";

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

type NavItem = {
	name: string;
	link: string;
	icon: Icon;
};

const navItems: NavItem[] = [
	{ name: "Home", link: "/", icon: House },
	{ name: "About", link: "/about", icon: User },
	{ name: "Work", link: "/projects", icon: Briefcase },
	{ name: "Blog", link: "/blog", icon: FileText },
	{ name: "Gallery", link: "/gallery", icon: ImageIcon },
];

const BUTTON_SIZE = 40;
const ICON_SIZE = 18;

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * FloatingNav - The primary interaction dock of the platform.
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
	 * Swiss-precision theme transition.
	 * Uses a horizontal wipe (inset clip-path) — geometric, sharp, controlled.
	 * Adds a guard class to prevent Swiss Grid recalculations during transition.
	 */
	const toggleTheme = async () => {
		// 1. IMPROVED GUARD: Add this IMMEDIATELY to block any Swiss Grid updates
		document.documentElement.classList.add("view-transition-active");

		const newTheme = resolvedTheme === "dark" ? "light" : "dark";

		// Temporary classes for background synchronization during transition
		const transitionClass = `transition-bg-${resolvedTheme === "light" ? "dark" : "light"}`;
		document.documentElement.classList.add(transitionClass);

		// Fallback: no View Transitions API or reduced motion
		if (
			!(document as Document & { startViewTransition?: unknown }).startViewTransition ||
			window.matchMedia("(prefers-reduced-motion: reduce)").matches
		) {
			setTheme(newTheme);
			document.documentElement.classList.remove(
				"transition-bg-light",
				"transition-bg-dark",
				"view-transition-active", // Valid cleanup
			);
			return;
		}

		// (Guard was already added at step 1)

		await (
			document as Document & {
				startViewTransition: (cb: () => void) => { ready: Promise<void> };
			}
		).startViewTransition(() => {
			flushSync(() => {
				setTheme(newTheme);
			});
		}).ready;

		// "The Gravity Shutter" — Legendary Engineering
		// 1. Direction: Top-to-Bottom. Why? The Nav is at the top. The interaction source is above.
		//    Gravity dictates the change flows DOWN from the source. It washes over the page.
		// 2. Physics: Heavy, industrial damping. Not a spring, but a hydraulic piston.
		// 3. Timing: 550ms. The Golden Mean.
		//    650ms felt slightly "draggy" at the tail end of the expo curve.
		//    550ms retains the mass but respects the user's time. Efficient Luxury.
		const animation = document.documentElement.animate(
			{
				clipPath: [
					"inset(0 0 100% 0)", // Hidden (clipped from bottom, causing top-down reveal)
					"inset(0 0 0 0)", // Fully revealed
				],
			},
			{
				duration: 550, // The perfect balance of Weight vs. Snap.
				// Ease Out Expo: Starts with authority, settles with extreme precision (friction).
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
					"bg-white/90 backdrop-blur-xl dark:bg-surface-950/90",
					"border border-surface-200/80 dark:border-surface-800/80",
					// Architecture of the Blade: Absolute 0px Default
					"rounded-[var(--radius)]",
				)}
				style={{
					// Premium layered shadow — realistic levitation
					// Layer 1: Ambient diffuse (large, soft, far)
					// Layer 2: Direct shadow (medium, slightly offset)
					// Layer 3: Contact shadow (tight, close to element)
					boxShadow: [
						"0 1px 2px rgba(0, 0, 0, 0.04)", // Contact shadow
						"0 4px 8px -2px rgba(0, 0, 0, 0.06)", // Direct shadow
						"0 12px 24px -4px rgba(0, 0, 0, 0.08)", // Ambient diffuse
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
									{/* The Sliding Mechanical Block */}
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

								{/* Sharp Geometric Tooltip */}
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

				{/* Vertical Separator - Machined Line */}
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
