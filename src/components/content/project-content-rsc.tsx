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

const MDX_SECTION_BREAK = /^\s*(?:---|\*\*\*|___)\s*$/gm;

function splitCaseStudySections(source: string) {
	return source
		.split(MDX_SECTION_BREAK)
		.map((section) => section.trim())
		.filter(Boolean);
}

export function ProjectContentRSC({ project }: ProjectContentProps) {
	const projectData = project as ProjectWithExtras;
	const galleryImages = projectData.coverImages ?? [];
	const contentSections = splitCaseStudySections(project.body.raw);
	// biome-ignore lint/suspicious/noExplicitAny: next-mdx-remote's SerializeOptions typing is too narrow for shared plugin tuples here.
	const mdxOptions: any = {
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
	};

	return (
		<div className="flex flex-1 flex-col text-surface-900 selection:bg-surface-900 selection:text-surface-50 dark:text-surface-50 dark:selection:bg-surface-100 dark:selection:text-surface-900">
			<main className="relative z-10 flex flex-1 flex-col" style={{ overflowAnchor: "none" }}>
				{/* Nav Row */}
				<Reveal phase={1} className="w-full">
					<SiteHeader />
				</Reveal>

				{/* Main Case Study Object */}
				<section id="project-main" className="w-full">
					<PageContainer className="portfolio-section-top">
						<SwissGridBox>
							<SwissGridRow>
								<Reveal phase={1} className="w-full">
									<div className="portfolio-box-pad">
										<ModuleContainer className="mx-auto">
											<Link
												href="/case-studies"
												className="portfolio-kicker mb-10 inline-flex items-center gap-2.5 text-muted-foreground transition-colors hover:text-foreground"
											>
												<ArrowLeft size={14} weight="bold" />
												<span>Back to Case Studies</span>
											</Link>

											{galleryImages.length > 0 &&
												!projectData.hideCoverGallery && (
													<div className="mb-10">
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

											<h1 className="portfolio-heading-xl portfolio-capsize-heading-xl mb-5 text-foreground">
												{project.title}
											</h1>

											<div className="portfolio-inline-meta mb-5">
												<time className="font-mono text-muted-foreground text-xs tabular-nums">
													{formatDate(project.date)}
												</time>
												{projectData.readingTime && (
													<span className="flex items-center gap-2 font-mono text-muted-foreground text-xs">
														<Clock size={12} weight="bold" />
														{projectData.readingTime} min read
													</span>
												)}
												{project.featured && (
													<span className="portfolio-chip border-primary text-primary">
														Featured
													</span>
												)}
											</div>

											<ProseContainer>
												<p className="portfolio-body-lg text-muted-foreground">
													{project.description}
												</p>
											</ProseContainer>
										</ModuleContainer>
									</div>
								</Reveal>
							</SwissGridRow>
							<SwissGridRow>
								<Reveal phase={2} delay={0.04} className="w-full">
									<div className="portfolio-box-pad">
										<ModuleContainer className="mx-auto">
											<div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
												{project.role && (
													<div className="flex flex-col gap-2.5">
														<span className="font-mono text-muted-foreground text-xs uppercase tracking-wider">
															Role
														</span>
														<span className="font-medium text-foreground text-sm">
															{project.role}
														</span>
													</div>
												)}
												{project.status && (
													<div className="flex flex-col gap-2.5">
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
														<div className="flex flex-wrap gap-2.5">
															{project.stack.map((item: string) => (
																<span
																	key={item}
																	className="portfolio-chip"
																>
																	{item}
																</span>
															))}
														</div>
													</div>
												)}
												{!project.stack &&
													project.tech &&
													project.tech.length > 0 && (
														<div className="flex flex-col gap-2.5 sm:col-span-2">
															<span className="font-mono text-muted-foreground text-xs uppercase tracking-wider">
																Technologies
															</span>
															<div className="flex flex-wrap gap-2.5">
																{project.tech.map(
																	(tech: string) => (
																		<span
																			key={tech}
																			className="portfolio-chip"
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
												<div className="portfolio-control-row mt-10">
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
								</Reveal>
							</SwissGridRow>
							{contentSections.map((section, index) => (
								<SwissGridRow key={`project-section-${index + 1}`}>
									<ScrollReveal
										phase={2}
										delay={Math.min(index * 0.04, 0.24)}
										className="w-full"
									>
										<div className="portfolio-box-pad">
											<ModuleContainer className="mx-auto">
												<article>
													<MDXRemote
														source={section}
														components={mdxComponents}
														options={mdxOptions}
													/>
												</article>
											</ModuleContainer>
										</div>
									</ScrollReveal>
								</SwissGridRow>
							))}
						</SwissGridBox>
					</PageContainer>
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
												<div className="portfolio-action-band">
													<h2 className="portfolio-heading-lg portfolio-capsize-heading-lg text-surface-900 dark:text-surface-100">
														Building something similar?
													</h2>
													<Button
														asChild
														size="md"
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
