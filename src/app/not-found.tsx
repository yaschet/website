"use client";

import { ArrowLeft } from "@phosphor-icons/react";
import Link from "next/link";
import { SiteHeader } from "@/src/components/layout/site-header";
import { Button } from "@/src/components/ui/button";
import { Reveal } from "@/src/components/ui/reveal";
import { SwissGridProvider, SwissGridSection } from "@/src/components/ui/swiss-grid-canvas";

export default function NotFound() {
	return (
		<SwissGridProvider>
			<div className="relative flex min-h-screen w-full flex-col bg-surface-50 text-surface-900 dark:bg-surface-950 dark:text-surface-50">
				{/* 1. HEADER (Context Badges) */}
				<SiteHeader />

				{/* 2. CONTENT CELL */}
				<SwissGridSection
					id="404-content"
					className="relative z-10 mx-auto w-full max-w-3xl"
				>
					<div className="flex flex-col items-center justify-center px-6 py-24 text-center sm:px-8">
						{/* Badge */}
						<Reveal phase={1}>
							<div className="mb-8 inline-flex items-center gap-2 border border-surface-200 bg-surface-50/50 px-3 py-1 font-mono text-surface-500 text-xs uppercase tracking-widest backdrop-blur-sm dark:border-surface-800 dark:bg-surface-900/50 dark:text-surface-400">
								<span className="size-1.5 rounded-full bg-red-500" />
								<span>Signal Lost</span>
							</div>
						</Reveal>

						{/* Title */}
						<Reveal phase={2} delay={0.1}>
							<h1 className="mb-4 font-semibold text-heading-lg text-surface-900 dark:text-surface-100">
								Coordinates Invalid.
							</h1>
						</Reveal>

						{/* Description */}
						<Reveal phase={2} delay={0.2}>
							<p className="mb-10 text-body-md text-surface-500 dark:text-surface-400">
								The sector you are attempting to access does not exist.
							</p>
						</Reveal>

						{/* Action */}
						<Reveal phase={3} delay={0.3}>
							<Button asChild size="lg" variant="outlined">
								<Link href="/">
									<ArrowLeft className="mr-2 size-4" />
									Return to Base
								</Link>
							</Button>
						</Reveal>
					</div>
				</SwissGridSection>

				{/* 3. BOTTOM ANCHOR (Spacer only, no grid line) */}
				<div className="mx-auto w-full max-w-3xl flex-1" />
			</div>
		</SwissGridProvider>
	);
}
