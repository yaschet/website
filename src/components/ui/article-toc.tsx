"use client";

/**
 * ArticleTOC - Premium Sidebar Table of Contents
 *
 * @module article-toc
 * @description
 * A refined sidebar TOC that follows conventions but executes them beautifully.
 * Visible headings, typographic active state, continuous scroll tracking.
 *
 * Design Principles:
 * 1. Visible labels — All sections are readable at a glance
 * 2. Typographic contrast — Active state via font-weight + color
 * 3. Continuous tracking — Uses scroll position, not discrete thresholds
 * 4. Swiss aesthetic — High contrast, no mid-grays, sharp edges
 *
 * Edge Cases Handled:
 * - Reduced motion preference
 * - Dynamic content (images loading after mount)
 * - Mobile (collapsible drawer)
 * - Keyboard navigation
 */

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { List, X } from "@phosphor-icons/react";
import { useCallback, useEffect, useState } from "react";
import { springs } from "@/src/lib/physics";
import { cn } from "@/src/lib/utils";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface HeadingMeta {
	id: string;
	text: string;
	level: number;
	/** Absolute top position from document top */
	offsetTop: number;
}

interface ArticleTOCProps {
	contentSelector?: string;
	className?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function ArticleTOC({ contentSelector = "article", className }: ArticleTOCProps) {
	const [headings, setHeadings] = useState<HeadingMeta[]>([]);
	const [activeIndex, setActiveIndex] = useState(0);
	const [mounted, setMounted] = useState(false);
	const [isVisible, setIsVisible] = useState(false);
	const [isMobileOpen, setIsMobileOpen] = useState(false);

	// Reduced motion preference
	const prefersReducedMotion = useReducedMotion();

	// ─────────────────────────────────────────────────────────────────────────
	// Mount Guard
	// ─────────────────────────────────────────────────────────────────────────

	useEffect(() => {
		setMounted(true);
	}, []);

	// ─────────────────────────────────────────────────────────────────────────
	// Extract Headings with Positions
	// ─────────────────────────────────────────────────────────────────────────

	const calculateHeadingPositions = useCallback(() => {
		if (!mounted) return;

		const content = document.querySelector(contentSelector);
		if (!content) return;

		const headingElements = content.querySelectorAll("h2, h3");
		const extracted: HeadingMeta[] = [];

		headingElements.forEach((heading) => {
			const id = heading.id;
			const text = heading.textContent?.replace(/#$/, "").trim() || "";
			const level = parseInt(heading.tagName.charAt(1), 10);

			if (id && text) {
				const rect = heading.getBoundingClientRect();
				const offsetTop = rect.top + window.scrollY;
				extracted.push({ id, text, level, offsetTop });
			}
		});

		setHeadings(extracted);
	}, [contentSelector, mounted]);

	// Initial calculation + recalculate on resize
	useEffect(() => {
		calculateHeadingPositions();

		const handleResize = () => calculateHeadingPositions();
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, [calculateHeadingPositions]);

	// ─────────────────────────────────────────────────────────────────────────
	// Dynamic Content Handling (images loading, etc.)
	// ─────────────────────────────────────────────────────────────────────────

	useEffect(() => {
		if (!mounted) return;

		// Recalculate after images load (they shift content)
		const images = document.querySelectorAll("article img");
		let loadedCount = 0;
		const totalImages = images.length;

		if (totalImages === 0) return;

		const handleImageLoad = () => {
			loadedCount++;
			if (loadedCount === totalImages) {
				// All images loaded, recalculate positions
				calculateHeadingPositions();
			}
		};

		images.forEach((img) => {
			if ((img as HTMLImageElement).complete) {
				loadedCount++;
			} else {
				img.addEventListener("load", handleImageLoad);
				img.addEventListener("error", handleImageLoad);
			}
		});

		// If all images were already loaded
		if (loadedCount === totalImages) {
			calculateHeadingPositions();
		}

		return () => {
			images.forEach((img) => {
				img.removeEventListener("load", handleImageLoad);
				img.removeEventListener("error", handleImageLoad);
			});
		};
	}, [mounted, calculateHeadingPositions]);

	// ─────────────────────────────────────────────────────────────────────────
	// Continuous Active Section Tracking
	// ─────────────────────────────────────────────────────────────────────────

	useEffect(() => {
		if (!mounted || headings.length === 0) return;

		const handleScroll = () => {
			const currentScrollY = window.scrollY;
			const scrollOffset = currentScrollY + 120; // Account for sticky header

			let newActiveIndex = 0;
			for (let i = headings.length - 1; i >= 0; i--) {
				if (scrollOffset >= headings[i].offsetTop) {
					newActiveIndex = i;
					break;
				}
			}

			setActiveIndex(newActiveIndex);
			setIsVisible(currentScrollY > 200);
		};

		window.addEventListener("scroll", handleScroll, { passive: true });
		handleScroll(); // Initial call

		return () => window.removeEventListener("scroll", handleScroll);
	}, [mounted, headings]);

	// ─────────────────────────────────────────────────────────────────────────
	// Navigate to Heading
	// ─────────────────────────────────────────────────────────────────────────

	const scrollToHeading = (id: string) => {
		const element = document.getElementById(id);
		if (element) {
			const offset = 100;
			const top = element.getBoundingClientRect().top + window.scrollY - offset;
			window.scrollTo({
				top,
				behavior: prefersReducedMotion ? "auto" : "smooth",
			});
			setIsMobileOpen(false);
		}
	};

	// ─────────────────────────────────────────────────────────────────────────
	// Keyboard Navigation
	// ─────────────────────────────────────────────────────────────────────────

	const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
		if (e.key === "ArrowDown" && index < headings.length - 1) {
			e.preventDefault();
			const nextButton = document.querySelector(
				`[data-toc-index="${index + 1}"]`,
			) as HTMLButtonElement;
			nextButton?.focus();
		} else if (e.key === "ArrowUp" && index > 0) {
			e.preventDefault();
			const prevButton = document.querySelector(
				`[data-toc-index="${index - 1}"]`,
			) as HTMLButtonElement;
			prevButton?.focus();
		}
	};

	// ─────────────────────────────────────────────────────────────────────────
	// Animation Variants (respect reduced motion)
	// ─────────────────────────────────────────────────────────────────────────

	const containerVariants = prefersReducedMotion
		? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
		: {
				hidden: { opacity: 0, x: -16 },
				visible: { opacity: 1, x: 0 },
			};

	const mobileVariants = prefersReducedMotion
		? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
		: {
				hidden: { opacity: 0, y: 8 },
				visible: { opacity: 1, y: 0 },
			};

	// ─────────────────────────────────────────────────────────────────────────
	// Render
	// ─────────────────────────────────────────────────────────────────────────

	if (!mounted || headings.length === 0) return null;

	const TOCList = ({ isMobile = false }: { isMobile?: boolean }) => (
		<ul className="flex flex-col" role="list">
			{headings.map(({ id, text, level }, index) => {
				const isActive = index === activeIndex;

				return (
					<li key={id}>
						<button
							type="button"
							data-toc-index={index}
							onClick={() => scrollToHeading(id)}
							onKeyDown={(e) => handleKeyDown(e, index)}
							className={cn(
								"block w-full py-1.5 text-left font-mono text-xs transition-colors duration-150",
								isMobile ? "max-w-full" : "max-w-[180px] truncate",
								level === 3 && "pl-3",
								isActive
									? "font-medium text-surface-950 dark:text-surface-50"
									: "text-surface-400 hover:text-surface-600 dark:text-surface-500 dark:hover:text-surface-300",
							)}
						>
							{text}
						</button>
					</li>
				);
			})}
		</ul>
	);

	return (
		<>
			{/* Desktop TOC */}
			<motion.nav
				initial="hidden"
				animate={isVisible ? "visible" : "hidden"}
				variants={containerVariants}
				transition={prefersReducedMotion ? { duration: 0 } : springs.responsive}
				className={cn(
					"fixed left-8 top-1/2 z-40 hidden -translate-y-1/2 xl:block",
					className,
				)}
				aria-label="Table of contents"
			>
				<div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-surface-400 dark:text-surface-500">
					On this page
				</div>
				<TOCList />
			</motion.nav>

			{/* Mobile TOC Button */}
			<AnimatePresence>
				{isVisible && (
					<motion.button
						type="button"
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.9 }}
						transition={prefersReducedMotion ? { duration: 0 } : springs.snappy}
						onClick={() => setIsMobileOpen(true)}
						className={cn(
							"fixed bottom-6 right-6 z-40 flex size-12 items-center justify-center xl:hidden",
							"border border-surface-200 bg-white dark:border-surface-700 dark:bg-surface-900",
							"shadow-lg",
						)}
						aria-label="Open table of contents"
					>
						<List size={20} weight="bold" />
					</motion.button>
				)}
			</AnimatePresence>

			{/* Mobile TOC Drawer */}
			<AnimatePresence>
				{isMobileOpen && (
					<>
						{/* Backdrop */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
							className="fixed inset-0 z-50 bg-black/50 xl:hidden"
							onClick={() => setIsMobileOpen(false)}
						/>

						{/* Drawer */}
						<motion.nav
							initial="hidden"
							animate="visible"
							exit="hidden"
							variants={mobileVariants}
							transition={prefersReducedMotion ? { duration: 0 } : springs.responsive}
							className={cn(
								"fixed bottom-0 left-0 right-0 z-50 max-h-[70vh] overflow-y-auto xl:hidden",
								"border-t border-surface-200 bg-white p-6 dark:border-surface-700 dark:bg-surface-900",
							)}
							aria-label="Table of contents"
						>
							<div className="mb-4 flex items-center justify-between">
								<span className="font-mono text-xs uppercase tracking-widest text-surface-400 dark:text-surface-500">
									On this page
								</span>
								<button
									type="button"
									onClick={() => setIsMobileOpen(false)}
									className="flex size-8 items-center justify-center text-surface-500 hover:text-surface-900 dark:hover:text-surface-100"
									aria-label="Close"
								>
									<X size={18} weight="bold" />
								</button>
							</div>
							<TOCList isMobile />
						</motion.nav>
					</>
				)}
			</AnimatePresence>
		</>
	);
}

// Re-export for backwards compatibility
export { ArticleTOC as ReadingBracket };
