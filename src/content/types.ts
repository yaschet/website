import type { MDXComponents } from "mdx/types";
import type { ComponentType } from "react";
import { z } from "zod";

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
	date: z.string(),
	tags: z.array(z.string()).default([]),
	tech: z.array(z.string()).default([]),
	role: z.string().optional(),
	stack: z.array(z.string()).optional(),
	status: z.string().optional(),
	url: z.string().optional(),
	github: z.string().optional(),
	image: z.string().optional(),
	coverImages: z.array(z.string()).optional(),
	featured: z.boolean().default(false),
	hideCoverGallery: z.boolean().default(false),
	seoKeywords: z.array(z.string()).optional(),
});

export type PostMetadata = z.infer<typeof postMetadataSchema>;
export type ProjectMetadata = z.infer<typeof projectMetadataSchema>;

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

export type PostEntry = BaseEntry<PostMetadata>;
export type ProjectEntry = BaseEntry<ProjectMetadata>;
