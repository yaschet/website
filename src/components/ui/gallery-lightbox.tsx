"use client";

import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr/ArrowLeft";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import { FilmStripIcon } from "@phosphor-icons/react/dist/ssr/FilmStrip";
import { ImageIcon } from "@phosphor-icons/react/dist/ssr/Image";
import { MinusIcon } from "@phosphor-icons/react/dist/ssr/Minus";
import { PlusIcon } from "@phosphor-icons/react/dist/ssr/Plus";
import { XIcon } from "@phosphor-icons/react/dist/ssr/X";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/src/components/ui/button";
import { GalleryAmbience } from "@/src/components/ui/gallery-ambience";
import { GalleryFilmstrip } from "@/src/components/ui/gallery-filmstrip";
import { GalleryZoomReadout } from "@/src/components/ui/gallery-zoom-readout";
import { ReelIcon } from "@/src/components/ui/reel";
import {
	type GalleryViewerOptions,
	useGalleryViewer,
} from "@/src/components/ui/use-gallery-viewer";
import type { GalleryMediaSource } from "@/src/lib/gallery-media";
import styles from "./gallery-viewer.module.css";
import "photoswipe/style.css";

const PortfolioMuxVideo = dynamic(
	() =>
		import("@/src/components/ui/portfolio-mux-video").then(
			(module) => module.PortfolioMuxVideo,
		),
	{ ssr: false },
);

function itemTitle(item: GalleryMediaSource | undefined, index: number) {
	return item?.title || item?.alt || `Gallery media ${index + 1}`;
}

