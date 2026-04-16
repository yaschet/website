/**
 * Card component with image gallery and detail sections.
 *
 * @remarks
 * Displays a project or product with an interactive image gallery,
 * data fields, and technical details. Features 0px radius styling.
 * Supports both public and private (locked) project states.
 *
 * @example
 * ```tsx
 * <ProjectCardGallery
 *   title="Project Alpha"
 *   description="Project technical details."
 *   href="/alpha"
 *   tags={["React", "Next.js"]}
 *   index="01"
 * />
 * ```
 *
 * @public
 */

"use client";

import { ArrowUpRight, Lock } from "@phosphor-icons/react/dist/ssr";
import type { StaticImageData } from "next/image";
import Link from "next/link";
import { ImageGallery } from "@/src/components/ui/image-gallery";
import { cn } from "@/src/lib/index";

interface ProjectCardGalleryProps {
	title: string;
	description: string;
	href: string;
	images?: (string | StaticImageData)[];
	index: string;
	tags: string[];
	isPrivate?: boolean;
	challenge?: string;
	solution?: string;
	className?: string;
	date?: string;
	imageTreatment?: "default" | "disciplined";
	imageAspectRatio?: string | string[] | "auto";
}

export function ProjectCardGallery({
	title,
	description,
	href,
	images,
	index,
	tags,
	isPrivate = false,
	challenge,
	solution,
	className,
	date,
	imageTreatment = "default",
	imageAspectRatio = "16/9",
}: ProjectCardGalleryProps) {
	const galleryImages = images && images.length > 0 ? images : [];

	if (isPrivate) {
		return (
			<div
				className={cn(
					"group block w-full overflow-hidden rounded-[var(--radius)]",
					"border border-surface-200 bg-surface-100 dark:border-surface-800 dark:bg-surface-950",
					"transition-shadow duration-300",
					className,
				)}
			>
				{renderContent()}
			</div>
		);
	}

	return (
		<Link
			href={href}
			className={cn(
				"group block w-full overflow-hidden rounded-[var(--radius)]",
				"border border-surface-200 bg-surface-100 dark:border-surface-800 dark:bg-surface-950",
				"transition-shadow duration-200 hover:shadow-lg",
				className,
			)}
		>
			{renderContent()}
		</Link>
	);

	function renderContent() {
		return (
			<>
				{/* IMAGE ZONE — Interactive Gallery */}
				{galleryImages.length > 0 ? (
					<div
						className={cn(
							"relative overflow-hidden",
							imageTreatment === "disciplined" && [
								"shadow-[inset_0_-1px_0_rgba(15,23,42,0.08)] dark:shadow-[inset_0_-1px_0_rgba(248,250,252,0.08)]",
							],
						)}
					>
						<ImageGallery
							images={galleryImages}
							altPrefix={title}
							aspectRatio={imageAspectRatio}
							showArrows={galleryImages.length > 1 && !isPrivate}
							showProgress={galleryImages.length > 1 && !isPrivate}
							showCounter={false}
							className={cn(
								"border-0 border-surface-200 border-b dark:border-surface-800",
							)}
							imageClassName="transition-transform duration-200 group-hover:scale-[1.01]"
							sizes="(max-width: 768px) 100vw, 768px"
							quality={75}
						/>
						{isPrivate && (
							<div className="absolute inset-0 z-10 flex items-center justify-center bg-surface-50/10 backdrop-blur-3xl transition-all duration-200 dark:bg-surface-900/40">
								<div className="portfolio-chip border-surface-200/20 bg-surface-50/10 backdrop-blur-md dark:border-surface-800/20 dark:bg-surface-900/10">
									<Lock
										weight="fill"
										className="size-3 text-surface-900 opacity-60 dark:text-surface-100"
									/>
									<span className="text-surface-900 opacity-80 dark:text-surface-100">
										Coming Soon
									</span>
								</div>
							</div>
						)}
					</div>
				) : (
					<section
						className="relative aspect-[16/9] w-full overflow-hidden bg-surface-100 dark:bg-surface-800"
						aria-label="No preview available"
					>
						<div className="flex h-full w-full items-center justify-center">
							<span className="portfolio-kicker text-surface-400">No Preview</span>
						</div>
					</section>
				)}

				{/* DATA ZONE — Solid Background, Maximum Legibility */}
				<div className="portfolio-box-pad portfolio-stack-group">
					<div className="portfolio-stack-related">
						{/* Meta Layer: Functional Data — ZERO BORDERS, PURE SPACE */}
						<div className="flex items-center justify-between gap-[var(--portfolio-space-2)]">
							<span className="portfolio-kicker text-surface-500 dark:text-surface-400">
								{index}
							</span>
							{date && (
								<span className="portfolio-kicker text-surface-500 dark:text-surface-400">
									{date}
								</span>
							)}
						</div>

						{/* Identity Layer: Title & Action — OPTICALLY CENTERED */}
						<div className="flex flex-col items-start gap-[var(--portfolio-space-2)] sm:flex-row sm:items-center sm:justify-between">
							<h3 className="portfolio-heading-sm portfolio-capsize-heading-sm text-surface-900 dark:text-surface-50">
								{title}
							</h3>

							<div className="flex size-[var(--portfolio-control-default)] shrink-0 items-center justify-center rounded-full border border-surface-200 bg-surface-50 transition-all duration-200 group-hover:border-surface-900 group-hover:bg-surface-900 dark:border-surface-700 dark:bg-surface-900 dark:group-hover:border-surface-100 dark:group-hover:bg-surface-100">
								{isPrivate ? (
									<Lock
										weight="bold"
										className="size-[var(--portfolio-icon-sm)] text-surface-600 transition-colors duration-200 group-hover:text-surface-50 dark:text-surface-400 dark:group-hover:text-surface-900"
									/>
								) : (
									<ArrowUpRight
										weight="bold"
										className="size-[var(--portfolio-icon-sm)] text-surface-600 transition-colors duration-200 group-hover:text-surface-50 dark:text-surface-400 dark:group-hover:text-surface-900"
									/>
								)}
							</div>
						</div>
					</div>

					<p className="portfolio-body-sm line-clamp-2 text-surface-600 dark:text-surface-400">
						{description}
					</p>

					{(challenge || solution) && (
						<div className="portfolio-stack-group">
							{challenge && (
								<div className="portfolio-card-copy">
									<h4 className="portfolio-kicker text-surface-400">Challenge</h4>
									<p className="portfolio-body-sm text-surface-700 dark:text-surface-300">
										{challenge}
									</p>
								</div>
							)}
							{solution && (
								<div className="portfolio-card-copy">
									<h4 className="portfolio-kicker text-surface-400">Solution</h4>
									<p className="portfolio-body-sm text-surface-700 dark:text-surface-300">
										{solution}
									</p>
								</div>
							)}
						</div>
					)}

					<div className="flex flex-wrap gap-[var(--portfolio-space-tight)]">
						{tags.map((tag) => (
							<span key={`${index}-tag-${tag}`} className="portfolio-chip">
								{tag}
							</span>
						))}
					</div>
				</div>
			</>
		);
	}
}
