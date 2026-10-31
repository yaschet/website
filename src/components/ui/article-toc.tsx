"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { RiCloseLine, RiListCheck2 } from "@remixicon/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/src/lib/index";
import styles from "./article-toc.module.css";

interface HeadingMeta {
	id: string;
	text: string;
	level: number;
	offsetTop: number;
}
interface ArticleTOCProps {
	contentSelector?: string;
	className?: string;
}

/** Quiet reading rail on wide screens and an accessible contents sheet on smaller screens. */
export function ArticleTOC({ contentSelector = "article", className }: ArticleTOCProps) {
	const [headings, setHeadings] = useState<HeadingMeta[]>([]);
	const [activeIndex, setActiveIndex] = useState(0);
	const [visible, setVisible] = useState(false);
	const [open, setOpen] = useState(false);
	const [instant, setInstant] = useState(false);
	const destination = useRef<{ heading: HTMLElement; instant: boolean } | null>(null);

	useEffect(() => {
		const content = document.querySelector(contentSelector);
		if (!content) return;
		const measure = () =>
			setHeadings(
				Array.from(content.querySelectorAll<HTMLElement>("h2[id], h3[id]"), (heading) => ({
					id: heading.id,
					text: heading.textContent?.trim() ?? "",
					level: Number(heading.tagName[1]),
					offsetTop: heading.getBoundingClientRect().top + window.scrollY,
				})),
			);
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(content);
		window.addEventListener("resize", measure);
		return () => {
			observer.disconnect();
			window.removeEventListener("resize", measure);
		};
	}, [contentSelector]);

	useEffect(() => {
		const track = () => {
			let index = 0;
			for (let i = headings.length - 1; i >= 0; i--) {
				if (window.scrollY + 140 >= headings[i].offsetTop) {
					index = i;
					break;
				}
			}
			setActiveIndex(index);
			setVisible(window.scrollY > 200);
		};
		track();
		window.addEventListener("scroll", track, { passive: true });
		return () => window.removeEventListener("scroll", track);
	}, [headings]);

	const navigate = useCallback((heading: HTMLElement, keyboard = false) => {
		const hash = `#${encodeURIComponent(heading.id)}`;
		if (window.location.hash !== hash) window.history.pushState(null, "", hash);
		if (!heading.hasAttribute("tabindex")) heading.tabIndex = -1;
		heading.focus({ preventScroll: true });
		heading.scrollIntoView({
			behavior:
				keyboard || window.matchMedia("(prefers-reduced-motion: reduce)").matches
					? "instant"
					: "smooth",
			block: "start",
		});
	}, []);

	if (!headings.length) return null;
	const links = (
		<ol className={styles.list}>
			{headings.map(({ id, text, level }, index) => (
				<li key={id}>
					<a
						href={`#${id}`}
						aria-current={index === activeIndex ? "location" : undefined}
						data-level={level}
						onClick={(event) => {
							if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
								return;
							const heading = document.getElementById(id);
							if (!heading) return;
							event.preventDefault();
							if (open) {
								destination.current = { heading, instant: event.detail === 0 };
								setInstant(event.detail === 0);
								setOpen(false);
							} else navigate(heading, event.detail === 0);
						}}
					>
						<span className={styles.number} aria-hidden="true">
							{String(index + 1).padStart(2, "0")}
						</span>
						<span>{text}</span>
					</a>
				</li>
			))}
		</ol>
	);
	return (
		<>
			<nav
				className={cn(styles.rail, className)}
				aria-label="On this page"
				data-visible={visible}
				aria-hidden={!visible}
				inert={!visible}
			>
				<p className={styles.label}>
					On this page{" "}
					<span>
						{String(activeIndex + 1).padStart(2, "0")} /{" "}
						{String(headings.length).padStart(2, "0")}
					</span>
				</p>
				{links}
			</nav>
			<Dialog.Root open={open} onOpenChange={setOpen}>
				<Dialog.Trigger
					className={styles.trigger}
					data-visible={visible}
					inert={!visible}
					tabIndex={visible ? 0 : -1}
					aria-label="Open table of contents"
					onClick={(event) => setInstant(event.detail === 0)}
				>
					<RiListCheck2 size={18} />
					<span>Contents</span>
					<span className={styles.triggerCount}>
						{String(activeIndex + 1).padStart(2, "0")} /{" "}
						{String(headings.length).padStart(2, "0")}
					</span>
				</Dialog.Trigger>
				<Dialog.Portal>
					<Dialog.Overlay className={styles.overlay} data-instant={instant} />
					<Dialog.Content
						className={styles.sheet}
						data-instant={instant}
						onEscapeKeyDown={() => setInstant(true)}
						onCloseAutoFocus={(event) => {
							const target = destination.current;
							if (!target) return;
							event.preventDefault();
							destination.current = null;
							queueMicrotask(() => navigate(target.heading, target.instant));
						}}
					>
						<div className={styles.sheetHeader}>
							<Dialog.Title className={styles.sheetTitle}>On this page</Dialog.Title>
							<Dialog.Close
								className={styles.close}
								aria-label="Close table of contents"
								onClick={(event) => setInstant(event.detail === 0)}
							>
								<RiCloseLine size={20} />
							</Dialog.Close>
						</div>
						<Dialog.Description className="sr-only">
							Choose a section to continue reading.
						</Dialog.Description>
						<nav aria-label="Article sections">{links}</nav>
					</Dialog.Content>
				</Dialog.Portal>
			</Dialog.Root>
		</>
	);
}

export { ArticleTOC as ReadingBracket };
