import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/src/components/layout/site-footer";
import { SiteHeader } from "@/src/components/layout/site-header";
import { Button } from "@/src/components/ui/button";
import { Reveal } from "@/src/components/ui/reveal";

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
						<section className="mx-auto flex max-w-3xl flex-col items-center justify-center px-6 py-24 text-center sm:px-8">
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
				</section>
			</main>
			<SiteFooter />
			<section id="nav-spacer" className="h-29.5 w-full" />
		</div>
	);
}
