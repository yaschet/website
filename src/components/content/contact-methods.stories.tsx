import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { ContactMethods } from "./contact-methods";

const meta = {
	id: "content-contactmethods",
	title: "Components/Content/Contact Methods",
	component: ContactMethods,
	tags: ["autodocs"],
	parameters: { layout: "fullscreen" },
	decorators: [
		(Story) => (
			<div className="portfolio-box-pad mx-auto max-w-5xl">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof ContactMethods>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvas }) => {
		await expect(canvas.getByRole("link", { name: "Email" })).toHaveAttribute(
			"href",
			"mailto:hello@yaschet.com",
		);
		for (const link of canvas.getAllByRole("link")) {
			await expect(link).toHaveAttribute("data-slot", "button");
		}
		await expect(canvas.getByRole("link", { name: "Book a call" })).toHaveAttribute(
			"rel",
			"noreferrer",
		);
	},
};
