import type { MDXComponents } from "mdx/types";
import type { ComponentType } from "react";
import { z } from "zod";

const muxVideoMetadataSchema = z.object({
	video_title: z.string().optional(),
	video_id: z.string().optional(),
	viewer_user_id: z.string().optional(),
});

const galleryImageItemSchema = z.object({
	kind: z.literal("image"),
	src: z.string(),
	alt: z.string().optional(),
	caption: z.string().optional(),
});

const galleryMuxVideoItemSchema = z.object({
	kind: z.literal("mux-video"),
	playbackId: z.string(),
	poster: z.string(),
	title: z.string().optional(),
	alt: z.string().optional(),
	caption: z.string().optional(),
	duration: z.string().optional(),
	metadata: muxVideoMetadataSchema.optional(),
});

export const galleryMediaItemSchema = z.discriminatedUnion("kind", [
	galleryImageItemSchema,
	galleryMuxVideoItemSchema,
]);

export const postMetadataSchema = z.object({
	title: z.string(),
	description: z.string(),
	date: z.string(),
	tags: z.array(z.string()).default([]),
	author: z.string().default("Yassine Chettouch"),
	published: z.boolean().default(true),
});

export const projectMetadataSchema = z.object({
	title: z.string(),
	description: z.string(),
	subtitle: z.string().optional(),
	date: z.string(),
	tags: z.array(z.string()).default([]),
	tech: z.array(z.string()).default([]),
	role: z.string().optional(),
	domain: z.string().optional(),
	stack: z.array(z.string()).optional(),
	status: z.string().optional(),
	url: z.string().optional(),
	github: z.string().optional(),
	image: z.string().optional(),
	coverImages: z.array(z.string()).optional(),
	coverMedia: z.array(galleryMediaItemSchema).optional(),
	featured: z.boolean().default(false),
	hideCoverGallery: z.boolean().default(false),
	seoKeywords: z.array(z.string()).optional(),
	sortOrder: z.number().optional(),
	listed: z.boolean().default(true),
	cardState: z.enum(["public", "coming-soon"]).default("public"),
});

export type PostMetadata = z.infer<typeof postMetadataSchema>;
export type ProjectMetadata = z.infer<typeof projectMetadataSchema>;
export type GalleryMediaItem = z.infer<typeof galleryMediaItemSchema>;
export type MuxVideoMetadata = z.infer<typeof muxVideoMetadataSchema>;

export type MDXContentComponent = ComponentType<{
	components?: MDXComponents;
}>;

type BaseEntry<TMetadata> = TMetadata & {
	id: string;
	slug: string;
	urlPath: string;
	readingTime: number;
	Content: MDXContentComponent;
};

type BaseSummaryEntry<TMetadata> = TMetadata & {
	id: string;
	slug: string;
	urlPath: string;
};

export type PostEntry = BaseEntry<PostMetadata>;
export type ProjectEntry = BaseEntry<ProjectMetadata>;
export type ProjectSummaryEntry = BaseSummaryEntry<ProjectMetadata>;
