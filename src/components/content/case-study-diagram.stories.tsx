import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { CaseStudyDiagram } from "./case-study-diagram";
import { oneToManyDiagram, validationLoopDiagram } from "./case-study-diagram.examples";
import { programMatchingDiagram } from "./program-matching-diagram";
import { systemArchitectureDiagram } from "./verto-architecture";

const meta = {
	id: "case-study-diagram",
	title: "Components/Content/Case Study Diagram",
	component: CaseStudyDiagram,
	tags: ["autodocs"],
	args: validationLoopDiagram,
	parameters: {
		layout: "fullscreen",
		controls: { include: ["title", "description", "maxWidth", "navigationPosition"] },
		docs: {
			description: {
				component:
					"One diagram family with authored layouts: system architecture, validation loops, branching and resumable imports. All views use the same walkthrough, explanation and expanded view. Architecture adds zoom, pan and fit-to-view. Verto and Program Matching use public case-study evidence; One To Many is illustrative. These diagrams are ready for local review and are not yet registered in public MDX.",
			},
		},
	},
	argTypes: {
		children: { control: false, table: { disable: true } },
		steps: { control: false },
		navigationPosition: { control: "radio", options: ["above", "below"] },
	},
	decorators: [
		(Story) => (
			<div className="portfolio-box-pad mx-auto w-full max-w-6xl">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof CaseStudyDiagram>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SystemArchitecture: Story = { args: systemArchitectureDiagram };
export const ValidationLoop: Story = {};
export const OneToMany: Story = { args: oneToManyDiagram };
export const ProgramMatching: Story = { args: programMatchingDiagram };

/** Interaction-only stories do not advance the visible examples automatically. */
export const ValidationInteractions: Story = {
	tags: ["!dev", "!autodocs"],
	play: async ({ canvas, canvasElement }) => {
		await userEvent.click(canvas.getByRole("button", { name: "Return" }));
		await waitFor(() =>
			expect(
				canvas.getByRole("heading", { name: "A failed check returns to the builder." }),
			).toBeVisible(),
		);
		await userEvent.click(canvas.getByRole("button", { name: "Write" }));
		await expect(canvas.getByRole("button", { name: "Write" })).toHaveAttribute(
			"aria-pressed",
			"true",
		);
		const expand = canvas.getByRole("button", { name: "Expand diagram" });
		await userEvent.click(expand);
		const dialog = await within(canvasElement.ownerDocument.body).findByRole("dialog");
		await expect(within(dialog).getByRole("button", { name: "Write" })).toHaveAttribute(
			"aria-pressed",
			"true",
		);
		await userEvent.click(within(dialog).getByRole("button", { name: "Map" }));
		await userEvent.keyboard("{Escape}");
		await waitFor(() => expect(expand).toHaveFocus());
		await expect(canvas.getByRole("button", { name: "Map" })).toHaveAttribute(
			"aria-pressed",
			"true",
		);
	},
};

export const BranchingInteractions: Story = {
	args: oneToManyDiagram,
	tags: ["!dev", "!autodocs"],
	play: async ({ canvas }) => {
		await userEvent.click(canvas.getByRole("button", { name: "Source" }));
		await userEvent.keyboard("{Tab}{Enter}");
		await expect(canvas.getByRole("button", { name: "Outputs" })).toHaveAttribute(
			"aria-pressed",
			"true",
		);
		await waitFor(() =>
			expect(
				canvas.getByRole("heading", { name: "Follow each branch to its destination." }),
			).toBeVisible(),
		);
		await userEvent.click(canvas.getByRole("button", { name: "Full explanation" }));
		await waitFor(() =>
			expect(
				within(canvas.getByRole("list")).getByText(
					"This illustrative pattern connects an authored record to an article, search index and feed. It demonstrates a different diagram shape, not a claim about a client project.",
				),
			).toBeVisible(),
		);
		await userEvent.click(canvas.getByRole("button", { name: "Full explanation" }));
		await userEvent.click(canvas.getByRole("button", { name: "Map" }));
	},
};

export const ImportInteractions: Story = {
	args: programMatchingDiagram,
	tags: ["!dev", "!autodocs"],
	play: async ({ canvas, canvasElement }) => {
		await userEvent.click(canvas.getByRole("button", { name: "Resume" }));
		await waitFor(() =>
			expect(
				canvas.getByRole("heading", { name: "A failed import stage keeps its place." }),
			).toBeVisible(),
		);
		await userEvent.click(canvas.getByRole("button", { name: "Full explanation" }));
		await waitFor(() =>
			expect(
				within(canvas.getByRole("list")).getByText(/The score lists grade fit/),
			).toBeVisible(),
		);
		const expand = canvas.getByRole("button", { name: "Expand diagram" });
		await userEvent.click(expand);
		const dialog = await within(canvasElement.ownerDocument.body).findByRole("dialog");
		await expect(within(dialog).getByRole("button", { name: "Resume" })).toHaveAttribute(
			"aria-pressed",
			"true",
		);
		await userEvent.keyboard("{Escape}");
		await waitFor(() => expect(expand).toHaveFocus());
	},
};
