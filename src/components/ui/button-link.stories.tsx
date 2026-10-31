import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { ArrowButtonLink } from "./arrow-button-link";
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
	args: { href: "/contact", children: "Contact", variant: "outline" },
	play: async ({ canvas }) => {
		const link = canvas.getByRole("link", { name: /^Contact$/ });
		await expect(link).toHaveAttribute("href", "/contact");
		await expect(link).toHaveAttribute("data-slot", "button");
		await expect(link).toHaveAttribute("data-appearance", "outline");
		await expect(link).toHaveAttribute("data-color", "default");
	},
};

export const DirectionalMotion: Story = {
	name: "Directional motion",
	render: () => (
		<div className="flex flex-wrap items-center justify-center gap-5">
			<ArrowButtonLink href="/case-studies">Case studies</ArrowButtonLink>
			<ArrowButtonLink href="/case-studies/clearway-phoenix" arrowDirection="up-right">
				Read case study
			</ArrowButtonLink>
			<ArrowButtonLink href="/contact" variant="outline" arrowBlur={false}>
				Contact
			</ArrowButtonLink>
			<ArrowButtonLink href="#work" variant="outline" arrowDirection="down">
				View my work
			</ArrowButtonLink>
		</div>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const right = canvas.getByRole("link", { name: /^Case studies$/ });
		const diagonal = canvas.getByRole("link", { name: /^Read case study$/ });
		const withoutBlur = canvas.getByRole("link", { name: /^Contact$/ });
		const down = canvas.getByRole("link", { name: /^View my work$/ });
		await expect(diagonal.querySelector(".portfolio-reel-icon")).toHaveAttribute(
			"data-direction",
			"up-right",
		);
		await expect(withoutBlur.querySelector(".portfolio-reel-icon")).not.toHaveAttribute(
			"data-blur",
		);
		await expect(down.querySelector(".portfolio-reel-icon")).toHaveAttribute(
			"data-direction",
			"down",
		);
		const before = right.getBoundingClientRect();
		await userEvent.hover(right);
		await expect(right).toHaveAccessibleName("Case studies");
		await expect(right.getBoundingClientRect().width).toBe(before.width);
		await userEvent.unhover(right);
	},
};
