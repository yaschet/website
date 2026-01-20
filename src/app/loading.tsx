"use client";

import { Spinner } from "@/src/components/ui/spinner";

export default function Loading() {
	return (
		<div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-surface-50 dark:bg-surface-950">
			<div className="relative z-10 p-4">
				<Spinner />
			</div>
		</div>
	);
}
