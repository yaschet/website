import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { usePathname } from "@storybook/nextjs-vite/navigation.mock";
import { expect } from "storybook/test";
import { FloatingNav } from "@/src/components/layout/floating-nav";
import { SiteHeader } from "@/src/components/layout/site-header";
import { H2, H3, P } from "@/src/components/mdx/mdx-components";
import { type ProjectEntry, projectMetadataSchema } from "@/src/content/types";
import { CaseStudyDiagram } from "./case-study-diagram";
import { ProjectContentRSC } from "./project-content-rsc";
import { systemArchitectureDiagram } from "./verto-architecture";

/** Public Verto metadata and an abridged body; the production page shell is reused verbatim. */
function ArchitectureArticle() {
	return (
		<>
			<H2 id="architecture">Architecture</H2>
			<P>
				Verto reconstructs scanned documents as editable Google Docs. The system separates
				the web request, durable reconstruction work and stored output.
			</P>
			<div data-breakout="true" className="not-prose my-[var(--portfolio-space-section)]">
				<CaseStudyDiagram {...systemArchitectureDiagram} />
			</div>
			<H3 id="validation">The validation boundary</H3>
			<P>
				The builder creates the document structure. The auditor checks geometry against the
				source; rejected layouts return to the builder. Only an accepted structure reaches
				the Google Docs compiler.
			</P>
			<H3 id="execution">Durable execution</H3>
			<P>
				Trigger.dev owns the reconstruction job beyond the lifetime of a web request.
				Rolling context preserves continuity across batches. Supabase holds artifacts and
				usage data as separate responsibilities.
			</P>
		</>
	);
}

const project: ProjectEntry = {
	...projectMetadataSchema.parse({
		title: "Verto",
		description:
			"Architecture of a proprietary AI-powered translation engine designed for high-volume document pipelines.",
		date: "2026-01-26",
		role: "Lead Software Engineer (End-to-End)",
		status: "Production-Ready / IP Asset",
		stack: [
			"Next.js 16 (Server Actions)",
			"Trigger.dev (Durable Execution)",
			"Supabase (RLS & Realtime)",
			"TypeScript",
		],
		coverMedia: [
			{
				kind: "image",
				src: "/images/verto/review-editor.png",
				alt: "Verto document review editor",
			},
		],
	}),
	id: "verto",
	slug: "verto",
	urlPath: "/case-studies/verto",
	readingTime: 3,
	Content: ArchitectureArticle,
};

function ArchitecturePagePreview() {
	return (
		<>
			<SiteHeader />
			<ProjectContentRSC project={project} />
			<FloatingNav />
		</>
	);
}

const meta = {
	id: "pages-casestudyarchitecture",
	title: "Pages/Case Study",
	component: ArchitecturePagePreview,
	parameters: {
		layout: "fullscreen",
		controls: { disable: true },
		actions: { disable: true },
		// Theme globals rerun loaders: clear call history without discarding the route fixture.
		test: { clearMocks: true },
		docs: {
			description: {
				component:
					"Local composition review: the production case-study shell, public Verto imagery and abridged public architecture copy. The diagram is proposed here only; the published MDX is unchanged. The reading time belongs to this abridged preview.",
			},
		},
	},
	beforeEach: () => {
		usePathname.mockReturnValue("/case-studies/verto");
	},
} satisfies Meta<typeof ArchitecturePagePreview>;
export default meta;
type Story = StoryObj<typeof meta>;

export const InContext: Story = {
	play: async ({ canvas }) => {
		await expect(canvas.getByRole("heading", { name: "Verto" })).toBeVisible();
		await expect(canvas.getByRole("heading", { name: "Verto architecture" })).toBeVisible();
		await expect(canvas.getByRole("button", { name: "Expand diagram" })).toBeEnabled();
	},
};
