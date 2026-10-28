import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, waitFor, within } from "storybook/test";
import { SinglePreviewDocsPage } from "../../../.storybook/workshop-docs";
import { VideoSettingsMenu } from "./video-settings-menu";

function expectDarkMaterial(element: HTMLElement) {
	const style = getComputedStyle(element);
	const context = element.ownerDocument.createElement("canvas").getContext("2d");
	if (!context) throw new Error("Missing material test context");
	const bytes = (color: string) => {
		context.fillStyle = color;
		context.fillRect(0, 0, 1, 1);
		return [...context.getImageData(0, 0, 1, 1).data].slice(0, 3);
	};
	expect(style.colorScheme).toBe("dark");
	expect(Math.max(...bytes(style.backgroundColor))).toBeLessThan(65);
	expect(Math.min(...bytes(style.color))).toBeGreaterThan(235);
}

function VideoSettingsExample() {
	const [open, setOpen] = useState<"quality" | "speed" | null>(null);
	const [speed, setSpeed] = useState("1");
	const [quality, setQuality] = useState("auto");
	return (
		<div className="portfolio-box-pad">
			<div className="mx-auto flex min-h-80 max-w-2xl items-end justify-end bg-surface-950 p-4 text-surface-50">
				<div className="flex flex-wrap gap-2">
					<VideoSettingsMenu
						kind="quality"
						label="Select video quality"
						triggerLabel={quality === "auto" ? "Auto" : `${quality}p`}
						value={quality}
						options={[
							{ label: "Auto", value: "auto", detailLabel: "1080p" },
							{ label: "1080p", value: "1080", chipLabel: "HD" },
							{ label: "720p", value: "720", chipLabel: "HD" },
						]}
						open={open === "quality"}
						onOpenChange={(value) => setOpen(value ? "quality" : null)}
						onValueChange={setQuality}
					/>
					<VideoSettingsMenu
						kind="speed"
						label="Select playback speed"
						triggerLabel={`${speed}x`}
						value={speed}
						options={[
							{ label: "Normal", value: "1" },
							{ label: "1.5x", value: "1.5" },
							{ label: "2x", value: "2" },
						]}
						open={open === "speed"}
						onOpenChange={(value) => setOpen(value ? "speed" : null)}
						onValueChange={setSpeed}
					/>
				</div>
				<p role="status" className="sr-only">
					Quality: {quality}. Speed: {speed}x.
				</p>
			</div>
		</div>
	);
}
const meta = {
	id: "components-media-videosettings",
	title: "Components/Media/Video Settings",
	component: VideoSettingsExample,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		docs: {
			page: SinglePreviewDocsPage,
			description: {
				component:
					"The production quality and playback-speed controls on an inert media surface. No stream is downloaded. Controls and portalled menus retain the player's dark material in both page themes; selecting an option updates its trigger and returns focus.",
			},
		},
	},
} satisfies Meta<typeof VideoSettingsExample>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const KeyboardSelection: Story = {
	play: async ({ canvas, canvasElement, userEvent }) => {
		const body = within(canvasElement.ownerDocument.body);
		const trigger = canvas.getByRole("button", { name: /^Select playback speed:/ });
		expectDarkMaterial(trigger);
		await userEvent.hover(trigger);
		await waitFor(() => expectDarkMaterial(trigger));
		trigger.focus();
		await userEvent.keyboard("{Enter}");
		await waitFor(() => expect(body.getByRole("menu")).toBeVisible());
		expectDarkMaterial(body.getByRole("menu"));
		await expect(trigger).toHaveAccessibleName("Select playback speed: 1x");
		await userEvent.keyboard("{End}{Enter}");
		await waitFor(() => expect(trigger).toHaveFocus());
		await expect(trigger).toHaveAccessibleName("Select playback speed: 2x");
		await userEvent.keyboard("{ArrowDown}");
		await waitFor(() => expect(body.getByRole("menu")).toBeVisible());
		await userEvent.keyboard("{Escape}");
		await waitFor(() => expect(body.queryByRole("menu")).not.toBeInTheDocument());
		await expect(trigger).toHaveFocus();
	},
};
