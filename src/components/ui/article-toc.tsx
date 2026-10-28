"use client";

import { List } from "@phosphor-icons/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/src/components/ui/button";
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/src/components/ui/dialog";
import { cn } from "@/src/lib/index";

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

/** Article navigation with a wide-screen reading rail and a focus-managed contents dialog. */
export function ArticleTOC({ contentSelector = "article", className }: ArticleTOCProps) {
	const [headings, setHeadings] = useState<HeadingMeta[]>([]);
	const [activeIndex, setActiveIndex] = useState(0);
	const [isVisible, setIsVisible] = useState(false);
	const [open, setOpen] = useState(false);
	const destination = useRef<HTMLElement | null>(null);

	useEffect(() => {
		const content = document.querySelector(contentSelector);
		if (!content) return;

		const measure = () => {
			setHeadings(
				Array.from(content.querySelectorAll<HTMLElement>("h2[id], h3[id]"), (heading) => ({
					id: heading.id,
					text: heading.textContent?.trim() ?? "",
					level: Number(heading.tagName[1]),
					offsetTop: heading.getBoundingClientRect().top + window.scrollY,
				})),
			);
		};
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
		const trackSection = () => {
			let index = 0;
			for (let i = headings.length - 1; i >= 0; i--) {
				if (window.scrollY + 120 >= headings[i].offsetTop) {
					index = i;
					break;
				}
			}
			setActiveIndex(index);
			setIsVisible(window.scrollY > 200);
		};
		trackSection();
		window.addEventListener("scroll", trackSection, { passive: true });
		return () => window.removeEventListener("scroll", trackSection);
	}, [headings]);

	const navigate = useCallback((heading: HTMLElement) => {
		window.history.pushState(null, "", `#${encodeURIComponent(heading.id)}`);
		heading.focus({ preventScroll: true });
		heading.scrollIntoView({
			behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
				? "instant"
				: "smooth",
			block: "start",
		});
	}, []);

	if (!headings.length) return null;

	const links = (
		<ol className="portfolio-contents-list">
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
								destination.current = heading;
								setOpen(false);
							} else {
								navigate(heading);
							}
						}}
					>
						{text}
					</a>
				</li>
			))}
		</ol>
	);

	return (
		<>
			{isVisible && (
				<nav className={cn("portfolio-contents-rail", className)} aria-label="On this page">
					<p className="portfolio-kicker mb-3 text-muted-foreground">On this page</p>
					{links}
				</nav>
			)}
			<Dialog open={open} onOpenChange={setOpen}>
				{isVisible && (
					<DialogTrigger
						data-slot="button"
						render={
							<Button
								variant="outlined"
								size="icon-xl"
								color="default"
								className="portfolio-contents-trigger min-[96rem]:hidden"
								aria-label="Open table of contents"
							/>
						}
					>
						<List size={16} />
					</DialogTrigger>
				)}
				<DialogContent
					framed
					finalFocus={() => {
						const heading = destination.current;
						if (!heading) return true;
						destination.current = null;
						// Let the focus scope remove document inertness before focusing the heading.
						queueMicrotask(() => navigate(heading));
						return false;
					}}
				>
					<DialogHeader icon={<List />}>
						<DialogTitle>On this page</DialogTitle>
						<DialogDescription>Jump to a section of this article.</DialogDescription>
					</DialogHeader>
					<DialogBody>
						<nav aria-label="Article sections">{links}</nav>
					</DialogBody>
				</DialogContent>
			</Dialog>
		</>
	);
}

export { ArticleTOC as ReadingBracket };
