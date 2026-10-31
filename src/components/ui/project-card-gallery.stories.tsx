import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { ConfidentialWorkCallout } from "../layout/confidential-work-callout";
import { ProjectCardGallery } from "./project-card-gallery";

const publicImages = ["/images/verto/review-editor.png", "/images/verto/dashboard-page.png"];

const meta = {
	id: "components-projectcardgallery",
	title: "Components/Content/Project Card",
	component: ProjectCardGallery,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component:
					"The production project card leads with public media, followed by the title, ownership and delivery status, the original problem and what was built. The caption keeps equal insets; prose wraps without truncation. A secondary footer contains technology references and a square stack disclosure. References open curated official pages in a new tab; their marks are monochrome at rest and reveal reviewed brand color on pointer hover. Keyboard focus inverts the cell's existing surface and ink. The native title link covers the overview; media and technology controls remain separate. Cards without a structured overview retain the description and index/date fallback.",
			},
		},
	},
	argTypes: { date: { control: "text", description: "Display label, formatted by the caller." } },
	decorators: [
		(Story) => (
			<div className="portfolio-box-pad mx-auto max-w-5xl">
				<Story />
			</div>
		),
	],
	args: {
		title: "Document Translation With Editable Tables",
		description:
			"Translate scanned documents into editable Google Docs, preserving tables, headings and reading direction.",
		overview: {
			problem:
				"Translators need scanned reports to retain figures, merged tables and reading direction in a document the client can edit.",
			solution:
				"I built side-by-side review, background processing and a Google Docs generator that reconstructs editable tables, including merged cells and right-to-left layouts.",
		},
		role: "Designed and built end to end",
		status: "Personal project · Released January 2026",
		href: "/case-studies/verto",
		index: "02",
		date: "January 2026",
		imageTreatment: "disciplined",
		tags: ["Next.js 16", "TypeScript", "OpenAI"],
	},
} satisfies Meta<typeof ProjectCardGallery>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Public: Story = {
	args: { images: publicImages },
	play: async ({ canvas }) => {
		const image = canvas.getByRole("img", {
			name: "Document Translation With Editable Tables",
		});
		await expect(image).toBeVisible();
		await waitFor(() => expect(image).toHaveProperty("complete", true), { timeout: 5000 });
		await expect(image).not.toHaveProperty("naturalWidth", 0);
	},
};
export const WithoutPreview: Story = {
	parameters: {
		docs: { description: { story: "Content-only card when no public media is assigned." } },
	},
	play: async ({ canvas, canvasElement }) => {
		await expect(canvas.getByRole("article")).toBeVisible();
		await expect(canvasElement.querySelector('[data-slot="project-preview"]')).toBeNull();
		await expect(canvas.queryByRole("region", { name: "No preview available" })).toBeNull();
	},
};
export const Confidential: Story = {
	args: {
		title: "Confidential work",
		description: "Private work is discussed directly with prospective clients.",
		overview: undefined,
		role: undefined,
		status: undefined,
		isPrivate: true,
	},
};
export const LongMetadata: Story = {
	args: {
		images: publicImages,
		title: "A long case-study heading across narrow screens",
		description: "A wrapping fixture for project context and ownership on narrow screens.",
		tags: [
			"Next.js 16",
			"TypeScript",
			"PostgreSQL",
			"Durable execution",
			"Document reconstruction",
			"Observability",
			"OpenTelemetryInstrumentation",
		],
	},
};

