import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { phoenix, verto } from "../../../.storybook/project-fixtures";
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
					"Read-only badges sit directly beneath the title. On cards at least 720px wide, product type and capability align left while role and timing align right. Narrower cards use one left-aligned wrapping group. The badges share regular uppercase 12/16px mono typography, the technology footer's fill and muted label ink, 28px height and equal horizontal padding. The title action uses the same fill with primary logo ink. Their inset hairlines match the card perimeter and footer seams at rest. The role comes from the same project metadata as the full case study; the narrative explains complete ownership. Verto shows its documented build duration; other projects show their recorded period. Exact dates remain in the full case study. Title, badges, challenge and response share one surface with equal outer insets. Media and the technology footer remain separate interaction zones. These stories import the same authored MDX as the public pages.",
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
		title: verto.title,
		description: verto.description,
		overview: verto.overview,
		role: verto.role,
		delivery: verto.delivery,
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
			name: verto.title,
		});
		await expect(image).toBeVisible();
		await waitFor(() => expect(image).toHaveProperty("complete", true), { timeout: 5000 });
		await expect(image).not.toHaveProperty("naturalWidth", 0);
		await expect(canvas.getByText("SaaS", { exact: true })).toBeVisible();
		await expect(canvas.getByText("Document AI", { exact: true })).toBeVisible();
		await expect(canvas.getByText("Product Engineer", { exact: true })).toBeVisible();
		await expect(canvas.getByText("2026", { exact: true })).toBeVisible();
		await expect(canvas.getByText(verto.overview.summary, { exact: true })).toBeVisible();
	},
};

/** Uses the reviewed film-first sequence from the same source as Home and the work index. */
export const MixedMedia: Story = {
	args: {
		title: phoenix.title,
		description: phoenix.description,
		overview: phoenix.overview,
		role: phoenix.role,
		delivery: phoenix.delivery,
		date: "2025",
		href: "/case-studies/clearway-phoenix",
		items: phoenix.coverMedia,
		tags: phoenix.tech,
	},
};

export const KeyboardInspection: Story = {
	args: { images: publicImages, deferMediaLoading: false },
	play: async ({ canvas, canvasElement, userEvent }) => {
		const gallery = await canvas.findByRole("region", { name: verto.title });
		gallery.focus();
		await userEvent.keyboard("{Enter}");
		const body = within(canvasElement.ownerDocument.body);
		const dialog = await body.findByRole("dialog");
		await expect(dialog).toBeVisible();
		await userEvent.keyboard("{Escape}");
		await waitFor(() => expect(gallery).toHaveFocus());
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
		overview: phoenix.overview,
		role: phoenix.role,
		delivery: phoenix.delivery,
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
				story: "Desktop keeps three core technologies fixed and exchanges the last two as an ordered group, starting at the right edge. Compact rails exchange all three cells. Groups advance every 2.2 seconds with a contained 400ms blur/fade and 50ms right-to-left stagger. Each reviewed technology links to an official product or project landing page in a new tab; unknown fixture names remain plain text. Hover, keyboard focus and touch press hold rotation, keeping the name and destination together. Cell fills and glyph feedback preserve fixed chambers and shared hairlines in every state. The square Stack disclosure exposes the complete stack immediately in core-first order. Its frame fades without scaling or blurring; text and glyphs reveal in row pairs, settling within 292ms. The flush grid uses colored symbols in 40px square chambers with equal 12px cell insets, matching the header chambers and text alignment. Inset frames and drawn seams share one hairline thickness, including at fractional display density. Offscreen, hidden-document and reduced-motion views stay still. Explicit pause remains in effect after dismissal on both desktop and mobile.",
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
			expect(current).toHaveLength(wide ? 5 : 3);
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
			canvas.getByRole("link", {
				name: verto.title,
			}),
		).toHaveAttribute("href", "/case-studies/verto");
		const note = canvas.getByRole("heading", { name: "Confidential work" });
		await expect(note).toBeVisible();
		const continuation = note.parentElement;
		if (!continuation) throw new Error("Missing private-work continuation");
		await expect(
			within(continuation).getByRole("link", { name: "Ask about relevant work" }),
		).toHaveAttribute("href", "/contact");
		await expect(within(continuation).queryByRole("button")).toBeNull();
	},
};
