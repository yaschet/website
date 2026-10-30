import "server-only";

import { compareDesc } from "date-fns";
import { cache } from "react";
import { hasSourceFile, listMdxSlugs, PROJECTS_DIR, readSource } from "@/src/content/source";
import {
	type ProjectMetadata,
	type ProjectSummaryEntry,
	projectMetadataSchema,
} from "@/src/content/types";

// Keep listing routes independent of MDX modules and their interactive client dependencies.
function extractExportedObjectLiteral(source: string, exportName: string) {
	const exportPattern = new RegExp(`export\\s+const\\s+${exportName}\\s*=`, "m");
	const match = exportPattern.exec(source);

	if (!match) {
		throw new Error(`Missing exported object literal for "${exportName}"`);
	}

	let cursor = match.index + match[0].length;
	while (cursor < source.length && /\s/.test(source[cursor] ?? "")) {
		cursor += 1;
	}

	if (source[cursor] !== "{") {
		throw new Error(`Expected object literal for exported "${exportName}"`);
	}

	const start = cursor;
	let depth = 0;
	let quote: "'" | '"' | "`" | null = null;
	let escaped = false;

	for (; cursor < source.length; cursor += 1) {
		const character = source[cursor] ?? "";

		if (quote) {
			if (escaped) {
				escaped = false;
				continue;
			}

			if (character === "\\") {
				escaped = true;
				continue;
			}

			if (character === quote) {
				quote = null;
			}

			continue;
		}

		if (character === "'" || character === '"' || character === "`") {
			quote = character;
			continue;
		}

		if (character === "{") {
			depth += 1;
			continue;
		}

		if (character !== "}") {
			continue;
		}

		depth -= 1;
		if (depth === 0) {
			return source.slice(start, cursor + 1);
		}
	}

	throw new Error(`Unterminated exported object literal for "${exportName}"`);
}

function parseProjectMetadataFromSource(source: string): ProjectMetadata {
	const metadataLiteral = extractExportedObjectLiteral(source, "metadata");
	const parsedMetadata: unknown = JSON.parse(metadataLiteral);
	return projectMetadataSchema.parse(parsedMetadata);
}

const loadProjectSummaryBySlug = cache(
	async (slug: string): Promise<ProjectSummaryEntry | null> => {
		if (!(await hasSourceFile(PROJECTS_DIR, slug))) {
			return null;
		}

		const source = await readSource(PROJECTS_DIR, slug);
		const metadata = parseProjectMetadataFromSource(source);

		return {
			...metadata,
			id: `project:${slug}`,
			slug,
			urlPath: `/case-studies/${slug}`,
		};
	},
);

export const getPublicProjectSummaryBySlug = cache(
	async (slug: string): Promise<ProjectSummaryEntry | null> => {
		const project = await loadProjectSummaryBySlug(slug);

		if (!project || project.cardState === "coming-soon") {
			return null;
		}

		return project;
	},
);

export const getAllProjectSummaries = cache(async (): Promise<ProjectSummaryEntry[]> => {
	const slugs = await listMdxSlugs(PROJECTS_DIR);
	const projects = await Promise.all(slugs.map((slug) => loadProjectSummaryBySlug(slug)));

	return projects
		.filter((project): project is ProjectSummaryEntry => project !== null)
		.sort((a, b) => {
			const aOrder = a.sortOrder ?? Number.POSITIVE_INFINITY;
			const bOrder = b.sortOrder ?? Number.POSITIVE_INFINITY;

			if (aOrder !== bOrder) {
				return aOrder - bOrder;
			}

			return compareDesc(new Date(a.date), new Date(b.date));
		});
});

export const getPublicProjectSummaries = cache(async (): Promise<ProjectSummaryEntry[]> => {
	const projects = await getAllProjectSummaries();
	return projects.filter((project) => project.cardState !== "coming-soon");
});

export const getListedPublicProjectSummaries = cache(async (): Promise<ProjectSummaryEntry[]> => {
	const projects = await getPublicProjectSummaries();
	return projects.filter((project) => project.listed);
});
