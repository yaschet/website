import { permanentRedirect } from "next/navigation";
import { getPublicProjectSummaries } from "@/src/content/registry";

interface ProjectPageProps {
	params: Promise<{
		slug: string;
	}>;
}

export async function generateStaticParams() {
	const projects = await getPublicProjectSummaries();

	return projects.map((project) => ({
		slug: project.slug,
	}));
}

export default async function ProjectPage({ params }: ProjectPageProps) {
	"use cache";

	const { slug } = await params;
	permanentRedirect(`/case-studies/${slug}`);
}
