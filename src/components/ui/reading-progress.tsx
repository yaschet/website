"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

function measureScrollProgress() {
	const root = document.documentElement;
	const maxScroll = Math.max(root.scrollHeight - window.innerHeight, 0);

	if (maxScroll <= 0) return 0;

	return Math.min(1, Math.max(0, window.scrollY / maxScroll));
}

export function ReadingProgress() {
	const pathname = usePathname();
	const [progress, setProgress] = useState(0);

	useEffect(() => {
		if (typeof window === "undefined") return;

		const sync = () => {
			setProgress(measureScrollProgress());
		};

		sync();
		window.addEventListener("scroll", sync, { passive: true });
		window.addEventListener("resize", sync, { passive: true });

		return () => {
			window.removeEventListener("scroll", sync);
			window.removeEventListener("resize", sync);
		};
	}, []);

	useEffect(() => {
		if (typeof window === "undefined") return;
		if (!pathname) return;

		setProgress(0);
		const frameId = window.requestAnimationFrame(() => {
			setProgress(measureScrollProgress());
		});

		return () => window.cancelAnimationFrame(frameId);
	}, [pathname]);

	return (
		<div aria-hidden="true" className="fixed inset-x-0 top-0 z-[100] h-[4px] dark:h-[2px]">
			<div
				className="h-full bg-accent-500 transition-[width] duration-150 ease-out"
				style={{ width: `${progress * 100}%` }}
			/>
		</div>
	);
}
