import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";
import { compareDesc } from "date-fns";
import { cache } from "react";
import {
	type MDXContentComponent,
	type PostEntry,
	type PostMetadata,
	type ProjectEntry,
	type ProjectMetadata,
	postMetadataSchema,
	projectMetadataSchema,
} from "@/src/content/types";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");
const PROJECTS_DIR = path.join(process.cwd(), "content", "projects");
const WORDS_PER_MINUTE = 200;

type ContentModule<TMetadata> = {
	default: MDXContentComponent;
	metadata: TMetadata;
};

async function listMdxSlugs(directory: string) {
	const entries = await fs.readdir(directory, { withFileTypes: true });
	return entries
		.filter((entry) => entry.isFile() && entry.name.endsWith(".mdx"))
		.map((entry) => entry.name.replace(/\.mdx$/, ""))
		.sort((a, b) => a.localeCompare(b));
}

async function readSource(directory: string, slug: string) {
	return fs.readFile(path.join(directory, `${slug}.mdx`), "utf8");
}

async function hasSourceFile(directory: string, slug: string) {
	try {
		await fs.access(path.join(directory, `${slug}.mdx`));
		return true;
	} catch {
		return false;
	}
}

function stripMetadataExport(source: string) {
	return source.replace(/^export\s+const\s+metadata\s*=\s*{[\s\S]*?^}\s*;?\s*$/m, "").trim();
}

function calculateReadingTime(source: string) {
	const wordCount = stripMetadataExport(source).split(/\s+/g).filter(Boolean).length;
	return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
}

const loadPostModule = cache(async (slug: string) => {
	return (await import(`@/content/blog/${slug}.mdx`)) as ContentModule<PostMetadata>;
});

const loadProjectModule = cache(async (slug: string) => {
	return (await import(`@/content/projects/${slug}.mdx`)) as ContentModule<ProjectMetadata>;
});

export const getPostBySlug = cache(async (slug: string): Promise<PostEntry | null> => {
	if (!(await hasSourceFile(BLOG_DIR, slug))) {
		return null;
	}

	const [module, source] = await Promise.all([loadPostModule(slug), readSource(BLOG_DIR, slug)]);
	const metadata = postMetadataSchema.parse(module.metadata);

	if (!metadata.published) {
		return null;
	}

	return {
		...metadata,
		id: `post:${slug}`,
		slug,
		urlPath: `/blog/${slug}`,
		readingTime: calculateReadingTime(source),
		Content: module.default,
	};
});

export const getProjectBySlug = cache(async (slug: string): Promise<ProjectEntry | null> => {
	if (!(await hasSourceFile(PROJECTS_DIR, slug))) {
		return null;
	}

	const [module, source] = await Promise.all([
		loadProjectModule(slug),
		readSource(PROJECTS_DIR, slug),
	]);
	const metadata = projectMetadataSchema.parse(module.metadata);

	return {
		...metadata,
		id: `project:${slug}`,
		slug,
		urlPath: `/case-studies/${slug}`,
		readingTime: calculateReadingTime(source),
		Content: module.default,
	};
});

export const getPublicProjectBySlug = cache(async (slug: string): Promise<ProjectEntry | null> => {
	const project = await getProjectBySlug(slug);

	if (!project || project.cardState === "coming-soon") {
		return null;
	}

	return project;
});

export const getAllPosts = cache(async (): Promise<PostEntry[]> => {
	const slugs = await listMdxSlugs(BLOG_DIR);
	const posts = await Promise.all(slugs.map((slug) => getPostBySlug(slug)));

	return posts
		.filter((post): post is PostEntry => post !== null)
		.sort((a, b) => compareDesc(new Date(a.date), new Date(b.date)));
});

export const getAllProjects = cache(async (): Promise<ProjectEntry[]> => {
	const slugs = await listMdxSlugs(PROJECTS_DIR);
	const projects = await Promise.all(slugs.map((slug) => getProjectBySlug(slug)));

	return projects
		.filter((project): project is ProjectEntry => project !== null)
		.sort((a, b) => {
			const aOrder = a.sortOrder ?? Number.POSITIVE_INFINITY;
			const bOrder = b.sortOrder ?? Number.POSITIVE_INFINITY;

			if (aOrder !== bOrder) {
				return aOrder - bOrder;
			}

			return compareDesc(new Date(a.date), new Date(b.date));
		});
});

export const getPublicProjects = cache(async (): Promise<ProjectEntry[]> => {
	const projects = await getAllProjects();
	return projects.filter((project) => project.cardState !== "coming-soon");
});
