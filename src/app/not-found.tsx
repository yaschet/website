import { ArrowLeft, ArrowRight, MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { PageContainer } from "@/src/components/layout/containers";
import { SiteHeader } from "@/src/components/layout/site-header";
import { Button } from "@/src/components/ui/button";
import { EditorialEmptyState } from "@/src/components/ui/editorial-empty-state";
import { SwissGridBox, SwissGridRow } from "@/src/components/ui/swiss-grid";

export default function NotFound() {
	return (
		<div className="relative flex min-h-screen w-full flex-col bg-surface-50 text-surface-900 dark:bg-surface-950 dark:text-surface-50">
			{/* 1. HEADER (Context Badges) */}
			<SiteHeader />

			{/* 2. CONTENT CELL */}
			<section id="404-content" className="relative z-10 w-full">
				<PageContainer className="portfolio-section-top-loose">
					<SwissGridBox>
						<SwissGridRow>
							<EditorialEmptyState
								eyebrow="404"
								icon={
									<MagnifyingGlass
										className="size-[var(--portfolio-icon-sm)] opacity-80"
										weight="regular"
									/>
								}
								title="Page not found."
								description="This address does not point to a public page."
								actions={
									<>
										<Button asChild size="md" variant="solid">
											<Link href="/">
												<ArrowLeft weight="bold" />
												Home
											</Link>
										</Button>
										<Button asChild size="md" variant="outlined">
											<Link href="/case-studies">
												Case Studies
												<ArrowRight weight="bold" />
											</Link>
										</Button>
									</>
								}
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
