import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { PageContainer, ProseContainer } from "@/src/components/layout/containers";
import { SiteFooter } from "@/src/components/layout/site-footer";
import { SiteHeader } from "@/src/components/layout/site-header";
import { Button } from "@/src/components/ui/button";
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
						<PageContainer className="portfolio-section-top-loose text-center">
							<SwissGridBox>
								<SwissGridRow>
									<div className="portfolio-box-pad">
										<ProseContainer className="mx-auto flex flex-col items-center justify-center">
											<p className="portfolio-kicker mb-4 text-surface-400 dark:text-surface-500">
												Coming Soon
											</p>
											<h1 className="portfolio-heading-xl portfolio-capsize-heading-xl mb-6 text-surface-900 dark:text-surface-100">
												Blog
											</h1>
											<p className="portfolio-body-lg mb-10 text-surface-600 dark:text-surface-400">
												Technical deep-dives, architecture decisions, and
												lessons learned from shipping products. Currently in
												the works.
											</p>
											<Button
												asChild
												variant="outlined"
												size="lg"
												color="primary"
											>
												<Link href="/">
													<ArrowLeft className="size-4" weight="bold" />
													Back to Home
												</Link>
											</Button>
										</ProseContainer>
									</div>
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
