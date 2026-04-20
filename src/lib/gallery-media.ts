import type { StaticImageData } from "next/image";
import type { GalleryMediaItem, MuxVideoMetadata, ProjectMetadata } from "@/src/content/types";

export type GalleryMediaSource =
	| {
			kind: "image";
			src: string | StaticImageData;
			alt?: string;
			caption?: string;
	  }
	| {
			kind: "mux-video";
			playbackId: string;
			poster: string | StaticImageData;
			title?: string;
			alt?: string;
			caption?: string;
			duration?: string;
			metadata?: MuxVideoMetadata;
	  };

type ProjectCoverMediaShape = Pick<ProjectMetadata, "coverImages" | "coverMedia">;

function legacyImagesToMedia(images?: readonly string[]): GalleryMediaSource[] {
	return (images ?? []).map((src) => ({
		kind: "image",
		src,
	}));
}

export function getProjectCoverMedia(project: ProjectCoverMediaShape): GalleryMediaSource[] {
	if (project.coverMedia?.length) {
		return project.coverMedia as GalleryMediaSource[];
	}

	return legacyImagesToMedia(project.coverImages);
}

function getItemAsset(
	item: GalleryMediaItem | GalleryMediaSource,
): string | StaticImageData | undefined {
	if (item.kind === "image") {
		return item.src;
	}

	return item.poster;
}

function assetToString(asset: string | StaticImageData | undefined): string | null {
	if (!asset) return null;
	return typeof asset === "string" ? asset : asset.src;
}

export function getFirstPresentableMediaAsset(
	items?: readonly GalleryMediaSource[] | readonly GalleryMediaItem[] | null,
	fallbackImages?: readonly string[] | null,
): string | null {
	const mediaItems = items?.length ? items : legacyImagesToMedia(fallbackImages ?? undefined);

	for (const item of mediaItems) {
		const asset = assetToString(getItemAsset(item));
		if (asset) {
			return asset;
		}
	}

	return null;
}
