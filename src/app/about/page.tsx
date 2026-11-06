import type { Metadata } from "next";
import { AboutContent } from "@/src/components/content/about-content";
import { SiteFooter } from "@/src/components/layout/site-footer";

export const metadata: Metadata = {
	title: "About",
	description:
		"About Yassine Chettouch, a Product Engineer in Rabat, Morocco. His background in graphic design and the decisions behind his software work.",
	alternates: {
		canonical: "/about",
	},
};

export default function AboutPage() {
	return (
		<div className="flex flex-1 flex-col text-foreground selection:bg-foreground selection:text-background">
			<main className="relative z-10 flex flex-1 flex-col">
				<AboutContent />
			</main>
			<SiteFooter />
			<section id="nav-spacer" className="portfolio-nav-spacer w-full" />
		</div>
	);
}
