import { ArrowLeft, ArrowRight, Clock } from "@phosphor-icons/react/dist/ssr";
import type { Project } from "contentlayer2/generated";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { SiteFooter } from "@/src/components/layout/site-footer";
import { mdxComponents } from "@/src/components/mdx/mdx-components";
import { ReadingBracket } from "@/src/components/ui/article-toc";
import { Button } from "@/src/components/ui/button";
import { ImageGallery } from "@/src/components/ui/image-gallery";
import { ScrollReveal } from "@/src/components/ui/reveal";
import { SwissGridProvider, SwissGridSection } from "@/src/components/ui/swiss-grid-canvas";
import { formatDate } from "@/src/lib/format-date";

interface ProjectContentProps {
	project: Project;
}

// Extended type for computed fields
type ProjectWithExtras = Project & {
	readingTime?: number;
	coverImages?: string[];
};

export function ProjectContentRSC({ project }: ProjectContentProps) {
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

									{/* Hero Gallery - Client Island */}
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
											{formatDate(project.date)}
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

					{/* Content - Server Rendered MDX */}
					<SwissGridSection id="project-content" className="w-full">
						<ScrollReveal phase={2} className="w-full">
							<section className="w-full">
								<div className="mx-auto max-w-3xl px-6 py-16 sm:px-8">
									<article>
										<MDXRemote
											source={project.body.raw}
											components={mdxComponents}
											options={{
												mdxOptions: {
													remarkPlugins: [remarkGfm],
													rehypePlugins: [
														rehypeSlug,
														[
															rehypeAutolinkHeadings,
															{
																properties: {
																	className: ["anchor"],
																},
															},
														],
													],
												},
											}}
										/>
									</article>
								</div>
							</section>
						</ScrollReveal>
					</SwissGridSection>

					{/* CTA - Contextual Inquiry */}
					<SwissGridSection id="project-cta" className="w-full">
						<ScrollReveal phase={3} className="w-full">
							<section className="w-full">
								<div className="mx-auto max-w-3xl px-6 py-16 sm:px-8">
									<div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
										<h2 className="text-heading-lg text-surface-900 dark:text-surface-100">
											Building something similar?
										</h2>
										<Button asChild size="lg" variant="solid" color="primary">
											<Link href="/contact">
												Email
												<ArrowRight className="size-4" weight="bold" />
											</Link>
										</Button>
									</div>
								</div>
							</section>
						</ScrollReveal>
					</SwissGridSection>

					{/* Reading Bracket - Client Component */}
					<ReadingBracket />

					{/* Footer */}
					<SiteFooter />
				</main>
			</div>
		</SwissGridProvider>
	);
}
