import { FileText } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import { PageContainer } from "@/src/components/layout/containers";
import { PageIntro } from "@/src/components/layout/page-intro";
import { SiteFooter } from "@/src/components/layout/site-footer";
import { SiteHeader } from "@/src/components/layout/site-header";
import { EditorialEmptyState } from "@/src/components/ui/editorial-empty-state";
import { Reveal } from "@/src/components/ui/reveal";
import { SwissGridBox, SwissGridRow } from "@/src/components/ui/swiss-grid";

export const metadata: Metadata = {
	title: "Blog | Yassine Chettouch",
	description: "Technical deep-dives and lessons learned from shipping products.",
	alternates: {
		canonical: "/blog",
	},
};

export default function BlogPage() {
	return (
		<div className="flex flex-1 flex-col text-surface-900 selection:bg-surface-900 selection:text-surface-50 dark:text-surface-50 dark:selection:bg-surface-100 dark:selection:text-surface-900">
			{/* 1. HEADER (Context Badges) */}
			<SiteHeader />

			<main className="relative z-10 flex flex-1 flex-col">
				{/* 2. CONTENT CELL */}
				<section id="blog-content" className="w-full">
					<Reveal phase={1} className="w-full">
						<PageContainer className="portfolio-section-top">
							<SwissGridBox>
								<SwissGridRow>
									<div className="portfolio-box-pad">
										<PageIntro
											eyebrow="Writing"
											title="Blog"
											description="Notes on systems, tradeoffs, and shipped work."
										/>
									</div>
								</SwissGridRow>
								<SwissGridRow>
									<Reveal phase={2} className="w-full">
										<EditorialEmptyState
											icon={
												<FileText
													className="size-[var(--portfolio-icon-sm)] opacity-80"
													weight="regular"
												/>
											}
											title="No posts yet."
											description="Nothing is published right now."
										/>
									</Reveal>
								</SwissGridRow>
							</SwissGridBox>
						</PageContainer>
					</Reveal>
				</section>
			</main>
			<SiteFooter />
			<section id="nav-spacer" className="portfolio-nav-spacer w-full" />
		</div>
	);
}
