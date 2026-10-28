import { FileText } from "@phosphor-icons/react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { ButtonLink } from "./button-link";
import { EditorialEmptyState } from "./editorial-empty-state";

const meta = {
	id: "components-editorialemptystate",
	title: "Components/Content/Empty State",
	component: EditorialEmptyState,
	tags: ["autodocs"],
	args: {
		icon: <FileText className="size-4" aria-hidden="true" />,
		title: "No posts published.",
		description: "Writing will appear here when it is ready.",
	},
	play: async ({ canvasElement }) => {
		await expect(within(canvasElement).getByRole("heading", { level: 2 })).toBeVisible();
		const chamber = canvasElement.querySelector('[data-slot="icon-chamber"]');
		const glyph = chamber?.querySelector("svg");
		if (!chamber || !glyph) throw new Error("Empty state icon is missing");
		const frame = chamber.getBoundingClientRect();
		const icon = glyph.getBoundingClientRect();
		expect([frame.width, frame.height, icon.width, icon.height]).toEqual([40, 40, 20, 20]);
		expect(icon.x - frame.x).toBe(10);
		expect(icon.y - frame.y).toBe(10);
	},
} satisfies Meta<typeof EditorialEmptyState>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const WithAction: Story = {
	args: {
		icon: <FileText size={24} aria-hidden="true" />,
		actions: <ButtonLink href="/case-studies">View case studies</ButtonLink>,
		note: "The action is a native link and remains available without a page transition effect.",
	},
};
