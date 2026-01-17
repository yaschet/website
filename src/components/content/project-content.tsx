"use client";

import { useState, type MouseEvent } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Clock } from "@phosphor-icons/react";
import { useMDXComponent } from "next-contentlayer/hooks";
import type { Project } from "contentlayer/generated";
import { Button } from "@/src/components/ui/button";
import { ScrollReveal } from "@/src/components/ui/reveal";
import { SwissGridProvider, SwissGridSection } from "@/src/components/ui/swiss-grid-canvas";
import { mdxComponents } from "@/src/components/mdx/mdx-components";
import { cn } from "@/src/lib/utils";

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

	// Hero gallery state (same as MonolithCard)
	const [activeIndex, setActiveIndex] = useState(0);
	const galleryImages = projectData.coverImages ?? [];
	const hasGallery = galleryImages.length > 1;

	function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
		if (!hasGallery) return;
		const { left, width } = e.currentTarget.getBoundingClientRect();
		const x = e.clientX - left;
		const newIndex = Math.floor((x / width) * galleryImages.length);
		const clampedIndex = Math.max(0, Math.min(newIndex, galleryImages.length - 1));
		if (clampedIndex !== activeIndex) {
			setActiveIndex(clampedIndex);
		}
	}

	function handleMouseLeave() {
		setActiveIndex(0);
	}

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
										className="mb-8 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
									>
										<ArrowLeft size={14} weight="bold" />
										<span>Back to Projects</span>
									</Link>

									{/* Hero Gallery (MonolithCard style) */}
									{galleryImages.length > 0 && (
										<div
											role="region"
											aria-label="Project screenshot gallery"
											className="group relative mb-8 aspect-[16/9] w-full overflow-hidden border border-surface-200 bg-surface-100 dark:border-surface-800 dark:bg-surface-800"
											onMouseMove={handleMouseMove}
											onMouseLeave={handleMouseLeave}
										>
											{/* Gallery Strip */}
											<div
												className="flex h-full transition-transform duration-300 ease-out will-change-transform"
												style={{
													width: `${galleryImages.length * 100}%`,
													transform: `translateX(-${(activeIndex * 100) / galleryImages.length}%)`,
												}}
											>
												{galleryImages.map((src, i) => (
													<div
														key={src}
														className="relative h-full w-full flex-1"
													>
														<Image
															src={src}
															alt={`${project.title} - View ${i + 1}`}
															fill
															sizes="(max-width: 768px) 100vw, 768px"
															className="object-cover"
															priority={i === 0}
														/>
													</div>
												))}
											</div>

											{/* Swiss Ticks (Gallery Indicators) */}
											{hasGallery && (
												<div className="absolute inset-x-0 bottom-0 flex gap-0.5 p-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
													{galleryImages.map((src, i) => (
														<div
															key={`tick-${src}`}
															className={cn(
																"h-0.5 flex-1 transition-colors duration-200",
																i === activeIndex
																	? "bg-surface-900 dark:bg-surface-100"
																	: "bg-surface-900/20 dark:bg-surface-100/20",
															)}
														/>
													))}
												</div>
											)}
										</div>
									)}

									{/* Title */}
									<h1 className="mb-4 text-heading-xl text-foreground">
										{project.title}
									</h1>

									{/* Meta Row (inline) */}
									<div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2">
										<time className="font-mono text-xs tabular-nums text-muted-foreground">
											{new Date(project.date).toLocaleDateString("en-US", {
												year: "numeric",
												month: "long",
											})}
										</time>
										{projectData.readingTime && (
											<span className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
												<Clock size={12} weight="bold" />
												{projectData.readingTime} min read
											</span>
										)}
										{project.featured && (
											<span className="border border-primary px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-primary">
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
													className="border border-surface-950 bg-transparent px-3 py-1.5 font-mono text-xs uppercase tracking-wide text-surface-950 dark:border-surface-100 dark:text-surface-100"
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
