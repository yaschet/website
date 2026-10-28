"use client";

import { ArrowClockwise, ArrowRight, Warning } from "@phosphor-icons/react";
import { useEffect } from "react";
import { PageContainer } from "@/src/components/layout/containers";
import { Button } from "@/src/components/ui/button";
import { EditorialEmptyState } from "@/src/components/ui/editorial-empty-state";
import { PortfolioLink as Link } from "@/src/components/ui/portfolio-link";

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
			<section id="error-content" className="relative z-10 w-full">
				<PageContainer className="portfolio-section-top-loose">
					<div className="portfolio-grid-frame relative w-full overflow-hidden bg-card text-card-foreground">
						<div className="portfolio-grid-row relative">
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
											<Link transitionTypes={["navigation"]} href="/">
												Home
												<ArrowRight weight="bold" />
											</Link>
										</Button>
									</>
								}
								note={error.digest ? `Reference: ${error.digest}` : undefined}
							/>
						</div>
					</div>
				</PageContainer>
			</section>

			{/* 3. BOTTOM ANCHOR (Spacer only, no grid line) */}
			<PageContainer className="flex-1" />
		</div>
	);
}