/** A cinematic media stage with fixed, contrast-protected controls above its zoom layer. */
export function GalleryLightbox(props: GalleryViewerOptions) {
	const viewer = useGalleryViewer(props);
	const current = props.items[viewer.index];
	const title = itemTitle(current, viewer.index);
	const caption = current?.caption;
	const multiple = props.items.length > 1;
	const targetIndex = viewer.pendingIndex ?? viewer.index;
	const root = viewer.chrome?.closest<HTMLElement>(".pswp");
	const background = root?.querySelector<HTMLElement>(".pswp__bg");
	useEffect(() => {
		if (viewer.ready && !viewer.closing)
			viewer.chrome
				?.querySelector<HTMLButtonElement>("[data-gallery-close]")
				?.focus({ preventScroll: true });
	}, [viewer.ready, viewer.closing, viewer.chrome]);

	return (
		<>
			{background &&
				root &&
				current &&
				createPortal(
					<GalleryAmbience root={root} item={current} closing={viewer.closing} />,
					background,
				)}
			{viewer.chrome &&
				createPortal(
					<>
						<header
							className={`${styles.header} ${styles.glass}`}
							data-gallery-interactive
						>
							<div className={styles.identity}>
								<div className={styles.iconChamber} aria-hidden="true">
									{current?.kind === "image" ? (
										<ImageIcon size={20} weight="bold" />
									) : (
										<FilmStripIcon size={20} weight="bold" />
									)}
								</div>
								<div key={viewer.index} className={styles.heading}>
									<h2 id={viewer.titleId} className={styles.title}>
										{title}
									</h2>
									<p id={viewer.descriptionId} className={styles.caption}>
										{caption && caption !== title ? (
											caption
										) : current?.kind === "image" ? (
											<>
												<span className={styles.pointerHint}>
													{multiple ? "Drag to browse · " : ""}
													Double-click to zoom
												</span>
												<span className={styles.touchHint}>
													{multiple ? "Swipe to browse · " : ""}Pinch to
													zoom
												</span>
											</>
										) : (
											"Video walkthrough"
										)}
									</p>
								</div>
							</div>
							<Button
								variant="soft"
								color="primary"
								size="icon-xl"
								data-gallery-close
								className={`${styles.control} ${styles.close}`}
								aria-label="Close expanded viewer"
								onClick={(event) => viewer.close(event.detail === 0)}
								icon={<XIcon className="size-5" weight="bold" />}
							/>
						</header>
						{multiple && (
							<fieldset
								className={styles.navigation}
								aria-label="Gallery navigation"
								data-gallery-interactive
							>
								<Button
									variant="plain"
									color="primary"
									size="icon-xl"
									data-reel-trigger=""
									className={`${styles.control} ${styles.previous} ${styles.glass}`}
									aria-label="Previous slide"
									disabled={targetIndex === 0}
									onClick={(event) =>
										viewer.navigate(targetIndex - 1, event.detail === 0)
									}
									icon={
										<ReelIcon direction="left">
											<ArrowLeftIcon className="size-5" weight="bold" />
										</ReelIcon>
									}
								/>
								<Button
									variant="plain"
									color="primary"
									size="icon-xl"
									data-reel-trigger=""
									className={`${styles.control} ${styles.next} ${styles.glass}`}
									aria-label="Next slide"
									disabled={targetIndex === props.items.length - 1}
									onClick={(event) =>
										viewer.navigate(targetIndex + 1, event.detail === 0)
									}
									icon={
										<ReelIcon>
											<ArrowRightIcon className="size-5" weight="bold" />
										</ReelIcon>
									}
								/>
							</fieldset>
						)}
						{multiple && (
							<footer
								className={`${styles.footer} ${styles.glass}`}
								data-gallery-interactive
							>
								<GalleryFilmstrip
									items={props.items}
									index={viewer.index}
									pendingIndex={viewer.pendingIndex}
									navigate={viewer.navigate}
									prepare={viewer.prepare}
								/>
							</footer>
						)}
						{current?.kind === "image" && (
							<fieldset
								className={`${styles.zoom} ${styles.glass}`}
								aria-label="Image zoom"
								data-gallery-interactive
							>
								<Button
									variant="plain"
									color="primary"
									size="icon-xl"
									className={styles.control}
									disabled={viewer.zoom <= 1.001}
									aria-label="Zoom out"
									onClick={(event) => viewer.changeZoom(-0.5, event.detail === 0)}
									icon={<MinusIcon className="size-4" weight="bold" />}
								/>
								<Button
									variant="plain"
									color="primary"
									size="icon-xl"
									className={`${styles.control} ${styles.zoomValue}`}
									aria-label="Reset zoom to fit"
									onClick={(event) =>
										viewer.changeZoom("fit", event.detail === 0)
									}
								>
									<GalleryZoomReadout
										value={
											viewer.zoom <= 1.001
												? "Fit"
												: `${Math.round(viewer.zoom * 100)}%`
										}
									/>
									<span className="sr-only">
										{viewer.zoom <= 1.001
											? "Fit"
											: `${Math.round(viewer.zoom * 100)}%`}
									</span>
								</Button>
								<Button
									variant="plain"
									color="primary"
									size="icon-xl"
									className={styles.control}
									disabled={viewer.zoom >= 3.999}
									aria-label="Zoom in"
									onClick={(event) => viewer.changeZoom(0.5, event.detail === 0)}
									icon={<PlusIcon className="size-4" weight="bold" />}
								/>
							</fieldset>
						)}
						<p role="status" className="sr-only">
							{viewer.pendingIndex !== null
								? `Preparing slide ${viewer.pendingIndex + 1}`
								: `Slide ${viewer.index + 1} of ${props.items.length}: ${title}`}
						</p>
					</>,
					viewer.chrome,
				)}
			{[...viewer.videos].map(([index, element]) => {
				const item = props.items[index];
				if (item?.kind !== "mux-video") return null;
				return createPortal(
					<PortfolioMuxVideo
						playbackId={item.playbackId}
						poster={item.poster}
						metadata={item.metadata}
						active={index === viewer.index && !viewer.closing}
						variant="lightbox"
						className="h-full w-full"
						onDimensionsChange={(width, height) =>
							viewer.updateVideoDimensions(index, width, height)
						}
					/>,
					element,
					String(index),
				);
			})}
		</>
	);
}
