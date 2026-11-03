import type { Metadata } from "next";
import { CaseStudiesPageContent } from "@/src/components/pages/case-studies-page";
import { SITE_URL } from "@/src/constants/site";
import { getListedPublicProjectSummaries } from "@/src/content/project-summaries";

export const metadata: Metadata = {
	title: "Case Studies",
	description:
		"Selected case studies in product engineering, systems work, and shipped software.",
	alternates: {
		canonical: "/case-studies",
	},
	openGraph: {
		title: "Case Studies | Yassine Chettouch",
		description:
			"Selected case studies in product engineering, systems work, and shipped software.",
		url: `${SITE_URL}/case-studies`,
		type: "website",
	},
};

export default async function CaseStudiesPage() {
	"use cache";
	const projects = await getListedPublicProjectSummaries();
	return <CaseStudiesPageContent projects={projects} />;
}
