"use client";

import { ArrowLeft } from "@phosphor-icons/react";
import Link from "next/link";
import { SiteHeader } from "@/src/components/layout/site-header";
import { Button } from "@/src/components/ui/button";
import { Reveal } from "@/src/components/ui/reveal";
import { SwissGridProvider, SwissGridSection } from "@/src/components/ui/swiss-grid-canvas";

export default function BlogPage() {
	return (
		<SwissGridProvider>
			<div className="relative flex min-h-screen w-full flex-col bg-surface-50 text-surface-900 dark:bg-surface-950 dark:text-surface-50">
				{/* 1. HEADER (Context Badges) */}
				<SiteHeader />

				{/* 2. CONTENT CELL */}
				<SwissGridSection
					id="blog-content"
					className="relative z-10 w-full max-w-3xl mx-auto"
				>
					<Reveal phase={1} className="w-full">
						<section className="mx-auto flex flex-col items-center justify-center px-6 py-24 text-center sm:px-8">
							<p className="mb-4 font-mono text-surface-400 text-xs uppercase tracking-widest dark:text-surface-500">
								Coming Soon
							</p>
							<h1 className="mb-6 text-heading-xl text-surface-900 dark:text-surface-100">
								Blog
							</h1>
							<p className="mb-10 max-w-md text-body-lg text-surface-600 dark:text-surface-400">
								Technical deep-dives, architecture decisions, and lessons learned
								from shipping products. Currently in the works.
							</p>
							<Button asChild variant="outlined" size="lg" color="primary">
								<Link href="/">
									<ArrowLeft className="size-4" weight="bold" />
									Back to Home
								</Link>
							</Button>
						</section>
					</Reveal>
				</SwissGridSection>

				{/* 3. BOTTOM ANCHOR (Spacer only, no grid line) */}
				<div className="flex-1 w-full max-w-3xl mx-auto" />
			</div>
		</SwissGridProvider>
	);
}
