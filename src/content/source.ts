import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";

export const BLOG_DIR = path.join(process.cwd(), "content", "blog");
export const PROJECTS_DIR = path.join(process.cwd(), "content", "projects");

// Content lives in one flat directory. Route parameters must never select a path.
const CONTENT_SLUG = /^[a-z0-9_-]+$/i;

export async function listMdxSlugs(directory: string) {
	const entries = await fs.readdir(directory, { withFileTypes: true });
	return entries
		.filter((entry) => entry.isFile() && entry.name.endsWith(".mdx"))
		.map((entry) => entry.name.replace(/\.mdx$/, ""))
		.sort((a, b) => a.localeCompare(b));
}

export async function readSource(directory: string, slug: string) {
	if (!CONTENT_SLUG.test(slug)) throw new Error("Invalid content slug");
	return fs.readFile(path.join(directory, `${slug}.mdx`), "utf8");
}

export async function hasSourceFile(directory: string, slug: string) {
	if (!CONTENT_SLUG.test(slug)) return false;
	try {
		await fs.access(path.join(directory, `${slug}.mdx`));
		return true;
	} catch {
		return false;
	}
}
