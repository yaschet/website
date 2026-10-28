import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent } from "storybook/test";
import { GalleryPlayButton } from "./gallery-play-button";

const meta = {
	id: "components-media-galleryplaybutton",
	title: "Components/Media/Play Button",
	component: GalleryPlayButton,
	tags: ["autodocs"],
	parameters: { layout: "centered" },
	args: { duration: "1:40", onClick: fn() },
} satisfies Meta<typeof GalleryPlayButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvas, args }) => {
		const button = canvas.getByRole("button", { name: "Play 1:40 video" });
		await userEvent.click(button);
		await expect(args.onClick).toHaveBeenCalledOnce();
	},
};

export const Pending: Story = {
	args: { loading: true },
	play: async ({ canvas }) => {
		const button = canvas.getByRole("button", { name: "Play 1:40 video" });
		await expect(button).toHaveAttribute("aria-disabled", "true");
		await expect(button).toHaveAttribute("aria-busy", "true");
		await expect(canvas.getByText("Play", { exact: true })).toBeVisible();
	},
};

export const WithoutDuration: Story = { args: { duration: undefined } };
