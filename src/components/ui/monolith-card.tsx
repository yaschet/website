/**
 * Card component with image gallery and detail sections.
 *
 * @remarks
 * Displays a project or product with a scrubbable image gallery,
 * data fields, and technical details. Features 0px radius styling.
 * Supports both public and private (locked) project states.
 *
 * @example
 * ```tsx
 * <MonolithCard
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
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { type MouseEvent, useState } from "react";
import { cn } from "@/src/lib/index";

interface MonolithCardProps {
	title: string;
	description: string;
	href: string;
	images?: (string | StaticImageData)[];
	index: string;
	tags: string[];
	isPrivate?: boolean;
	className?: string;
}

export function MonolithCard({
	title,
	description,
	href,
	images,
	index,
	tags,
	isPrivate = false,
	className,
}: MonolithCardProps) {
	const [activeIndex, setActiveIndex] = useState(0);

	const galleryImages = images && images.length > 0 ? images : [];
	const hasGallery = galleryImages.length > 1;

	// Image Scrubbing Logic
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
		<Link
			href={href}
			className={cn(
				"group block w-full overflow-hidden rounded-[var(--radius)]",
				"border border-surface-200 bg-surface-50 dark:border-surface-800 dark:bg-surface-900",
				"transition-shadow duration-300 hover:shadow-lg",
				className,
			)}
		>
			{/* IMAGE ZONE — Clean Specimen Display */}
			<section
				className="relative aspect-[16/9] w-full overflow-hidden bg-surface-100 dark:bg-surface-800"
				onMouseMove={handleMouseMove}
				onMouseLeave={handleMouseLeave}
				aria-label="Image gallery scrub zone"
			>
				{galleryImages.length > 0 ? (
					<>
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
									key={`${title}-img-${typeof src === "string" ? src : src.src}`}
									className="relative h-full w-full flex-1"
								>
									<Image
										src={src}
										alt={`${title} - View ${i + 1}`}
										fill
										sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
										className="object-cover"
										placeholder={typeof src !== "string" ? "blur" : undefined}
										quality={90}
									/>
								</div>
							))}
						</div>

						{/* Gallery Indicators */}
						{hasGallery && (
							<div className="absolute inset-x-0 bottom-0 flex gap-0.5 p-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
								{galleryImages.map((src, i) => (
									<div
										key={`${title}-ind-${typeof src === "string" ? src : src.src}`}
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
					</>
				) : (
					// Placeholder
					<div className="flex h-full w-full items-center justify-center">
						<span className="font-mono text-surface-400 text-xs uppercase tracking-wider">
							No Preview
						</span>
					</div>
				)}
			</section>

			{/* DATA ZONE — Solid Background, Maximum Legibility */}
			<div className="p-5">
				{/* Header Row */}
				<div className="mb-3 flex items-start justify-between gap-4">
					<div className="flex items-baseline gap-3">
						<span className="font-mono text-surface-400 text-xs dark:text-surface-500">
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
							className="inline-block border border-surface-200 bg-surface-100 px-2 py-0.5 font-mono text-[10px] text-surface-500 uppercase tracking-wide dark:border-surface-700 dark:bg-surface-800 dark:text-surface-400"
						>
							{tag}
						</span>
					))}
				</div>
			</div>
		</Link>
	);
}
