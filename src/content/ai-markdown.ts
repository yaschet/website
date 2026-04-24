import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";
import {
	getListedPublicProjectSummaries,
	getPublicProjectSummaryBySlug,
} from "@/src/content/registry";
import type { ProjectSummaryEntry } from "@/src/content/types";

const SITE_URL = "https://yaschet.dev";
const PROJECTS_DIR = path.join(process.cwd(), "content", "projects");

interface ProjectMarkdownEntry extends ProjectSummaryEntry {
	markdown: string;
}

function stripMetadataExport(source: string) {
	const exportPattern = /^export\s+const\s+metadata\s*=/m;
	const match = exportPattern.exec(source);

	if (!match) {
		return source.trim();
	}

	let cursor = match.index + match[0].length;
	while (cursor < source.length && /\s/.test(source[cursor] ?? "")) {
		cursor += 1;
	}

	if (source[cursor] !== "{") {
		throw new Error("Expected metadata export to contain an object literal.");
	}

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
			const afterObject = source.slice(cursor + 1).replace(/^\s*;?/, "");
			return afterObject.trim();
		}
	}

	throw new Error("Unterminated metadata export.");
}

function decodeJsxString(value: string) {
	return value
		.replace(/\\"/g, '"')
		.replace(/\\'/g, "'")
		.replace(/&quot;/g, '"')
		.replace(/&apos;/g, "'")
		.replace(/&amp;/g, "&");
}

function getStringProp(block: string, propName: string) {
	const expression = new RegExp(`${propName}\\s*=\\s*(["'])([\\s\\S]*?)\\1`, "m");
	const match = expression.exec(block);
	return match ? decodeJsxString(match[2].trim()) : undefined;
}

function getArrayProp(block: string, propName: string) {
	const expression = new RegExp(`${propName}\\s*=\\s*\\{\\s*\\[([\\s\\S]*?)\\]\\s*\\}`, "m");
	const match = expression.exec(block);

	if (!match) {
		return [];
	}

	return Array.from(match[1].matchAll(/(["'])([\s\S]*?)\1\s*,?/g)).map((item) =>
		decodeJsxString(item[2].trim()),
	);
}

function absoluteSiteUrl(value: string) {
	if (/^https?:\/\//.test(value)) {
		return value;
	}

	return `${SITE_URL}${value.startsWith("/") ? value : `/${value}`}`;
}

function serializeImageBlock(block: string) {
	const src = getStringProp(block, "src");
	const alt =
		getStringProp(block, "alt") ?? getStringProp(block, "caption") ?? "Case study image";
	const caption = getStringProp(block, "caption");

	if (!src) {
		throw new Error("Image MDX block is missing a src prop.");
	}

	const lines = [`![${alt}](${absoluteSiteUrl(src)})`];

	if (caption && caption !== alt) {
		lines.push(`Caption: ${caption}`);
	}

	return lines.join("\n\n");
}

function serializeVideoBlock(block: string) {
	const src = getStringProp(block, "src");
	const playbackId = getStringProp(block, "playbackId");
	const poster = getStringProp(block, "poster");
	const caption = getStringProp(block, "caption");
	const duration = getStringProp(block, "duration");
	const title = getStringProp(block, "title") ?? getStringProp(block, "video_title");
	const metadataTitle = /video_title\s*:\s*(["'])([\s\S]*?)\1/m.exec(block)?.[2];
	const label = caption ?? title ?? metadataTitle ?? "Case study video";
	const lines = [`> Video: ${decodeJsxString(label)}`];

	if (duration) {
		lines.push(`> Duration: ${duration}`);
	}

	if (poster) {
		lines.push(`> Poster: ${absoluteSiteUrl(poster)}`);
	}

	if (src) {
		lines.push(`> Source: ${absoluteSiteUrl(src)}`);
	}

	if (playbackId) {
		lines.push(`> Mux playback ID: ${playbackId}`);
	}

	return lines.join("\n");
}

function serializeGalleryBlock(block: string) {
	const images = getArrayProp(block, "images");
	const captions = getArrayProp(block, "captions");
	const caption = getStringProp(block, "caption");

	if (images.length === 0) {
		throw new Error("Gallery MDX block is missing images.");
	}

	const lines = caption ? [`> Gallery: ${caption}`, ""] : ["> Gallery", ""];

	for (const [index, image] of images.entries()) {
		const alt = captions[index] ?? `Gallery image ${index + 1}`;
		lines.push(`${index + 1}. ![${alt}](${absoluteSiteUrl(image)})`);
	}

	return lines.join("\n");
}

function serializeCompareBlock(block: string) {
	const before = getStringProp(block, "before");
	const after = getStringProp(block, "after");
	const beforeAlt = getStringProp(block, "beforeAlt") ?? "Before";
	const afterAlt = getStringProp(block, "afterAlt") ?? "After";
	const caption = getStringProp(block, "caption");

	if (!before || !after) {
		throw new Error("Compare MDX block is missing before or after image props.");
	}

	return [
		caption ? `> Comparison: ${caption}` : "> Comparison",
		"",
		`- ![${beforeAlt}](${absoluteSiteUrl(before)})`,
		`- ![${afterAlt}](${absoluteSiteUrl(after)})`,
	].join("\n");
}

function serializeMdxBlock(componentName: string, block: string) {
	switch (componentName) {
		case "Image":
			return serializeImageBlock(block);
		case "Video":
			return serializeVideoBlock(block);
		case "Gallery":
			return serializeGalleryBlock(block);
		case "Compare":
			return serializeCompareBlock(block);
		default:
			throw new Error(`Unsupported MDX component in AI Markdown output: ${componentName}`);
	}
}

function normalizeMdxToMarkdown(source: string) {
	const withoutMetadata = stripMetadataExport(source);
	const normalized = withoutMetadata.replace(
		/^<([A-Z][A-Za-z0-9]*)\b[\s\S]*?\/>\s*$/gm,
		(block, componentName: string) => serializeMdxBlock(componentName, block),
	);
	const unsupportedComponent = /^<([A-Z][A-Za-z0-9]*)\b/m.exec(normalized);

	if (unsupportedComponent) {
		throw new Error(
			`Unsupported MDX component in AI Markdown output: ${unsupportedComponent[1]}`,
		);
	}

	return normalized
		.replace(/\n{3,}/g, "\n\n")
		.replace(/[ \t]+$/gm, "")
		.trim();
}

function projectMetaLines(project: ProjectSummaryEntry) {
	const lines = [
		`# ${project.title}`,
		"",
		`> ${project.subtitle ?? project.description}`,
		"",
		`Canonical URL: ${SITE_URL}${project.urlPath}`,
		`Date: ${project.date}`,
	];

	if (project.role) {
		lines.push(`Role: ${project.role}`);
	}

	if (project.status) {
		lines.push(`Status: ${project.status}`);
	}

	if (project.domain) {
		lines.push(`Domain: ${project.domain}`);
	}

	if (project.stack && project.stack.length > 0) {
		lines.push(`Stack: ${project.stack.join(", ")}`);
	} else if (project.tech.length > 0) {
		lines.push(`Tech: ${project.tech.join(", ")}`);
	}

	return lines;
}

async function readProjectSource(slug: string) {
	return fs.readFile(path.join(PROJECTS_DIR, `${slug}.mdx`), "utf8");
}

async function buildProjectMarkdown(project: ProjectSummaryEntry): Promise<ProjectMarkdownEntry> {
	const source = await readProjectSource(project.slug);
	const body = normalizeMdxToMarkdown(source);
	const markdown = [...projectMetaLines(project), "", body].join("\n");

	if (/export\s+const\s+metadata|^<([A-Z][A-Za-z0-9]*)\b/m.test(markdown)) {
		throw new Error(`Unsafe AI Markdown output generated for ${project.slug}.`);
	}

	return {
		...project,
		markdown,
	};
}

export async function getCaseStudyMarkdownBySlug(slug: string) {
	"use cache";

	const project = await getPublicProjectSummaryBySlug(slug);

	if (!project) {
		return null;
	}

	return buildProjectMarkdown(project);
}

export async function getPublicCaseStudyMarkdownEntries() {
	"use cache";

	const projects = await getListedPublicProjectSummaries();
	return Promise.all(projects.map((project) => buildProjectMarkdown(project)));
}

export async function getPortfolioMarkdown() {
	"use cache";

	const projects = await getListedPublicProjectSummaries();
	const lines = [
		"# Yassine Chettouch Portfolio",
		"",
		"> Software engineer based in Rabat, Morocco. I build full-stack systems, AI-assisted workflows, internal tools, and high-performance product experiences.",
		"",
		`Canonical URL: ${SITE_URL}`,
		`Case studies index: ${SITE_URL}/case-studies`,
		`Contact: ${SITE_URL}/contact`,
		"",
		"## Profile",
		"",
		"- Full-stack software engineer working across frontend, backend, data, AI, payments, deployment, and product systems.",
		"- Strongest in ambiguous product and operations problems where architecture, interface quality, and reliability all matter.",
		"- Uses AI coding agents for scaffolding, refactors, tests, and codebase reading while keeping architecture, verification, and quality decisions human-owned.",
		"",
		"## Engineering Principles",
		"",
		"- Prefer boring infrastructure, strict typing, clear module boundaries, and proven libraries.",
		"- Verify AI-assisted work before it touches money, eligibility, compliance, or user-visible correctness.",
		"- Own decisions end to end from first commit through deployment behavior.",
		"- Ship working systems in short cycles with visible technical debt and production feedback.",
		"",
		"## Selected Case Studies",
		"",
	];

	for (const project of projects) {
		lines.push(`### ${project.title}`);
		lines.push("");
		lines.push(project.subtitle ?? project.description);
		lines.push("");
		lines.push(`- URL: ${SITE_URL}${project.urlPath}`);
		lines.push(`- Markdown: ${SITE_URL}${project.urlPath}.md`);
		lines.push(`- Date: ${project.date}`);

		if (project.role) {
			lines.push(`- Role: ${project.role}`);
		}

		if (project.status) {
			lines.push(`- Status: ${project.status}`);
		}

		const stack = project.stack?.length ? project.stack : project.tech;

		if (stack.length > 0) {
			lines.push(`- Stack: ${stack.join(", ")}`);
		}

		lines.push("");
	}

	lines.push("## Notes for AI-Assisted Analysis");
	lines.push("");
	lines.push("- Use `/llms.txt` for a concise index of canonical resources.");
	lines.push("- Use `/llms-full.txt` for a single-file context bundle.");
	lines.push("- Use individual `.md` case-study URLs for focused comparison.");

	return lines.join("\n").trim();
}

export async function getLlmsTxt() {
	"use cache";

	const projects = await getListedPublicProjectSummaries();
	const lines = [
		"# Yassine Chettouch",
		"",
		"> Software engineer portfolio covering full-stack systems, AI-assisted workflows, internal tools, and product engineering case studies.",
		"",
		"This file is a curated index for AI agents and LLM-assisted comparison. It complements the human website and sitemap; it is not a crawler permissions file.",
		"",
		"## Core",
		"",
		`- [Portfolio brief](${SITE_URL}/portfolio.md): Compact overview of profile, principles, and selected work.`,
		`- [Full AI context](${SITE_URL}/llms-full.txt): Portfolio brief plus full public case-study Markdown.`,
		`- [Human portfolio](${SITE_URL}): Canonical visual website.`,
		`- [Case studies](${SITE_URL}/case-studies): Human-readable case-study index.`,
		"",
		"## Case Studies",
		"",
	];

	for (const project of projects) {
		lines.push(
			`- [${project.title}](${SITE_URL}${project.urlPath}.md): ${project.description}`,
		);
	}

	lines.push("");
	lines.push("## Optional");
	lines.push("");
	lines.push(`- [Resume PDF](${SITE_URL}/yassine-chettouch-resume.pdf): Formal resume asset.`);
	lines.push(`- [About](${SITE_URL}/about): Human-readable engineering philosophy page.`);
	lines.push(`- [Contact](${SITE_URL}/contact): Contact form and email path.`);

	return lines.join("\n").trim();
}

export async function getLlmsFullTxt() {
	"use cache";

	const [portfolioMarkdown, projects] = await Promise.all([
		getPortfolioMarkdown(),
		getPublicCaseStudyMarkdownEntries(),
	]);

	return [
		"# Yassine Chettouch Full AI Context",
		"",
		"This file combines the curated portfolio brief and all public case studies as Markdown.",
		"",
		portfolioMarkdown,
		"",
		"---",
		"",
		"# Public Case Studies",
		"",
		...projects.flatMap((project) => [project.markdown, "", "---", ""]),
	]
		.join("\n")
		.replace(/\n{3,}/g, "\n\n")
		.trim();
}
