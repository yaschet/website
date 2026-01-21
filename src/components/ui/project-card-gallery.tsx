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
	className?: string;
}

export function ProjectCardGallery({
	title,
	description,
	href,
	images,
	index,
	tags,
	isPrivate = false,
	className,
}: ProjectCardGalleryProps) {
	const galleryImages = images && images.length > 0 ? images : [];

	return (
		<Link
			href={href}
			className={cn(
				"group block w-full overflow-hidden rounded-[var(--radius)]",
				"border border-surface-200 bg-surface-50 dark:border-surface-800 dark:bg-surface-900",
				"transition-shadow duration-300 hover:shadow-lg",
				className,
			)}
		>
			{/* IMAGE ZONE — Interactive Gallery */}
			{galleryImages.length > 0 ? (
				<ImageGallery
					images={galleryImages}
					altPrefix={title}
					aspectRatio="16/9"
					showArrows={galleryImages.length > 1}
					showProgress={galleryImages.length > 1}
					showCounter={false}
					className="border-0 border-surface-200 border-b dark:border-surface-800"
					sizes="(max-width: 768px) 100vw, 768px"
					quality={75}
				/>
			) : (
				<section
					className="relative aspect-[16/9] w-full overflow-hidden bg-surface-100 dark:bg-surface-800"
					aria-label="No preview available"
				>
					<div className="flex h-full w-full items-center justify-center">
						<span className="font-mono text-surface-400 text-xs uppercase tracking-wider">
							No Preview
						</span>
					</div>
				</section>
			)}

			{/* DATA ZONE — Solid Background, Maximum Legibility */}
			<div className="p-6">
				{/* Header Row */}
				<div className="mb-3 flex items-start justify-between gap-4">
					<div className="flex items-baseline gap-3">
						<span className="font-mono text-surface-500 text-xs dark:text-surface-400">
							{index}
						</span>
						<h3 className="font-medium text-lg text-surface-900 dark:text-surface-50">
							{title}
						</h3>
					</div>

					{/* Action Icon */}
					<div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-surface-200 bg-surface-100 transition-all duration-300 group-hover:border-surface-900 group-hover:bg-surface-900 dark:border-surface-700 dark:bg-surface-800 dark:group-hover:border-surface-100 dark:group-hover:bg-surface-100">
						{isPrivate ? (
							<Lock
								weight="bold"
								className="size-3.5 text-surface-600 transition-colors duration-300 group-hover:text-surface-50 dark:text-surface-400 dark:group-hover:text-surface-900"
							/>
						) : (
							<ArrowUpRight
								weight="bold"
								className="size-3.5 text-surface-600 transition-all duration-300 group-hover:translate-x-px group-hover:-translate-y-px group-hover:text-surface-50 dark:text-surface-400 dark:group-hover:text-surface-900"
							/>
						)}
					</div>
				</div>

				{/* Description */}
				<p className="mb-4 line-clamp-2 text-sm text-surface-600 dark:text-surface-400">
					{description}
				</p>

				{/* Tags — Hard Edge (0 radius) */}
				<div className="flex flex-wrap gap-1.5">
					{tags.map((tag) => (
						<span
							key={`${index}-tag-${tag}`}
							className="inline-block border border-surface-200 bg-surface-100 px-2 py-0.5 font-mono text-[10px] text-surface-700 uppercase tracking-wide dark:border-surface-700 dark:bg-surface-800 dark:text-surface-300"
						>
							{tag}
						</span>
					))}
				</div>
			</div>
		</Link>
	);
}
