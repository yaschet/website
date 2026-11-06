import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, waitFor, within } from "storybook/test";
import { SinglePreviewDocsPage } from "../../../.storybook/workshop-docs";
import { Button } from "./button";
import { GalleryLightbox } from "./gallery-lightbox";

/** Exercise the public media boundary without network or autoplay permissions. */
async function installDeterministicTransport() {
	const { default: MuxVideo } = await import("@mux/mux-video");
	type Media = InstanceType<typeof MuxVideo>;
	const prototype = MuxVideo.prototype;
	const saved = new Map<string, PropertyDescriptor | undefined>();
	const states = new Map<Media, { paused: boolean; time: number; source: string }>();
	const state = (media: Media) => {
		let value = states.get(media);
		if (!value) {
			value = { paused: true, time: 0, source: "" };
			states.set(media, value);
		}
		return value;
	};
	const replace = (name: string, descriptor: PropertyDescriptor) => {
		saved.set(name, Object.getOwnPropertyDescriptor(prototype, name));
		Object.defineProperty(prototype, name, { configurable: true, ...descriptor });
	};
	replace("src", {
		get(this: Media) {
			return state(this).source;
		},
		set(this: Media, source: string) {
			state(this).source = source;
		},
	});
	replace("currentSrc", {
		get(this: Media) {
			return state(this).source;
		},
	});
	replace("paused", {
		get(this: Media) {
			return state(this).paused;
		},
	});
	replace("currentTime", {
		get(this: Media) {
			return state(this).time;
		},
		set(this: Media, time: number) {
			state(this).time = time;
			this.dispatchEvent(new Event("timeupdate"));
		},
	});
	for (const [name, value] of Object.entries({
		readyState: 4,
		duration: 100,
		videoWidth: 1280,
		videoHeight: 720,
	}))
		replace(name, { get: () => value });
	replace("load", { value() {} });
	replace("unload", { value() {} });
	replace("play", {
		value(this: Media) {
			state(this).paused = false;
			this.dispatchEvent(new Event("play"));
			if (!state(this).paused) this.dispatchEvent(new Event("playing"));
			return Promise.resolve();
		},
	});
	replace("pause", {
		value(this: Media) {
			const current = state(this);
			if (current.paused) return;
			current.paused = true;
			this.dispatchEvent(new Event("pause"));
		},
	});
	const clock = setInterval(() => {
		for (const [media, current] of states) {
			if (current.paused) continue;
			current.time += 0.1;
			media.dispatchEvent(new Event("timeupdate"));
		}
	}, 100);
	return () => {
		clearInterval(clock);
		for (const [name, descriptor] of saved) {
			if (descriptor) Object.defineProperty(prototype, name, descriptor);
			else Reflect.deleteProperty(prototype, name);
		}
	};
}

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
									playbackId: "yiAwSuxIOVkCUZemf5jOzwfqwG01lH46A2GjtF8moZ8Q",
									poster: "/images/verto/verto-film-poster.jpg",
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
/** A deterministic transport checks deactivation and rejects a late engine play event. */
export const VideoStopsOnImage: Story = {
	args: { video: true },
	beforeEach: installDeterministicTransport,
	play: async ({ canvas, canvasElement, userEvent }) => {
		await userEvent.click(canvas.getByRole("button", { name: "Expand project images" }));
		const body = within(canvasElement.ownerDocument.body);
		const dialogElement = await body.findByRole("dialog");
		const dialog = within(dialogElement);
		await waitFor(() =>
			expect(dialog.getByRole("button", { name: "Close expanded viewer" })).toBeVisible(),
		);
		await waitFor(
			() =>
				expect(
					dialogElement.querySelector("mux-video[data-player-initialized]"),
				).not.toBeNull(),
			{ timeout: 15_000 },
		);
		const media = dialogElement.querySelector("mux-video") as HTMLVideoElement | null;
		if (!media) throw new Error("Expected an initialized video");
		if (media.paused) await userEvent.click(dialog.getByRole("button", { name: "Play video" }));
		await waitFor(() => expect(media.currentTime).toBeGreaterThan(0), { timeout: 15_000 });
		await userEvent.click(dialog.getByRole("button", { name: "Next slide" }));
		await waitFor(() => expect(dialogElement).toHaveAccessibleName("Verto review editor"));
		await waitFor(() => expect(media.paused).toBe(true));
		const stoppedAt = media.currentTime;
		await new Promise((resolve) => setTimeout(resolve, 750));
		expect(media.currentTime).toBeCloseTo(stoppedAt, 1);
		// A delayed engine event must not restart an inactive slide.
		await media.play();
		expect(media.paused).toBe(true);
		await userEvent.click(dialog.getByLabelText("Read full media description"));
		const description = dialog.getByRole("region", { name: "Full media description" });
		await expect(description).toBeVisible();
		await expect(description).toHaveTextContent("Verto review editor");
		description.focus();
		await userEvent.keyboard("{Home}");
		await expect(dialogElement).toHaveAccessibleName("Verto review editor");
		await expect(dialog.getByRole("button", { name: "Close expanded viewer" })).toBeVisible();
		await userEvent.keyboard("{Escape}");
		await waitFor(() => expect(body.queryByRole("dialog")).not.toBeInTheDocument());
		await expect(canvas.getByRole("button", { name: "Expand project images" })).toHaveFocus();
	},
};
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
