import { calculateReadingTime } from "../src/content/reading-time";
import { type PostEntry, postMetadataSchema } from "../src/content/types";
import ArticleContent, { metadata } from "./fixtures/article-preview.mdx?content";
import source from "./fixtures/article-preview.mdx?raw";

/** Unpublished layout content, outside the website's content directory. */
export const articlePreview: PostEntry = {
	...postMetadataSchema.parse(metadata),
	id: "post:workshop-article",
	slug: "workshop-article",
	urlPath: "/blog/workshop-article",
	readingTime: calculateReadingTime(source),
	Content: ArticleContent,
};

export const longArticlePreview: PostEntry = {
	...articlePreview,
	title: "A longer article heading about the decisions, constraints and tradeoffs behind a production system",
	description:
		"Workshop-only copy for checking multi-line titles and descriptions without clipping, crowding the metadata, or changing the reading width on mobile.",
};
