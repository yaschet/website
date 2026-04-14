"use client";

import { ArrowClockwise, Warning } from "@phosphor-icons/react";
import { useEffect } from "react";
import { PageContainer, ProseContainer } from "@/src/components/layout/containers";
import { SiteHeader } from "@/src/components/layout/site-header";
import { Button } from "@/src/components/ui/button";
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
				<PageContainer className="portfolio-section-top-loose text-center">
					<SwissGridBox>
						<SwissGridRow>
							<div className="portfolio-box-pad">
								<ProseContainer className="mx-auto flex flex-col items-center justify-center">
									<div className="mb-8 flex justify-center">
										<div className="flex size-14 items-center justify-center bg-surface-100 text-surface-900 shadow-sm dark:bg-surface-900 dark:text-surface-50">
											<Warning
												className="size-6 opacity-80"
												weight="duotone"
											/>
										</div>
									</div>

									<h1 className="mb-3 font-semibold text-heading-md">
										System Interruption
									</h1>

									<p className="mb-10 max-w-md text-body-sm text-surface-500 dark:text-surface-400">
										The system encountered a runtime exception. This incident
										has been logged.
									</p>

									<Button onClick={() => reset()} size="lg" variant="solid">
										<ArrowClockwise className="mr-2 size-4" />
										Reboot System
									</Button>
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
