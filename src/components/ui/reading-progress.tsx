"use client";

import { motion, useScroll } from "framer-motion";

export function ReadingProgress() {
	const { scrollYProgress } = useScroll();

	return (
		<motion.div
			className="fixed top-0 left-0 right-0 z-[100] h-[4px] dark:h-[2px] origin-left bg-accent-500"
			style={{ scaleX: scrollYProgress }}
			aria-hidden="true"
		/>
	);
}
