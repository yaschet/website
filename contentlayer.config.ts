import { defineDocumentType, makeSource } from "contentlayer2/source-files";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

// ═══════════════════════════════════════════════════════════════════════════
// DOCUMENT TYPES
// ═══════════════════════════════════════════════════════════════════════════

export const Project = defineDocumentType(() => ({
	name: "Project",
	filePathPattern: `projects/**/*.mdx`,
	contentType: "mdx",
	fields: {
		title: {
			type: "string",
			required: true,
		},
		description: {
			type: "string",
			required: true,
		},
		date: {
			type: "date",
			required: true,
		},
		tags: {
			type: "list",
			of: { type: "string" },
			default: [],
		},
		tech: {
			type: "list",
			of: { type: "string" },
			default: [],
		},
		role: {
			type: "string",
			required: false,
		},
		stack: {
			type: "list",
			of: { type: "string" },
			required: false,
		},
		status: {
			type: "string",
			required: false,
		},
		url: {
			type: "string",
			required: false,
		},
		github: {
			type: "string",
			required: false,
		},
		image: {
			type: "string",
			required: false,
		},
		coverImages: {
			type: "list",
			of: { type: "string" },
			required: false,
		},
		featured: {
			type: "boolean",
			default: false,
		},
		hideCoverGallery: {
			type: "boolean",
			default: false,
			required: false,
		},
		seoKeywords: {
			type: "list",
			of: { type: "string" },
			required: false,
		},
	},
	computedFields: {
		slug: {
			type: "string",
			resolve: (doc) => doc._raw.flattenedPath.split("/").pop() || "",
		},
		url_path: {
			type: "string",
			resolve: (doc) => `/projects/${doc._raw.flattenedPath.split("/").pop()}`,
		},
		readingTime: {
			type: "number",
			resolve: (doc) => {
				const wordsPerMinute = 200;
				const textContent = doc.body.raw;
				const wordCount = textContent.split(/\s+/g).length;
				return Math.ceil(wordCount / wordsPerMinute);
			},
		},
	},
}));

export const Post = defineDocumentType(() => ({
	name: "Post",
	filePathPattern: `blog/**/*.mdx`,
	contentType: "mdx",
	fields: {
		title: {
			type: "string",
			required: true,
		},
		description: {
			type: "string",
			required: true,
		},
		date: {
			type: "date",
			required: true,
		},
		tags: {
			type: "list",
			of: { type: "string" },
			default: [],
		},
		author: {
			type: "string",
			default: "Yassine Chettouch",
		},
		published: {
			type: "boolean",
			default: true,
		},
	},
	computedFields: {
		slug: {
			type: "string",
			resolve: (doc) => doc._raw.flattenedPath.split("/").pop() || "",
		},
		url_path: {
			type: "string",
			resolve: (doc) => `/blog/${doc._raw.flattenedPath.split("/").pop()}`,
		},
		readingTime: {
			type: "number",
			resolve: (doc) => {
				// Rough estimate: 200 words per minute
				const wordsPerMinute = 200;
				const textContent = doc.body.raw;
				const wordCount = textContent.split(/\s+/g).length;
				return Math.ceil(wordCount / wordsPerMinute);
			},
		},
	},
}));

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

export default makeSource({
	contentDirPath: "content",
	documentTypes: [Project, Post],
	mdx: {
		remarkPlugins: [remarkGfm],
		rehypePlugins: [
			// 	// rehypePrettyCode removed in favor of rsc-based sugar-high
			// ],
			rehypeSlug,
			[
				rehypeAutolinkHeadings,
				{
					behavior: "append",
					properties: {
						className: ["anchor"],
					},
					content: {
						type: "element",
						tagName: "span",
						properties: { className: ["icon", "icon-link"] },
						children: [{ type: "text", value: "#" }],
					},
				},
			],
		],
	},
});
