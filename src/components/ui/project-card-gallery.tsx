/**
 * Project card with rich media gallery and split navigation zones.
 *
 * @public
 */

"use client";

import { ArrowUpRight, Lock } from "@phosphor-icons/react/dist/ssr";
import type { StaticImageData } from "next/image";
import Link from "next/link";
import { ImageGallery } from "@/src/components/ui/image-gallery";
import type { GalleryMediaSource } from "@/src/lib/gallery-media";
import { cn } from "@/src/lib/index";

interface ProjectCardGalleryProps {
	title: string;
	description: string;
	href: string;
	items?: GalleryMediaSource[];
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
	prioritizeFirstImage?: boolean;
}

export function ProjectCardGallery({
	title,
	description,
	href,
	items,
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
	prioritizeFirstImage = true,
}: ProjectCardGalleryProps) {
	const hasGalleryItems = (items?.length ?? 0) > 0 || (images?.length ?? 0) > 0;

	return (
		<article
			className={cn(
				"group w-full overflow-hidden rounded-[var(--radius)]",
				"border border-surface-200/80 bg-white shadow-[0_1px_1px_rgba(15,23,42,0.03),0_10px_24px_rgba(15,23,42,0.05)]",
				"transition-[border-color,box-shadow] duration-200 hover:border-surface-300 hover:shadow-[0_6px_16px_rgba(15,23,42,0.07),0_16px_34px_rgba(15,23,42,0.06)]",
				"dark:border-surface-800 dark:bg-surface-950 dark:shadow-[0_1px_0_rgba(255,255,255,0.03),0_14px_32px_rgba(0,0,0,0.42)] dark:hover:border-surface-700 dark:hover:shadow-[0_1px_0_rgba(255,255,255,0.04),0_18px_40px_rgba(0,0,0,0.5)]",
				className,
			)}
		>
			{hasGalleryItems ? (
				<div
					className={cn(
						"relative overflow-hidden",
						imageTreatment === "disciplined" && [
							"shadow-[inset_0_-1px_0_rgba(15,23,42,0.08)] dark:shadow-[inset_0_-1px_0_rgba(248,250,252,0.08)]",
						],
					)}
				>
					<ImageGallery
						items={items}
						images={images}
						altPrefix={title}
						aspectRatio={imageAspectRatio}
						prioritizeFirstImage={prioritizeFirstImage}
						showArrows={!isPrivate}
						showProgress={!isPrivate}
						showCounter={false}
						expandable={false}
						className="border-0 border-surface-200 border-b dark:border-surface-800"
						sizes="(max-width: 768px) 100vw, 768px"
						quality={75}
					/>
					{isPrivate && (
						<div className="absolute inset-0 z-20 flex items-center justify-center bg-surface-50/10 backdrop-blur-3xl transition-all duration-200 dark:bg-surface-900/40">
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

			<div className="portfolio-box-pad portfolio-stack-group">
				<div className="portfolio-stack-related">
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

					<div className="flex flex-col items-start gap-[var(--portfolio-space-2)]">
						{isPrivate ? (
							<h3 className="portfolio-heading-sm portfolio-capsize-heading-sm text-surface-900 dark:text-surface-50">
								{title}
							</h3>
						) : (
							<Link
								href={href}
								className="inline-flex items-center gap-3 text-surface-900 transition-colors hover:text-surface-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface-900/15 focus-visible:ring-offset-2 dark:text-surface-50 dark:focus-visible:ring-surface-50/20 dark:hover:text-white"
							>
								<h3 className="portfolio-heading-sm portfolio-capsize-heading-sm">
									{title}
								</h3>
								<span className="mt-0.5 flex h-9 min-w-9 items-center justify-center border border-surface-200 bg-surface-50 text-surface-700 transition-colors duration-200 group-hover:border-surface-300 group-hover:text-surface-900 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-300 dark:group-hover:border-surface-600 dark:group-hover:text-surface-50">
									<ArrowUpRight weight="bold" className="size-4" />
								</span>
							</Link>
						)}

						{!isPrivate && (
							<Link
								href={href}
								className="inline-flex items-center gap-2 font-mono text-[10px] text-surface-600 uppercase tracking-[0.22em] transition-colors hover:text-surface-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface-900/15 focus-visible:ring-offset-2 dark:text-surface-400 dark:focus-visible:ring-surface-50/20 dark:hover:text-surface-50"
							>
								<span>View Case Study</span>
								<ArrowUpRight weight="bold" className="size-3" />
							</Link>
						)}
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
		</article>
	);
}
