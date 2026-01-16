"use client";

import type { Icon } from "@phosphor-icons/react";
import {
	Briefcase,
	FileText,
	House,
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
import { cn } from "@/src/lib/utils";

const springConfig = {
	type: "spring" as const,
	mass: 0.6,
	stiffness: 500,
	damping: 30,
};

const hoverSpring = {
	type: "spring" as const,
	mass: 0.4,
	stiffness: 600,
	damping: 35,
};

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

export function FloatingNav() {
	const pathname = usePathname();
	const { setTheme, resolvedTheme } = useTheme();
	const [mounted, setMounted] = useState(false);
	const [hoveredTab, setHoveredTab] = useState<string | null>(null);
	const themeButtonRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		setMounted(true);
	}, []);

	// Find active item based on pathname
	// We use the item link as the ID
	const activeItem = navItems.find((item) =>
		item.link === "/" ? pathname === "/" : pathname.startsWith(item.link),
	);
	const activeTab = activeItem?.link || "";

	// The slot target is either the hovered tab or the active tab
	// If we are hovering the theme button, the target is "theme-toggle"
	const currentTab = hoveredTab ?? activeTab;

	const toggleTheme = async () => {
		const newTheme = resolvedTheme === "dark" ? "light" : "dark";

		if (resolvedTheme === "dark") {
			document.documentElement.classList.add("transition-bg-dark");
		} else {
			document.documentElement.classList.add("transition-bg-light");
		}

		if (
			!themeButtonRef.current ||
			!(document as any).startViewTransition ||
			window.matchMedia("(prefers-reduced-motion: reduce)").matches
		) {
			setTheme(newTheme);
			document.documentElement.classList.remove("transition-bg-light", "transition-bg-dark");
			return;
		}

		await (document as any).startViewTransition(() => {
			flushSync(() => {
				setTheme(newTheme);
			});
		}).ready;

		const { top, left, width, height } = themeButtonRef.current.getBoundingClientRect();
		const x = left + width / 2;
		const y = top + height / 2;
		const right = window.innerWidth - left;
		const bottom = window.innerHeight - top;
		const maxRadius = Math.hypot(Math.max(left, right), Math.max(top, bottom));

		document.documentElement.animate(
			{
				clipPath: [
					`circle(0px at ${x}px ${y}px)`,
					`circle(${maxRadius}px at ${x}px ${y}px)`,
				],
			},
			{
				duration: 600,
				easing: "cubic-bezier(0.4, 0, 0.2, 1)",
				pseudoElement: "::view-transition-new(root)",
			},
		).onfinish = () => {
			document.documentElement.classList.remove("transition-bg-light", "transition-bg-dark");
		};
	};

	if (!mounted) return null;

	return (
		<div className="fixed top-8 right-0 left-0 z-50 flex items-center justify-center px-6">
			<motion.nav
				initial={{ opacity: 0, y: -20, scale: 0.95 }}
				animate={{ opacity: 1, y: 0, scale: 1 }}
				transition={springConfig}
				className="relative flex items-center gap-1 rounded-full border border-surface-200/80 bg-white/90 p-1.5 shadow-lg shadow-surface-900/5 backdrop-blur-xl dark:border-surface-800/80 dark:bg-surface-950/90 dark:shadow-surface-950/50"
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
										"relative flex items-center justify-center rounded-full transition-colors duration-200",
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
											className="absolute inset-0 -z-10 rounded-full bg-surface-100 dark:bg-surface-800"
											transition={hoverSpring}
										/>
									)}
									<motion.div
										whileHover={{ scale: 1.1 }}
										whileTap={{ scale: 0.9 }}
										transition={hoverSpring}
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
											initial={{ opacity: 0, y: 4, scale: 0.95 }}
											animate={{ opacity: 1, y: 0, scale: 1 }}
											exit={{ opacity: 0, y: 4, scale: 0.95 }}
											transition={{ duration: 0.15, ease: "easeOut" }}
											className="pointer-events-none absolute top-full left-1/2 z-20 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md border border-surface-200 bg-white px-2 py-1 font-medium text-surface-700 text-xs shadow-sm dark:border-surface-800 dark:bg-surface-900 dark:text-surface-300"
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
					className="mx-0.5 h-6 w-px bg-surface-200 dark:bg-surface-700"
					aria-hidden="true"
				/>

				<motion.button
					ref={themeButtonRef}
					onMouseEnter={() => setHoveredTab("theme-toggle")}
					onClick={toggleTheme}
					whileHover={{ scale: 1.1 }}
					whileTap={{ scale: 0.9 }}
					transition={hoverSpring}
					className={cn(
						"relative z-10 flex items-center justify-center rounded-full",
						"text-surface-500 dark:text-surface-400",
						"hover:text-surface-900 dark:hover:text-surface-50",
						"transition-colors duration-200",
						"outline-none focus-visible:ring-2 focus-visible:ring-surface-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-surface-950",
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
							className="absolute inset-0 -z-10 rounded-full bg-surface-100 dark:bg-surface-800"
							transition={hoverSpring}
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
