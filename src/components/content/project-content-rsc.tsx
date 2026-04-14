import { ArrowLeft, ArrowRight, Clock } from "@phosphor-icons/react/dist/ssr";
import type { Project } from "contentlayer2/generated";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { ModuleContainer, PageContainer, ProseContainer } from "@/src/components/layout/containers";
import { SiteFooter } from "@/src/components/layout/site-footer";
import { mdxComponents } from "@/src/components/mdx/mdx-components";
import { ReadingBracket } from "@/src/components/ui/article-toc";
import { Button } from "@/src/components/ui/button";
import { ImageGallery } from "@/src/components/ui/image-gallery";
import { Reveal, ScrollReveal } from "@/src/components/ui/reveal";
import { SwissGridBox, SwissGridRow } from "@/src/components/ui/swiss-grid";
import { formatDate } from "@/src/lib/format-date";
import { SiteHeader } from "../layout/site-header";

interface ProjectContentProps {
	project: Project;
}

// Extended type for computed fields
type ProjectWithExtras = Project & {
	readingTime?: number;
	coverImages?: string[];
	hideCoverGallery?: boolean;
};

export function ProjectContentRSC({ project }: ProjectContentProps) {
	const projectData = project as ProjectWithExtras;
	const galleryImages = projectData.coverImages ?? [];

	return (
		<div className="flex flex-1 flex-col text-surface-900 selection:bg-surface-900 selection:text-surface-50 dark:text-surface-50 dark:selection:bg-surface-100 dark:selection:text-surface-900">
			<main className="relative z-10 flex flex-1 flex-col" style={{ overflowAnchor: "none" }}>
				{/* Nav Row */}
				<Reveal phase={1} className="w-full">
					<SiteHeader />
				</Reveal>

				{/* Header */}
				<section id="project-header" className="w-full">
					<Reveal phase={1} className="w-full">
						<section className="w-full">
							<PageContainer className="portfolio-section-top">
								<SwissGridBox>
									<SwissGridRow>
										<div className="portfolio-box-pad">
											<ModuleContainer className="mx-auto">
												<Link
													href="/projects"
													className="mb-8 inline-flex items-center gap-2 font-mono text-muted-foreground text-xs uppercase tracking-wider transition-colors hover:text-foreground"
												>
													<ArrowLeft size={14} weight="bold" />
													<span>Back to Projects</span>
												</Link>

												{galleryImages.length > 0 &&
													!projectData.hideCoverGallery && (
														<div className="mb-8">
															<ImageGallery
																images={galleryImages}
																altPrefix={project.title}
																aspectRatio="16/9"
																showArrows={
																	galleryImages.length > 1
																}
																showProgress={
																	galleryImages.length > 1
																}
																showCounter={
																	galleryImages.length > 1
																}
															/>
														</div>
													)}

												<h1 className="mb-4 text-foreground text-heading-xl">
													{project.title}
												</h1>

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

												<ProseContainer>
													<p className="mb-12 text-body-lg text-muted-foreground">
														{project.description}
													</p>
												</ProseContainer>

												<div className="mb-12 grid grid-cols-1 gap-8 border-surface-200 border-t py-8 sm:grid-cols-2 dark:border-surface-800">
													{project.role && (
														<div className="flex flex-col gap-2">
															<span className="font-mono text-muted-foreground text-xs uppercase tracking-wider">
																Role
															</span>
															<span className="font-medium text-foreground text-sm">
																{project.role}
															</span>
														</div>
													)}
													{project.status && (
														<div className="flex flex-col gap-2">
															<span className="font-mono text-muted-foreground text-xs uppercase tracking-wider">
																Status
															</span>
															<span className="font-medium text-foreground text-sm">
																{project.status}
															</span>
														</div>
													)}
													{project.stack && project.stack.length > 0 && (
														<div className="flex flex-col gap-2 sm:col-span-2">
															<span className="font-mono text-muted-foreground text-xs uppercase tracking-wider">
																Engine Stack
															</span>
															<div className="flex flex-wrap gap-2">
																{project.stack.map(
																	(item: string) => (
																		<span
																			key={item}
																			className="border border-surface-200 bg-surface-50 px-2 py-0.5 font-mono text-[11px] text-surface-600 uppercase tracking-tight dark:border-surface-800 dark:bg-surface-900 dark:text-surface-400"
																		>
																			{item}
																		</span>
																	),
																)}
															</div>
														</div>
													)}
													{!project.stack &&
														project.tech &&
														project.tech.length > 0 && (
															<div className="flex flex-col gap-2 sm:col-span-2">
																<span className="font-mono text-muted-foreground text-xs uppercase tracking-wider">
																	Technologies
																</span>
																<div className="flex flex-wrap gap-2">
																	{project.tech.map(
																		(tech: string) => (
																			<span
																				key={tech}
																				className="border border-surface-200 bg-surface-50 px-2 py-0.5 font-mono text-[11px] text-surface-600 uppercase tracking-tight dark:border-surface-800 dark:bg-surface-900 dark:text-surface-400"
																			>
																				{tech}
																			</span>
																		),
																	)}
																</div>
															</div>
														)}
												</div>

												{(project.url || project.github) && (
													<div className="portfolio-control-row">
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
											</ModuleContainer>
										</div>
									</SwissGridRow>
								</SwissGridBox>
							</PageContainer>
						</section>
					</Reveal>
				</section>

				{/* Content - Server Rendered MDX */}
				<section id="project-content" className="w-full">
					<ScrollReveal phase={2} className="w-full">
						<section className="w-full">
							<PageContainer className="portfolio-section-loose">
								<SwissGridBox>
									<SwissGridRow>
										<div className="portfolio-box-pad">
											<ModuleContainer className="mx-auto">
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
																				className: [
																					"anchor",
																				],
																			},
																		},
																	],
																],
															},
														}}
													/>
												</article>
											</ModuleContainer>
										</div>
									</SwissGridRow>
								</SwissGridBox>
							</PageContainer>
						</section>
					</ScrollReveal>
				</section>

				{/* CTA - Contextual Inquiry */}
				<section id="project-cta" className="w-full">
					<ScrollReveal phase={3} className="w-full">
						<section className="w-full">
							<PageContainer className="portfolio-section-loose">
								<SwissGridBox>
									<SwissGridRow>
										<div className="portfolio-box-pad">
											<ModuleContainer className="mx-auto">
												<div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
													<h2 className="text-heading-lg text-surface-900 dark:text-surface-100">
														Building something similar?
													</h2>
													<Button
														asChild
														size="lg"
														variant="solid"
														color="primary"
													>
														<Link href="/contact">
															Email
															<ArrowRight
																className="size-4"
																weight="bold"
															/>
														</Link>
													</Button>
												</div>
											</ModuleContainer>
										</div>
									</SwissGridRow>
								</SwissGridBox>
							</PageContainer>
						</section>
					</ScrollReveal>
				</section>

				{/* Reading Bracket - Client Component */}
				<ReadingBracket />
			</main>
			<SiteFooter />
			<section id="nav-spacer" className="portfolio-nav-spacer w-full" />
		</div>
	);
}
