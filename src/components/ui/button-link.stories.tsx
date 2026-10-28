import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { ButtonLink } from "./button-link";

const meta = {
	id: "primitives-buttonlink",
	title: "Components/Actions/Button Link",
	component: ButtonLink,
	tags: ["autodocs"],
	parameters: { layout: "centered" },
	args: { href: "/case-studies", children: "Case studies" },
} satisfies Meta<typeof ButtonLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
export const Secondary: Story = {
	args: { href: "/contact", children: "Email", variant: "outline" },
	play: async ({ canvas }) => {
		const link = canvas.getByRole("link", { name: /^Email$/ });
		await expect(link).toHaveAttribute("href", "/contact");
		await expect(link).toHaveAttribute("data-slot", "button");
		await expect(link).toHaveAttribute("data-appearance", "outline");
		await expect(link).toHaveAttribute("data-color", "default");
	},
};
