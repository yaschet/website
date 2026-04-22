"use client";

import { MagnifyingGlassPlus } from "@phosphor-icons/react/dist/ssr/MagnifyingGlassPlus";
import { AnimatePresence, motion } from "framer-motion";
import mermaid from "mermaid";
import { useCallback, useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { cn, springs } from "@/src/lib/index";

/**
 * MermaidDiagram component.
 *
 * Features:
 * - Client-side Mermaid rendering with "Swiss Design" theme
 * - "Expandable Preview" pattern (thumbnails -> lightbox)
 * - Shared Layout Animations via Framer Motion
 * - Responsive SVG scaling
 *
 * @param code - The Mermaid syntax to render
 */
export function MermaidDiagram({ code, className }: { code: string; className?: string }) {
	const layoutId = useId().replace(/:/g, ""); // Clean ID for framer/mermaid
	const [svg, setSvg] = useState<string>("");
	const [error, setError] = useState<string | null>(null);
	const [isOpen, setIsOpen] = useState(false);
	const [mounted, setMounted] = useState(false);

	// Theme configuration for "Modern Swiss" aesthetic
	// Monochromatic, sharp, high contrast
	useEffect(() => {
		mermaid.initialize({
			startOnLoad: false,
			theme: "base",
			themeVariables: {
				fontFamily: "var(--font-sans)",
				fontSize: "14px",
				primaryColor: "#ffffff",
				primaryTextColor: "#09090b", // surface-950
				primaryBorderColor: "#18181b", // surface-900
				lineColor: "#27272a", // surface-800
				secondaryColor: "#f4f4f5", // surface-100
				tertiaryColor: "#ffffff",
				clusterBkg: "#fafafa", // surface-50
				clusterBorder: "#aeaeae", // surface-400
				defaultLinkColor: "#52525b", // surface-600
			},
			securityLevel: "loose",
		});
	}, []);

	// Render the SVG
	useEffect(() => {
		const renderDiagram = async () => {
			if (!code) return;
			try {
				const uniqueId = `mermaid-${layoutId}`;
				// Render to a temporary element first is handled by mermaid.render internally now
				const { svg: renderedSvg } = await mermaid.render(uniqueId, code);
				setSvg(renderedSvg);
				setError(null);
			} catch (_err) {
				setError("Failed to render diagram");
			}
		};

		renderDiagram();
	}, [code, layoutId]);

	useEffect(() => {
		setMounted(true);
	}, []);

	const close = useCallback(() => {
		setIsOpen(false);
		document.body.style.overflow = "";
	}, []);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape" && isOpen) {
				close();
			}
		};

		if (isOpen) {
			document.addEventListener("keydown", handleKeyDown);
			document.body.style.overflow = "hidden";
		}

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
			if (isOpen) {
				document.body.style.overflow = "";
			}
		};
	}, [isOpen, close]);

	if (error) {
		return (
			<div className="my-8 rounded-none border border-destructive/50 bg-destructive/5 p-4 font-mono text-destructive text-sm">
				{error}
				<pre className="mt-2 opacity-50">{code}</pre>
			</div>
		);
	}

	if (!svg) {
		// Loading state
		return (
			<div className="my-8 h-32 w-full animate-pulse border border-surface-200 bg-surface-50 dark:border-surface-800 dark:bg-surface-900" />
		);
	}

	return (
		<>
			<figure className="group relative my-8 w-full">
				<motion.div
					layoutId={layoutId}
					onClick={() => setIsOpen(true)}
					transition={springs.layout}
					className={cn(
						"relative w-full cursor-zoom-in overflow-hidden",
						"border border-surface-200 bg-white p-2 dark:border-surface-800 dark:bg-surface-950",
						"transition-colors duration-300 hover:border-surface-300 dark:hover:border-surface-700",
						className,
					)}
					style={{
						// No fixed aspect ratio for diagrams, let them flow naturally but max height
						maxHeight: "600px",
						overflow: "auto", // Allow scrolling if huge
					}}
				>
					{/* The SVG container */}
					<div
						className="flex size-full items-center justify-center p-4"
						// biome-ignore lint/security/noDangerouslySetInnerHtml: Trusted local SVG
						dangerouslySetInnerHTML={{ __html: svg }}
					/>

					{/* Hover Hint */}
					<div
						className={cn(
							"absolute right-3 bottom-3 z-20",
							"flex items-center gap-1.5 px-2 py-1",
							"border border-surface-200 bg-white/95 dark:border-surface-700 dark:bg-surface-900/95",
							"font-mono text-[10px] text-surface-600 uppercase tracking-widest dark:text-surface-400",
							"opacity-0 transition-opacity duration-200 group-hover:opacity-100",
						)}
					>
						<MagnifyingGlassPlus size={12} weight="bold" />
						<span>Zoom</span>
					</div>
				</motion.div>
				<figcaption className="mt-3 text-center font-mono text-muted-foreground text-xs">
					Architecture Diagram
				</figcaption>
			</figure>

			{/* Lightbox Portal */}
			{mounted &&
				createPortal(
					<AnimatePresence>
						{isOpen && (
							<>
								{/* Backdrop */}
								<motion.div
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
									transition={{ duration: 0.2 }}
									onClick={close}
									className="fixed inset-0 z-[9998] cursor-zoom-out bg-black/98"
									aria-hidden="true"
								/>

								{/* Lightbox Container */}
								<div
									className="fixed inset-0 z-[9999] flex cursor-zoom-out items-center justify-center p-8"
									onClick={close}
									onKeyDown={(e) => e.key === "Escape" && close()}
									role="dialog"
									aria-modal="true"
								>
									<motion.div
										layoutId={layoutId}
										transition={springs.layout}
										className={cn(
											"pointer-events-auto relative flex items-center justify-center overflow-auto",
											// Lightbox theme: White background for diagram legibility in light mode,
											// or dark in dark mode. We stick to the rendered SVG's colors.
											// To ensure visibility, we force a specific background for the card.
											"bg-white dark:bg-surface-950",
											"border border-surface-200 dark:border-surface-800",
											"p-8",
										)}
										style={{
											width: "min(95vw, 1400px)",
											height: "min(95vh, 1000px)",
										}}
									>
										<div
											className="flex size-full items-center justify-center [&>svg]:size-full [&>svg]:max-h-full [&>svg]:max-w-full"
											// biome-ignore lint/security/noDangerouslySetInnerHtml: Trusted local SVG
											dangerouslySetInnerHTML={{ __html: svg }}
										/>
									</motion.div>
								</div>

								{/* Close Hint */}
								<motion.div
									initial={{ opacity: 0 }}
									animate={{ opacity: 0.4 }}
									exit={{ opacity: 0 }}
									transition={{ delay: 0.3 }}
									className="pointer-events-none fixed top-6 right-6 z-[10000] font-mono text-white text-xs uppercase tracking-wider"
								>
									ESC to close
								</motion.div>
							</>
						)}
					</AnimatePresence>,
					document.body,
				)}
		</>
	);
}
