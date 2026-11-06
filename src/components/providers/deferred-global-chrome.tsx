"use client";

import dynamic from "next/dynamic";

const ReadingProgress = dynamic(
	() => import("@/src/components/ui/reading-progress").then((module) => module.ReadingProgress),
	{
		ssr: false,
	},
);

export function DeferredGlobalChrome() {
	return <ReadingProgress />;
}