export const TechnologyRotation: Story = {
	args: {
		title: "University Program Matching",
		href: "/case-studies/clearway-phoenix",
		images: ["/images/clearway-phoenix/phoenix-film-poster.jpg"],
		description:
			"Help study-abroad advisors find suitable programs, understand each match and build a student shortlist.",
		overview: {
			problem:
				"Advisors had to compare grades, entry conditions, fees and scholarships across spreadsheets to find suitable university programs.",
			solution:
				"I built a structured catalog, a resumable AI-assisted import and matching with visible score breakdowns, so advisors could inspect recommendations and save shortlists to the student's record.",
		},
		role: "Sole engineer",
		status: "Delivered · February–June 2025",
		technologyHighlights: ["Laravel", "OpenAI", "MeiliSearch"],
		tags: [
			"Laravel",
			"PHP",
			"Livewire",
			"Alpine.js",
			"MySQL",
			"Redis",
			"MeiliSearch",
			"OpenAI",
		],
	},
	parameters: {
		docs: {
			description: {
				story: "Desktop keeps three core technologies fixed and exchanges the last three as an ordered group, starting at the right edge. Compact rails exchange all three cells. Groups advance every 2.2 seconds with a contained 400ms blur/fade and 50ms right-to-left stagger. Each reviewed technology links to an official product or project landing page in a new tab; unknown fixture names remain plain text. Hover, keyboard focus and touch press hold rotation, keeping the name and destination together. Cell fills and glyph feedback preserve fixed chambers and shared hairlines in every state. The square Stack disclosure exposes the complete stack immediately in core-first order. Its frame fades without scaling or blurring; text and glyphs reveal in row pairs, settling within 292ms. The flush grid uses colored symbols in 40px square chambers with equal 12px cell insets, matching the header chambers and text alignment. Inset frames and drawn seams share one hairline thickness, including at fractional display density. Offscreen, hidden-document and reduced-motion views stay still. Explicit pause remains in effect after dismissal on both desktop and mobile.",
			},
		},
	},
	play: async ({ canvas, canvasElement }) => {
		const rail = canvasElement.querySelector<HTMLElement>(
			'[data-slot="project-technology-rail"]',
		);
		if (!rail) throw new Error("Missing technology rail");
		const openai = canvas.getByRole("link", { name: /^OpenAI:/ });
		await userEvent.tab();
		openai.focus();
		await waitFor(() => expect(rail).toHaveAttribute("data-running", "false"));
		await expect(openai).toHaveAttribute("href", "https://openai.com/api/");
		await expect(openai).toHaveAttribute("target", "_blank");
		await expect(openai).toHaveAttribute("rel", "noopener noreferrer");
		await waitFor(() => {
			const current = Array.from(
				rail.querySelectorAll<HTMLElement>(".portfolio-technology-current"),
				(node) => node.dataset.technology,
			);
			const wide = rail.clientWidth >= 640;
			expect(current).toHaveLength(wide ? 6 : 3);
			expect(current.slice(0, 3)).toEqual(["Laravel", "OpenAI", "MeiliSearch"]);
		});
		const identities = canvasElement.querySelectorAll<HTMLElement>(
			".portfolio-technology-current .portfolio-technology-identity",
		);
		for (const identity of identities) {
			expect(identity.querySelectorAll(".portfolio-technology-label")).toHaveLength(1);
			const markChamber = identity.querySelector<HTMLElement>(
				".portfolio-technology-mark-chamber",
			);
			if (!markChamber) throw new Error("Missing technology symbol chamber");
			const { width, height } = markChamber.getBoundingClientRect();
			expect(width).toBeCloseTo(28, 1);
			expect(height).toBeCloseTo(28, 1);
		}
		const markCenters = Array.from(
			canvasElement.querySelectorAll<HTMLElement>(
				".portfolio-technology-current .portfolio-technology-mark-chamber",
			),
			(markChamber) => {
				const bounds = markChamber.getBoundingClientRect();
				return bounds.y + bounds.height / 2;
			},
		);
		expect(Math.max(...markCenters) - Math.min(...markCenters)).toBeLessThan(0.5);
		const trigger = canvas.getByRole("button", {
			name: "Stack: all 8 technologies for University Program Matching",
		});
		const triggerBounds = trigger.getBoundingClientRect();
		const referenceCell = rail.querySelector<HTMLElement>(".portfolio-technology-cell");
		if (!referenceCell) throw new Error("Missing technology reference cell");
		expect(triggerBounds.width).toBeCloseTo(referenceCell.getBoundingClientRect().width, 1);
		expect(triggerBounds.height).toBeCloseTo(64, 1);
		const triggerChamber = trigger.querySelector<HTMLElement>(
			".portfolio-technology-mark-chamber",
		);
		if (!triggerChamber) throw new Error("Missing stack symbol chamber");
		const triggerMark = triggerChamber.getBoundingClientRect();
		expect(triggerMark.width).toBeCloseTo(28, 1);
		expect(triggerMark.height).toBeCloseTo(28, 1);
		expect(Math.abs(triggerMark.y + triggerMark.height / 2 - markCenters[0])).toBeLessThan(0.5);
		const caption = trigger.querySelector<HTMLElement>(".portfolio-technology-label");
		if (!caption) throw new Error("Missing stack caption");
		expect(caption).toHaveTextContent("Stack");
		expect(caption.scrollWidth).toBeLessThanOrEqual(caption.clientWidth);
		await userEvent.click(trigger);
		const body = within(canvasElement.ownerDocument.body);
		const dialog = await body.findByRole("dialog", {
			name: "Technology stack for University Program Matching",
		});
		await waitFor(() => expect(dialog).toBeVisible());
		await waitFor(() =>
			expect(
				dialog
					.getAnimations({ subtree: true })
					.some((animation) => animation.playState === "running"),
			).toBe(false),
		);
		expect(dialog.querySelectorAll('[data-layout="inline"]')).toHaveLength(8);
		await expect(within(dialog).getAllByRole("link")).toHaveLength(8);
		expect(
			Array.from(
				dialog.querySelectorAll(".portfolio-technology-list .portfolio-technology-label"),
				(label) => label.textContent,
			),
		).toEqual([
			"Laravel",
			"OpenAI",
			"MeiliSearch",
			"PHP",
			"Livewire",
			"Alpine.js",
			"MySQL",
			"Redis",
		]);
		const php = dialog.querySelector<HTMLElement>('[data-mark="php-elephant"]');
		if (!php?.parentElement) throw new Error("Missing PHP mark chamber");
		const artwork = php.getBoundingClientRect();
		const chamber = php.parentElement.getBoundingClientRect();
		// Intrinsic SVG dimensions must not displace the shared centerline.
		expect(
			Math.abs(artwork.y + artwork.height / 2 - chamber.y - chamber.height / 2),
		).toBeLessThan(0.5);
		for (const name of [
			"Laravel",
			"PHP",
			"Livewire",
			"Alpine.js",
			"MySQL",
			"Redis",
			"MeiliSearch",
			"OpenAI",
		]) {
			await expect(within(dialog).getByText(name, { exact: true })).toBeVisible();
		}
		const pause = within(dialog).queryByRole("button", { name: "Pause logo rotation" });
		if (pause) {
			await userEvent.click(pause);
			await expect(
				within(dialog).getByRole("button", { name: "Resume logo rotation" }),
			).toHaveAttribute("aria-pressed", "true");
		}
		await userEvent.keyboard("{Escape}");
		await waitFor(() => expect(trigger).toHaveFocus());
	},
};

