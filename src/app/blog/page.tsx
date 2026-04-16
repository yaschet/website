import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { PageContainer } from "@/src/components/layout/containers";
import { PageIntro } from "@/src/components/layout/page-intro";
import { SiteFooter } from "@/src/components/layout/site-footer";
import { SiteHeader } from "@/src/components/layout/site-header";
import { Button } from "@/src/components/ui/button";
import { InstrumentActionBand } from "@/src/components/ui/instrument-action-band";
import {
	INVERTED_ACTION_BAND_BODY_CLASS,
	INVERTED_ACTION_BAND_OUTLINED_BUTTON_CLASS,
} from "@/src/components/ui/instrument-action-band-theme";
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
											description="Technical deep-dives, architecture decisions, and lessons learned from shipping products."
										/>
									</div>
								</SwissGridRow>
								<SwissGridRow>
									<InstrumentActionBand
										fieldSpeed={0.42}
										fieldVariant="ray"
										tone="inverted"
									>
										<p
											className={`portfolio-body-sm ${INVERTED_ACTION_BAND_BODY_CLASS}`}
										>
											Publishing begins soon.
										</p>
										<Button
											asChild
											variant="outlined"
											size="md"
											color="default"
											className={INVERTED_ACTION_BAND_OUTLINED_BUTTON_CLASS}
										>
											<Link href="/">
												<ArrowLeft className="size-4" weight="bold" />
												Back to Home
											</Link>
										</Button>
									</InstrumentActionBand>
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
