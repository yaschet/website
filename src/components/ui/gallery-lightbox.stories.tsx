import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, waitFor, within } from "storybook/test";
import { SinglePreviewDocsPage } from "../../../.storybook/workshop-docs";
import { Button } from "./button";
import { GalleryLightbox } from "./gallery-lightbox";

function LightboxExample({ video = false }: { video?: boolean }) {
	const [open, setOpen] = useState(false);
	const [index, setIndex] = useState(0);
	return (
		<div className="portfolio-box-pad">
			<Button
				variant="soft"
				onClick={(event) => {
					event.currentTarget.focus({ preventScroll: true });
					setOpen(true);
				}}
			>
				Expand project images
			</Button>
			<GalleryLightbox
				activeIndex={index}
				items={
					video
						? [
								{
									kind: "mux-video",
									playbackId: "WNddSfv9LgR1KV01uf3sL02o02Lc9COwBWyr8rp7dsnceI",
									poster: "/images/verto/dashboard-page.png",
									title: "Verto walkthrough",
								},
								{
									kind: "image",
									src: "/images/verto/review-editor.png",
									alt: "Verto review editor",
								},
							]
						: [
								{
									kind: "image",
									src: "/images/verto/dashboard-page.png",
									alt: "Verto dashboard",
									caption: "Dashboard overview",
								},
								{
									kind: "image",
									src: "/images/verto/review-editor.png",
									alt: "Verto review editor",
									caption: "Document review",
								},
							]
				}
				onIndexChange={setIndex}
				onOpenChange={setOpen}
				open={open}
				quality={75}
				sizes="100vw"
			/>
		</div>
	);
}
const meta = {
	title: "Components/Media/Lightbox",
	component: LightboxExample,
	tags: ["autodocs"],
	parameters: { layout: "fullscreen", docs: { page: SinglePreviewDocsPage } },
} satisfies Meta<typeof LightboxExample>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
/** Loads public media only when the viewer is opened manually. HTTP UI tests block the stream. */
export const Video: Story = { args: { video: true } };
export const KeyboardAndFocus: Story = {
	play: async ({ canvas, canvasElement, userEvent }) => {
		const body = within(canvasElement.ownerDocument.body);
		const opener = canvas.getByRole("button", { name: "Expand project images" });
		opener.focus();
		await userEvent.keyboard("{Enter}");
		const close = await body.findByRole("button", { name: "Close expanded viewer" });
		await waitFor(() => expect(close).toHaveFocus());
		await userEvent.keyboard("{ArrowRight}");
		await waitFor(() =>
			expect(body.getByRole("dialog")).toHaveAccessibleName("Verto review editor"),
		);
		await expect(close).toHaveFocus();
		await userEvent.tab({ shift: true });
		const focused = canvasElement.ownerDocument.activeElement;
		if (!(focused instanceof HTMLElement)) throw new Error("Expected focus inside the viewer");
		await expect(body.getByRole("dialog")).toContainElement(focused);
		await userEvent.keyboard("{Escape}");
		await waitFor(() => expect(body.queryByRole("dialog")).not.toBeInTheDocument());
		await expect(opener).toHaveFocus();
	},
};
