/**
 * Project card with rich media gallery and split navigation zones.
 *
 * @public
 */

"use client";

import { ArrowUpRight, Lock } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import type { StaticImageData } from "next/image";
import Link from "next/link";
import { Play } from "@phosphor-icons/react/dist/ssr";
import type { ComponentType } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { GalleryMediaSource } from "@/src/lib/gallery-media";
import { resolveAsset } from "@/src/lib/assets";
import { cn } from "@/src/lib/index";
import type { MediaGalleryProps } from "@/src/components/ui/media-gallery";

type MediaGalleryComponent = ComponentType<MediaGalleryProps>;

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
	enableHoverPreview?: boolean;
	mediaQuality?: number;
	deferMediaLoading?: boolean;
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
	prioritizeFirstImage = false,
	enableHoverPreview = true,
	mediaQuality = 75,
	deferMediaLoading = true,
}: ProjectCardGalleryProps) {
	const stageRef = useRef<HTMLDivElement>(null);
	const [RichMediaGallery, setRichMediaGallery] = useState<MediaGalleryComponent | null>(null);
	const [shouldLoadRichMedia, setShouldLoadRichMedia] = useState(
		!deferMediaLoading || prioritizeFirstImage,
	);
	const isRichMediaLoading = shouldLoadRichMedia && !RichMediaGallery;
	const hasGalleryItems = (items?.length ?? 0) > 0 || (images?.length ?? 0) > 0;
	const hasInlineVideo = useMemo(
		() => (items?.some((item) => item.kind === "mux-video") ?? false),
		[items],
	);
	const fallbackMedia = useMemo(() => {
		const firstItem = items?.[0];
		if (firstItem) {
			if (firstItem.kind === "image") {
				return {
					kind: "image" as const,
					src: typeof firstItem.src === "string" ? resolveAsset(firstItem.src) : firstItem.src,
					alt: firstItem.alt ?? title,
				};
			}

			return {
				kind: "mux-video" as const,
				src:
					typeof firstItem.poster === "string"
						? resolveAsset(firstItem.poster)
						: firstItem.poster,
				alt: firstItem.alt ?? firstItem.title ?? title,
				duration: firstItem.duration,
			};
		}

		const firstImage = images?.[0];
		if (!firstImage) return null;
		return {
			kind: "image" as const,
			src: typeof firstImage === "string" ? resolveAsset(firstImage) : firstImage,
			alt: title,
		};
	}, [images, items, title]);

	useEffect(() => {
		if (shouldLoadRichMedia || !deferMediaLoading) return;

		const stage = stageRef.current;
		if (!stage) return;

		if (!("IntersectionObserver" in window)) {
			setShouldLoadRichMedia(true);
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				if (!entries.some((entry) => entry.isIntersecting)) return;
				setShouldLoadRichMedia(true);
				observer.disconnect();
			},
			{ rootMargin: "320px 0px" },
		);

		observer.observe(stage);
		return () => observer.disconnect();
	}, [deferMediaLoading, shouldLoadRichMedia]);

	useEffect(() => {
		if (!shouldLoadRichMedia || RichMediaGallery) return;

		let cancelled = false;

		void Promise.all([
			import("@/src/components/ui/media-gallery"),
			hasInlineVideo
				? import("@/src/components/ui/portfolio-mux-video")
				: Promise.resolve(null),
		]).then(([module]) => {
			if (cancelled) return;
			setRichMediaGallery(() => module.MediaGallery as MediaGalleryComponent);
		});

		return () => {
			cancelled = true;
		};
	}, [RichMediaGallery, hasInlineVideo, shouldLoadRichMedia]);

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
					ref={stageRef}
					className={cn(
						"relative overflow-hidden",
						imageTreatment === "disciplined" && [
							"shadow-[inset_0_-1px_0_rgba(15,23,42,0.08)] dark:shadow-[inset_0_-1px_0_rgba(248,250,252,0.08)]",
						],
					)}
				>
					{shouldLoadRichMedia && RichMediaGallery ? (
						<RichMediaGallery
							items={items}
							images={images}
							altPrefix={title}
							aspectRatio={imageAspectRatio}
							prioritizeFirstImage={prioritizeFirstImage}
							showArrows={!isPrivate}
							showProgress={!isPrivate}
							showCounter={false}
							expandable={false}
							enableHoverPreview={enableHoverPreview}
							className="border-0 border-surface-200 border-b dark:border-surface-800"
							sizes="(max-width: 768px) 100vw, (max-width: 1400px) calc(100vw - 8rem), 1280px"
							quality={mediaQuality}
						/>
					) : fallbackMedia ? (
						<div
							className="relative aspect-[16/9] w-full overflow-hidden border-0 border-surface-200 border-b bg-surface-100 dark:border-surface-800 dark:bg-surface-900"
							aria-label={fallbackMedia.alt}
							aria-busy={isRichMediaLoading || undefined}
						>
							<Image
								src={fallbackMedia.src}
								alt={fallbackMedia.alt}
								fill
								sizes="(max-width: 768px) 100vw, (max-width: 1400px) calc(100vw - 8rem), 1280px"
								className="pointer-events-none select-none object-cover"
								placeholder={typeof fallbackMedia.src === "string" ? "empty" : "blur"}
								decoding="async"
								draggable={false}
								quality={mediaQuality}
							/>

							{fallbackMedia.kind === "mux-video" && (
								<>
									<div
										className="pointer-events-none absolute inset-0"
										style={{
											background:
												"radial-gradient(circle at center, rgb(0 0 0 / 0) 36%, rgb(0 0 0 / 0.14) 100%)",
										}}
										aria-hidden
									/>
									<div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-[var(--portfolio-control-pad-default)]">
										<div
											className={cn(
												"inline-flex h-[var(--portfolio-control-default)] items-center gap-2 border border-white/12 bg-black/92 px-[var(--portfolio-control-pad-default)] text-white shadow-[0_10px_30px_rgba(0,0,0,0.18)] backdrop-blur-md",
											)}
										>
											{isRichMediaLoading ? (
												<span
													className="size-[14px] animate-spin rounded-full border border-white/30 border-t-white"
													aria-hidden="true"
												/>
											) : (
												<Play size={14} weight="fill" />
											)}
											<span className="portfolio-control-label">
												{isRichMediaLoading ? "Loading" : "Play"}
											</span>
											{fallbackMedia.duration ? (
												<>
													<span
														aria-hidden
														className="h-3 w-px self-center bg-white/16"
													/>
													<span className="portfolio-chip-label text-white/72 tabular-nums">
														{fallbackMedia.duration}
													</span>
												</>
											) : null}
										</div>
									</div>
								</>
							)}
						</div>
					) : null}
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
								className="block w-full text-surface-900 transition-colors hover:text-surface-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface-900/15 focus-visible:ring-offset-2 dark:text-surface-50 dark:focus-visible:ring-surface-50/20 dark:hover:text-white"
							>
								<span className="flex w-full items-center justify-between gap-[var(--portfolio-space-group)]">
									<h3 className="portfolio-heading-sm portfolio-capsize-heading-sm">
										{title}
									</h3>
									<span className="mt-0.5 flex h-10 min-w-10 items-center justify-center bg-surface-900 text-surface-50 transition-[background-color,color,transform] duration-200 group-hover:bg-surface-800 dark:bg-surface-50 dark:text-surface-950 dark:group-hover:bg-surface-200">
										<ArrowUpRight weight="bold" className="size-4" />
									</span>
								</span>
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
