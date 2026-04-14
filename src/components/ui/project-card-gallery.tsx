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
				"transition-shadow duration-300 hover:shadow-lg",
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
					<div className="relative">
						<ImageGallery
							images={galleryImages}
							altPrefix={title}
							aspectRatio="16/9"
							showArrows={galleryImages.length > 1 && !isPrivate}
							showProgress={galleryImages.length > 1 && !isPrivate}
							showCounter={false}
							className="border-0 border-surface-200 border-b dark:border-surface-800"
							sizes="(max-width: 768px) 100vw, 768px"
							quality={75}
						/>
						{isPrivate && (
							<div className="absolute inset-0 z-10 flex items-center justify-center bg-surface-50/10 backdrop-blur-3xl transition-all duration-500 dark:bg-surface-900/40">
								<div className="flex items-center gap-2.5 rounded-full border border-surface-200/20 bg-surface-50/10 px-5 py-2.5 backdrop-blur-md dark:border-surface-800/20 dark:bg-surface-900/10">
									<Lock
										weight="fill"
										className="size-3 text-surface-900 opacity-60 dark:text-surface-100"
									/>
									<span className="portfolio-kicker text-surface-900 opacity-80 dark:text-surface-100">
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
				<div className="portfolio-box-pad">
					{/* Header Row */}
					<div className="mb-5 flex flex-col gap-5">
						{/* Meta Layer: Functional Data — ZERO BORDERS, PURE SPACE */}
						<div className="flex items-center justify-between">
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
						<div className="flex items-center justify-between gap-5">
							<h3 className="portfolio-heading-sm portfolio-capsize-heading-sm text-surface-900 dark:text-surface-50">
								{title}
							</h3>

							{/* Action Icon */}
							<div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-surface-200 bg-surface-50 transition-all duration-300 group-hover:border-surface-900 group-hover:bg-surface-900 dark:border-surface-700 dark:bg-surface-900 dark:group-hover:border-surface-100 dark:group-hover:bg-surface-100">
								{isPrivate ? (
									<Lock
										weight="bold"
										className="size-4 text-surface-600 transition-colors duration-300 group-hover:text-surface-50 dark:text-surface-400 dark:group-hover:text-surface-900"
									/>
								) : (
									<ArrowUpRight
										weight="bold"
										className="size-4 text-surface-600 transition-colors duration-300 group-hover:text-surface-50 dark:text-surface-400 dark:group-hover:text-surface-900"
									/>
								)}
							</div>
						</div>
					</div>

					{/* Description */}
					<p className="portfolio-body-sm mb-5 line-clamp-2 text-surface-600 dark:text-surface-400">
						{description}
					</p>

					{/* Extended Details (Challenge / Solution) — Vertical Stack for Editorial Feel */}
					{(challenge || solution) && (
						<div className="mb-5 space-y-5">
							{challenge && (
								<div className="space-y-2.5">
									<h4 className="portfolio-kicker text-surface-400">Challenge</h4>
									<p className="portfolio-body-sm text-surface-700 dark:text-surface-300">
										{challenge}
									</p>
								</div>
							)}
							{solution && (
								<div className="space-y-2.5">
									<h4 className="portfolio-kicker text-surface-400">Solution</h4>
									<p className="portfolio-body-sm text-surface-700 dark:text-surface-300">
										{solution}
									</p>
								</div>
							)}
						</div>
					)}

					{/* Tags — Hard Edge (0 radius) */}
					<div className="flex flex-wrap gap-2.5">
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