export const InContext: Story = {
	args: {
		images: publicImages,
		tags: [
			"Next.js",
			"OpenAI",
			"Trigger.dev",
			"Supabase/PostgreSQL",
			"Google Docs API",
			"Tiptap",
			"TypeScript",
		],
	},
	parameters: {
		docs: {
			description: {
				story: "The homepage work list at full content width. Each project and the vertical confidential-work card own the same surface, hairline and equal caption insets. A 40px canvas gap separates the cards; no connecting frame or extra listing inset surrounds them.",
			},
		},
	},
	render: (args) => (
		<div className="portfolio-stack-section">
			<ProjectCardGallery {...args} />
			<ConfidentialWorkCallout />
		</div>
	),
	play: async ({ canvas }) => {
		await expect(
			canvas.getByRole("link", { name: "Document Translation With Editable Tables" }),
		).toHaveAttribute("href", "/case-studies/verto");
		const note = canvas.getByRole("heading", { name: "Confidential work" });
		await expect(note).toBeVisible();
		const continuation = note.parentElement;
		if (!continuation) throw new Error("Missing private-work continuation");
		await expect(within(continuation).getByRole("link", { name: "in a call" })).toHaveAttribute(
			"href",
			"/contact",
		);
		await expect(within(continuation).queryByRole("button")).toBeNull();
	},
};
