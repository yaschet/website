"use client";
import { RiArrowRightUpLine as ArrowUpRight, RiLockLine as Lock } from "@remixicon/react";

/**
 * Project card with rich media gallery and split navigation zones.
 *
 * @public
 */

import type { StaticImageData } from "next/image";
import Image from "next/image";
import type { ComponentType } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { GalleryPlayButton } from "@/src/components/ui/gallery-play-button";
import { LinkFeedback } from "@/src/components/ui/link-feedback";
import type { MediaGalleryProps } from "@/src/components/ui/media-gallery";
import { PortfolioLink as Link } from "@/src/components/ui/portfolio-link";
import { ProjectTechnologyRail } from "@/src/components/ui/project-technology-rail";
import { ReelIcon } from "@/src/components/ui/reel";
import type { ProjectOverview } from "@/src/content/types";
import { resolveAsset } from "@/src/lib/assets";
import type { GalleryMediaSource } from "@/src/lib/gallery-media";
import { cn } from "@/src/lib/index";
import { Badge } from "./badge";

type MediaGalleryComponent = ComponentType<MediaGalleryProps>;

// Full-width cards share PageContainer's 1024px cap and 20px page gutters.
const PROJECT_PREVIEW_SIZES = "(min-width: 1024px) 984px, calc(100vw - 40px)";

