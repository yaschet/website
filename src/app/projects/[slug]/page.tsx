import { allProjects } from "contentlayer2/generated";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectContentRSC } from "@/src/components/content/project-content-rsc";

interface ProjectPageProps {
	params: Promise<{
		slug: string;
	}>;
}

interface ProjectData {
	stack?: string[];
	tech?: string[];
	seoKeywords?: string[];
}

export function generateStaticParams() {
	return allProjects.map((project) => ({
		slug: project.slug,
	}));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
	const { slug } = await params;
	const project = allProjects.find((p) => p.slug === slug);

	if (!project) {
		return {
			title: "Project Not Found",
		};
	}

	// Extract keywords for SEO/ATS
	const projectData = project as unknown as ProjectData;
	const stack = projectData.stack ?? [];
	const tech = projectData.tech ?? [];
	const seoKeywords = projectData.seoKeywords ?? [];
	const keywords = [...new Set([...stack, ...tech, ...seoKeywords])].join(", ");

	return {
		title: `${project.title} | Yassine Chettouch`,
		description: project.description,
		keywords: keywords || undefined,
	};
}

export default async function ProjectPage({ params }: ProjectPageProps) {
	const { slug } = await params;
	const project = allProjects.find((p) => p.slug === slug);

	if (!project) {
		notFound();
	}

	return <ProjectContentRSC project={project} />;
}
