import { allProjects } from "contentlayer2/generated";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectContent } from "@/src/components/content/project-content";

interface ProjectPageProps {
	params: Promise<{
		slug: string;
	}>;
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

	return {
		title: `${project.title} | Yassine Chettouch`,
		description: project.description,
	};
}

export default async function ProjectPage({ params }: ProjectPageProps) {
	const { slug } = await params;
	const project = allProjects.find((p) => p.slug === slug);

	if (!project) {
		notFound();
	}

	return <ProjectContent project={project} />;
}