interface ProjectCardGalleryProps {
	title: string;
	description: string;
	overview?: ProjectOverview;
	role?: string;
	status?: string;
	href: string;
	items?: GalleryMediaSource[];
	images?: (string | StaticImageData)[];
	index: string;
	tags: string[];
	technologyHighlights?: readonly string[];
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
	overview,
	role,
	status,
	href,
	items,
	images,
	index,
	tags,
	technologyHighlights,
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
	const [RichMediaGallery, setRichMediaGallery] = useState<MediaGalleryComponent | null>(null);
	const [requestedPlaybackId, setRequestedPlaybackId] = useState<string | null>(null);
	const [shouldLoadRichMedia, setShouldLoadRichMedia] = useState(!deferMediaLoading);
	const isRichMediaLoading = shouldLoadRichMedia && !RichMediaGallery;
	const hasGalleryItems = (items?.length ?? 0) > 0 || (images?.length ?? 0) > 0;
	const hasInlineVideo = useMemo(
		() => items?.some((item) => item.kind === "mux-video") ?? false,
		[items],
	);
	const fallbackMedia = useMemo(() => {
		const firstItem = items?.[0];
		if (firstItem) {
			if (firstItem.kind === "image") {
				return {
					kind: "image" as const,
					src:
						typeof firstItem.src === "string"
							? resolveAsset(firstItem.src)
							: firstItem.src,
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
	const fallbackPlaybackId = items?.[0]?.kind === "mux-video" ? items[0].playbackId : null;
	const attribution = overview ? [role, status].filter((value) => Boolean(value)) : [];

	const triggerRichMediaLoad = useCallback(() => {
		if (shouldLoadRichMedia) return;
		setShouldLoadRichMedia(true);
	}, [shouldLoadRichMedia]);

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

	const heading = (
		<>
			<h3 className="portfolio-project-title portfolio-capsize-project-title min-w-0">
				{title}
			</h3>
			{!isPrivate && (
				<span data-project-action="" aria-hidden="true">
					<LinkFeedback
						iconOnly
						icon={
							<ReelIcon direction="up-right">
								<ArrowUpRight className="size-4" />
							</ReelIcon>
						}
					/>
				</span>
			)}
		</>
	);
	const caption = (
		<>
			<div data-slot="project-overview" className="portfolio-project-overview">
				<div className="portfolio-project-identity">
					{!overview && (
						<div className="portfolio-project-metadata text-muted-foreground tabular-nums">
							<span>{index}</span>
							{date && (
								<>
									<span aria-hidden="true">·</span>
									<span>{date}</span>
								</>
							)}
						</div>
					)}
					{isPrivate ? (
						<div className="portfolio-project-heading">{heading}</div>
					) : (
						<Link
							transitionTypes={["navigation"]}
							data-reel-trigger=""
							href={href}
							prefetch={true}
							className="portfolio-project-heading portfolio-project-link"
						>
							{heading}
						</Link>
					)}
					{attribution.length > 0 && (
						<p className="portfolio-project-attribution portfolio-project-metadata text-muted-foreground">
							{attribution.join(" · ")}
						</p>
					)}
				</div>

				<div className="portfolio-project-details">
					<div
						className={cn(
							"portfolio-project-summary",
							overview && "portfolio-project-narrative",
						)}
					>
						<p
							className="portfolio-project-description portfolio-body-sm text-muted-foreground"
							data-slot={overview ? "project-problem" : undefined}
						>
							{overview?.problem ?? description}
						</p>
						{overview && (
							<p
								className="portfolio-project-description portfolio-body-sm"
								data-slot="project-solution"
							>
								{overview.solution}
							</p>
						)}
						{!overview && challenge && (
							<div className="portfolio-card-copy">
								<h4 className="portfolio-kicker text-surface-600 dark:text-surface-400">
									Challenge
								</h4>
								<p className="portfolio-body-sm text-surface-700 dark:text-surface-300">
									{challenge}
								</p>
							</div>
						)}
						{!overview && solution && (
							<div className="portfolio-card-copy">
								<h4 className="portfolio-kicker text-surface-600 dark:text-surface-400">
									Solution
								</h4>
								<p className="portfolio-body-sm text-surface-700 dark:text-surface-300">
									{solution}
								</p>
							</div>
						)}
					</div>
				</div>
			</div>

			<ProjectTechnologyRail
				technologies={tags}
				highlights={technologyHighlights}
				projectTitle={title}
			/>
		</>
	);

	return (
		<article
			aria-label={title}
			data-slot="project-card"
			data-navigable={!isPrivate || undefined}
			className={cn(
				"portfolio-project-card group w-full min-w-0 bg-[var(--portfolio-panel)] text-card-foreground",
				className,
			)}
		>
			{hasGalleryItems && (
				<div
					data-slot="project-preview"
					className={cn(
						"relative overflow-hidden",
						imageTreatment === "disciplined" && "portfolio-project-preview",
					)}
					onPointerEnter={(event) => {
						if (event.pointerType === "mouse") triggerRichMediaLoad();
					}}
					onTouchStartCapture={fallbackPlaybackId ? undefined : triggerRichMediaLoad}
				>
					{shouldLoadRichMedia && RichMediaGallery ? (
						<RichMediaGallery
							items={items}
							images={images}
							altPrefix={title}
							aspectRatio={imageAspectRatio}
							prioritizeFirstImage={prioritizeFirstImage}
							enableKeyboard={false}
							showArrows={!isPrivate}
							showProgress={!isPrivate}
							showCounter={false}
							expandable={false}
							enableHoverPreview={enableHoverPreview}
							requestedPlaybackId={requestedPlaybackId}
							className="border-0"
							sizes={PROJECT_PREVIEW_SIZES}
							quality={mediaQuality}
						/>
					) : fallbackMedia ? (
						<div
							className="relative aspect-[16/9] w-full overflow-hidden bg-muted"
							aria-busy={isRichMediaLoading || undefined}
						>
							<Image
								src={fallbackMedia.src}
								alt={fallbackMedia.alt}
								fill
								sizes={PROJECT_PREVIEW_SIZES}
								className="pointer-events-none select-none object-cover"
								placeholder={
									typeof fallbackMedia.src === "string" ? "empty" : "blur"
								}
								decoding="async"
								draggable={false}
								priority={prioritizeFirstImage}
								fetchPriority={prioritizeFirstImage ? "high" : undefined}
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
										<GalleryPlayButton
											loading={
												isRichMediaLoading && requestedPlaybackId !== null
											}
											duration={fallbackMedia.duration}
											onClick={(event) => {
												event.preventDefault();
												event.stopPropagation();
												if (!fallbackPlaybackId) return;
												setRequestedPlaybackId(fallbackPlaybackId);
												triggerRichMediaLoad();
											}}
										/>
									</div>
								</>
							)}
						</div>
					) : null}
					{isPrivate && (
						<div className="absolute inset-0 z-20 flex items-center justify-center bg-surface-50/10 backdrop-blur-3xl transition-all duration-200 dark:bg-surface-900/40">
							<Badge variant="soft">
								<Lock className="size-3 text-surface-900 opacity-60 dark:text-surface-100" />
								<span className="text-surface-900 opacity-80 dark:text-surface-100">
									Coming soon
								</span>
							</Badge>
						</div>
					)}
				</div>
			)}

			<div data-slot="project-copy" className="portfolio-project-copy">
				{caption}
			</div>
		</article>
	);
}
