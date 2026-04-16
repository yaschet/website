"use client";

import { motion, useMotionValue, useMotionValueEvent, useScroll } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function ReadingProgress() {
	const pathname = usePathname();
	const { scrollYProgress } = useScroll();
	const progress = useMotionValue(0);
	const [isMounted, setIsMounted] = useState(false);

	useMotionValueEvent(scrollYProgress, "change", (value) => {
		progress.set(value);
	});

	useEffect(() => {
		setIsMounted(true);
	}, []);

	useEffect(() => {
		if (!pathname) return;

		progress.set(0);
		const frameId = window.requestAnimationFrame(() => {
			progress.set(scrollYProgress.get());
		});

		return () => window.cancelAnimationFrame(frameId);
	}, [pathname, progress, scrollYProgress]);

	return (
		<motion.div
			className="fixed top-0 right-0 left-0 z-[100] h-[4px] bg-accent-500 dark:h-[2px]"
			style={{
				scaleX: isMounted ? progress : 0,
				transformOrigin: "0% 50%",
			}}
			aria-hidden="true"
		/>
	);
}
