"use client";

import { ArrowLeft } from "@phosphor-icons/react";
import Link from "next/link";
import { PageContainer, ProseContainer } from "@/src/components/layout/containers";
import { SiteHeader } from "@/src/components/layout/site-header";
import { Button } from "@/src/components/ui/button";
import { Reveal } from "@/src/components/ui/reveal";
import { SwissGridBox, SwissGridRow } from "@/src/components/ui/swiss-grid";

export default function NotFound() {
	return (
		<div className="relative flex min-h-screen w-full flex-col bg-surface-50 text-surface-900 dark:bg-surface-950 dark:text-surface-50">
			{/* 1. HEADER (Context Badges) */}
			<SiteHeader />

			{/* 2. CONTENT CELL */}
			<section id="404-content" className="relative z-10 w-full">
				<PageContainer className="portfolio-section-top-loose text-center">
					<SwissGridBox>
						<SwissGridRow>
							<div className="portfolio-box-pad">
								<ProseContainer className="mx-auto flex flex-col items-center justify-center">
									<Reveal phase={1}>
										<div className="portfolio-kicker mb-10 inline-flex items-center gap-2.5 border border-surface-200 bg-surface-50/50 px-5 py-2.5 text-surface-500 backdrop-blur-sm dark:border-surface-800 dark:bg-surface-900/50 dark:text-surface-400">
											<span className="size-2.5 rounded-full bg-red-500" />
											<span>Signal Lost</span>
										</div>
									</Reveal>

									<Reveal phase={2} delay={0.1}>
										<h1 className="portfolio-heading-lg portfolio-capsize-heading-lg mb-5 text-surface-900 dark:text-surface-100">
											Coordinates Invalid.
										</h1>
									</Reveal>

									<Reveal phase={2} delay={0.2}>
										<p className="portfolio-body-md mb-10 text-surface-500 dark:text-surface-400">
											The sector you are attempting to access does not exist.
										</p>
									</Reveal>

									<Reveal phase={3} delay={0.3}>
										<Button asChild size="md" variant="outlined">
											<Link href="/">
												<ArrowLeft className="mr-2.5 size-5" />
												Return to Base
											</Link>
										</Button>
									</Reveal>
								</ProseContainer>
							</div>
						</SwissGridRow>
					</SwissGridBox>
				</PageContainer>
			</section>

			{/* 3. BOTTOM ANCHOR (Spacer only, no grid line) */}
			<PageContainer className="flex-1" />
		</div>
	);
}
