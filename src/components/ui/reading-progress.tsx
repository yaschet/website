"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

function measureScrollProgress() {
	const root = document.documentElement;
	const maxScroll = Math.max(root.scrollHeight - window.innerHeight, 0);

	if (maxScroll <= 0) return 0;

	return Math.min(1, Math.max(0, window.scrollY / maxScroll));
}

export function ReadingProgress() {
	const pathname = usePathname();
	const bar = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!pathname) return;
		let frame = 0;
		const sync = () => {
			frame = 0;
			if (bar.current) bar.current.style.transform = `scaleX(${measureScrollProgress()})`;
		};
		const schedule = () => {
			if (!frame) frame = window.requestAnimationFrame(sync);
		};
		const observer = new ResizeObserver(schedule);
		observer.observe(document.body);
		schedule();
		window.addEventListener("scroll", schedule, { passive: true });
		window.addEventListener("resize", schedule, { passive: true });

		return () => {
			window.cancelAnimationFrame(frame);
			observer.disconnect();
			window.removeEventListener("scroll", schedule);
			window.removeEventListener("resize", schedule);
		};
	}, [pathname]);

	return (
		<div aria-hidden="true" className="fixed inset-x-0 top-0 z-[100] h-0.5">
			<div
				ref={bar}
				data-slot="reading-progress"
				className="h-full origin-left bg-foreground"
				style={{ transform: "scaleX(0)" }}
			/>
		</div>
	);
}
