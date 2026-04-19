"use client";

import dynamic from "next/dynamic";

const FloatingNav = dynamic(
	() => import("@/src/components/layout/floating-nav").then((module) => module.FloatingNav),
	{
		ssr: false,
	},
);

const ReadingProgress = dynamic(
	() => import("@/src/components/ui/reading-progress").then((module) => module.ReadingProgress),
	{
		ssr: false,
	},
);

export function DeferredGlobalChrome() {
	return (
		<>
			<ReadingProgress />
			<FloatingNav />
		</>
	);
}
