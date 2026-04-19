"use client";

import { ArrowClockwise, ArrowRight, Warning } from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect } from "react";
import { PageContainer } from "@/src/components/layout/containers";
import { SiteHeader } from "@/src/components/layout/site-header";
import { Button } from "@/src/components/ui/button";
import { EditorialEmptyState } from "@/src/components/ui/editorial-empty-state";
import { SwissGridBox, SwissGridRow } from "@/src/components/ui/swiss-grid";

export default function AppError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		// biome-ignore lint/suspicious/noConsole: Log system errors
		console.error(error);
	}, [error]);

	return (
		<div className="relative flex min-h-screen w-full flex-col bg-surface-50 text-surface-900 dark:bg-surface-950 dark:text-surface-50">
			{/* 1. HEADER (Context Badges) */}
			<SiteHeader />

			{/* 2. CONTENT CELL */}
			<section id="error-content" className="relative z-10 w-full">
				<PageContainer className="portfolio-section-top-loose">
					<SwissGridBox>
						<SwissGridRow>
							<EditorialEmptyState
								eyebrow="Error"
								icon={
									<Warning
										className="size-[var(--portfolio-icon-sm)] opacity-80"
										weight="duotone"
									/>
								}
								title="Something broke."
								description="This page did not render properly."
								actions={
									<>
										<Button onClick={() => reset()} size="md" variant="solid">
											<ArrowClockwise weight="bold" />
											Try Again
										</Button>
										<Button asChild size="md" variant="outlined">
											<Link href="/">
												Home
												<ArrowRight weight="bold" />
											</Link>
										</Button>
									</>
								}
								note={error.digest ? `Reference: ${error.digest}` : undefined}
							/>
						</SwissGridRow>
					</SwissGridBox>
				</PageContainer>
			</section>

			{/* 3. BOTTOM ANCHOR (Spacer only, no grid line) */}
			<PageContainer className="flex-1" />
		</div>
	);
}
