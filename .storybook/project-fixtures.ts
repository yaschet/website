import ErpContent, { metadata as erpMetadata } from "../content/projects/clearway-erp.mdx?content";
import erpSource from "../content/projects/clearway-erp.mdx?raw";
import PhoenixContent, {
	metadata as phoenixMetadata,
} from "../content/projects/clearway-phoenix.mdx?content";
import phoenixSource from "../content/projects/clearway-phoenix.mdx?raw";
import PortalContent, {
	metadata as portalMetadata,
} from "../content/projects/clearway-portal.mdx?content";
import portalSource from "../content/projects/clearway-portal.mdx?raw";
import VertoContent, { metadata as vertoMetadata } from "../content/projects/verto.mdx?content";
import vertoSource from "../content/projects/verto.mdx?raw";
import { calculateReadingTime } from "../src/content/reading-time";
import {
	type MDXContentComponent,
	type ProjectEntry,
	type ProjectSummaryEntry,
	projectMetadataSchema,
} from "../src/content/types";

function project(
	slug: string,
	metadata: unknown,
	Content: MDXContentComponent,
	source: string,
): ProjectEntry {
	return {
		...projectMetadataSchema.parse(metadata),
		id: `project:${slug}`,
		slug,
		urlPath: `/case-studies/${slug}`,
		readingTime: calculateReadingTime(source),
		Content,
	};
}

// Import authored MDX rather than maintaining a second version of project copy.
export const verto = project("verto", vertoMetadata, VertoContent, vertoSource);
export const phoenix = project("clearway-phoenix", phoenixMetadata, PhoenixContent, phoenixSource);
export const portal = project("clearway-portal", portalMetadata, PortalContent, portalSource);
export const erp = project("clearway-erp", erpMetadata, ErpContent, erpSource);

export const projectSummaries: ProjectSummaryEntry[] = [verto, phoenix, portal, erp]
	.filter((entry) => entry.listed && entry.cardState !== "coming-soon")
	.sort((a, b) => {
		const order = (a.sortOrder ?? Infinity) - (b.sortOrder ?? Infinity);
		return Number.isNaN(order) || order === 0
			? new Date(b.date).getTime() - new Date(a.date).getTime()
			: order;
	})
	.map(({ Content: _Content, readingTime: _readingTime, ...summary }) => summary);
