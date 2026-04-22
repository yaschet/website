import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { ProjectContentRSC } from "@/src/components/content/project-content-rsc";
import {
	getPublicProjectBySlug,
	getPublicProjectSummaries,
	getPublicProjectSummaryBySlug,
} from "@/src/content/registry";
import { getFirstPresentableMediaAsset, getProjectCoverMedia } from "@/src/lib/gallery-media";

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

export async function generateStaticParams() {
	const projects = await getPublicProjectSummaries();

	return projects.map((project) => ({
		slug: project.slug,
	}));
}

export async function generateMetadata(
	{ params }: ProjectPageProps,
	parent: ResolvingMetadata,
): Promise<Metadata> {
	"use cache";

	const { slug } = await params;
	const project = await getPublicProjectSummaryBySlug(slug);

	if (!project) {
		return {
			title: "Project Not Found",
		};
	}

	const projectData = project as unknown as ProjectData;
	const stack = projectData.stack ?? [];
	const tech = projectData.tech ?? [];
	const seoKeywords = projectData.seoKeywords ?? [];
	const keywords = [...new Set([...stack, ...tech, ...seoKeywords])];
	const ogImage =
		getFirstPresentableMediaAsset(getProjectCoverMedia(project), project.coverImages) ??
		"/images/og-image.png";
	const parentMetadata = await parent;
	const parentOpenGraph = parentMetadata.openGraph || {};

	return {
		title: project.title,
		description: project.description,
		keywords,
		alternates: {
			canonical: `/case-studies/${slug}`,
		},
		openGraph: {
			...parentOpenGraph,
			title: `${project.title} | Yassine Chettouch`,
			description: project.description,
			type: "article",
			url: `https://yaschet.dev/case-studies/${project.slug}`,
			images: [
				{
					url: ogImage,
					width: 1200,
					height: 630,
					alt: `${project.title} - Case Study`,
				},
			],
		},
		twitter: {
			card: "summary_large_image",
			title: `${project.title} | Yassine Chettouch`,
			description: project.description,
			images: [ogImage],
		},
	};
}

export default async function CaseStudyPage({ params }: ProjectPageProps) {
	"use cache";

	const { slug } = await params;
	const project = await getPublicProjectBySlug(slug);

	if (!project) {
		notFound();
	}

	const projectData = project as unknown as ProjectData;

	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "TechArticle",
		headline: project.title,
		description: project.description,
		image: (() => {
			const asset = getFirstPresentableMediaAsset(
				getProjectCoverMedia(project),
				project.coverImages,
			);
			return asset
				? `https://yaschet.dev${asset}`
				: "https://yaschet.dev/images/og-image.png";
		})(),
		datePublished: project.date,
		dateModified: project.date,
		author: {
			"@type": "Person",
			name: "Yassine Chettouch",
			url: "https://yaschet.dev",
		},
		publisher: {
			"@type": "Person",
			name: "Yassine Chettouch",
			url: "https://yaschet.dev",
		},
		keywords: [...(projectData.tech ?? []), ...(projectData.stack ?? [])].join(", "),
	};

	return (
		<>
			<script
				type="application/ld+json"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is trusted
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>
			<ProjectContentRSC project={project} />
		</>
	);
}
