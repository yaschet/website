/**
 * Architectural container for individual project case studies.
 *
 * @remarks
 * Manages the layout for projects including the hero gallery, technical
 * metadata, and MDX content rendering. Features:
 * - Interactive gallery with click/swipe navigation.
 * - Integrated ReadingBracket (TOC) integration.
 * - Global grid synchronization.
 *
 * @public
 */

"use client";

import { ArrowLeft, Clock } from "@phosphor-icons/react";
import type { Project } from "contentlayer2/generated";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useMDXComponent } from "next-contentlayer2/hooks";
import { mdxComponents } from "@/src/components/mdx/mdx-components";
import { Button } from "@/src/components/ui/button";
import { ImageGallery } from "@/src/components/ui/image-gallery";
import { ScrollReveal } from "@/src/components/ui/reveal";
import { SwissGridProvider, SwissGridSection } from "@/src/components/ui/swiss-grid-canvas";

// Dynamic import with SSR disabled to avoid Framer Motion issues during static generation
const ReadingBracket = dynamic(
	() => import("@/src/components/ui/article-toc").then((mod) => mod.ReadingBracket),
	{ ssr: false },
);

interface ProjectContentProps {
	project: Project;
}

// Extended type for computed fields
type ProjectWithExtras = Project & {
	readingTime?: number;
	coverImages?: string[];
};

export function ProjectContent({ project }: ProjectContentProps) {
	const MDXContent = useMDXComponent(project.body.code);
	const projectData = project as ProjectWithExtras;

	const galleryImages = projectData.coverImages ?? [];

	return (
		<SwissGridProvider>
			<div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
				<main className="relative z-10 flex min-h-screen flex-col pt-32">
					{/* Header */}
					<SwissGridSection id="project-header" className="w-full">
						<ScrollReveal phase={1} className="w-full">
							<section className="w-full">
								<div className="mx-auto max-w-3xl px-6 sm:px-8">
									{/* Back Link */}
									<Link
										href="/projects"
										className="mb-8 inline-flex items-center gap-2 font-mono text-muted-foreground text-xs uppercase tracking-wider transition-colors hover:text-foreground"
									>
										<ArrowLeft size={14} weight="bold" />
										<span>Back to Projects</span>
									</Link>

									{/* Hero Gallery */}
									{galleryImages.length > 0 && (
										<div className="mb-8">
											<ImageGallery
												images={galleryImages}
												altPrefix={project.title}
												aspectRatio="16/9"
												showArrows={galleryImages.length > 1}
												showProgress={galleryImages.length > 1}
												showCounter={galleryImages.length > 1}
											/>
										</div>
									)}

									{/* Title */}
									<h1 className="mb-4 text-foreground text-heading-xl">
										{project.title}
									</h1>

									{/* Meta Row (inline) */}
									<div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2">
										<time className="font-mono text-muted-foreground text-xs tabular-nums">
											{new Date(project.date).toLocaleDateString("en-US", {
												year: "numeric",
												month: "long",
											})}
										</time>
										{projectData.readingTime && (
											<span className="flex items-center gap-1.5 font-mono text-muted-foreground text-xs">
												<Clock size={12} weight="bold" />
												{projectData.readingTime} min read
											</span>
										)}
										{project.featured && (
											<span className="border border-primary px-2 py-0.5 font-mono text-[10px] text-primary uppercase tracking-wider">
												Featured
											</span>
										)}
									</div>

									{/* Description */}
									<p className="mb-8 max-w-xl text-body-lg text-muted-foreground">
										{project.description}
									</p>

									{/* Tech Stack */}
									{project.tech && project.tech.length > 0 && (
										<div className="mb-8 flex flex-wrap gap-2">
											{project.tech.map((tech: string) => (
												<span
													key={tech}
													className="border border-surface-950 bg-transparent px-3 py-1.5 font-mono text-surface-950 text-xs uppercase tracking-wide dark:border-surface-100 dark:text-surface-100"
												>
													{tech}
												</span>
											))}
										</div>
									)}

									{/* Links */}
									{(project.url || project.github) && (
										<div className="flex gap-4">
											{project.url && (
												<Button
													asChild
													size="md"
													variant="outlined"
													color="default"
												>
													<a
														href={project.url}
														target="_blank"
														rel="noopener noreferrer"
													>
														Visit Site
													</a>
												</Button>
											)}
											{project.github && (
												<Button
													asChild
													size="md"
													variant="outlined"
													color="default"
												>
													<a
														href={project.github}
														target="_blank"
														rel="noopener noreferrer"
													>
														View Code
													</a>
												</Button>
											)}
										</div>
									)}
								</div>
							</section>
						</ScrollReveal>
					</SwissGridSection>

					{/* Content */}
					<SwissGridSection id="project-content" className="w-full">
						<ScrollReveal phase={2} className="w-full">
							<section className="w-full">
								<div className="mx-auto max-w-3xl px-6 py-16 sm:px-8">
									<article>
										<MDXContent components={mdxComponents} />
									</article>
								</div>
							</section>
						</ScrollReveal>
					</SwissGridSection>

					{/* Reading Bracket - Desktop Only */}
					<ReadingBracket />

					{/* Footer */}
					<footer className="mt-auto w-full">
						<div className="mx-auto max-w-3xl px-6 py-12 sm:px-8">
							<p className="text-body-sm text-muted-foreground">
								© {new Date().getFullYear()} Yassine Chettouch. Rabat, Morocco.
							</p>
						</div>
					</footer>
				</main>
			</div>
		</SwissGridProvider>
	);
}
