import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Image from "next/image";
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

/** Review the control against real footage rather than only the workshop canvas. */
export const OnArtwork: Story = {
	render: (args) => (
		<div className="grid w-[min(960px,calc(100vw-40px))] gap-5 sm:grid-cols-2">
			{[
				{
					src: "/images/verto/verto-film-poster.jpg",
					label: "Bright artwork",
					alt: "Verto translation editor with a scanned document beside its translation",
				},
				{
					src: "/images/clearway-phoenix/phase-2/p2-archive-dashboard-hero.png",
					label: "Dark artwork",
					alt: "Phoenix import dashboard on a dark terminal surface",
				},
			].map(({ src, label, alt }) => (
				<figure key={src} className="m-0 grid gap-3">
					<div className="relative grid aspect-video place-items-center overflow-hidden">
						<Image
							src={src}
							alt={alt}
							fill
							sizes="(min-width: 640px) 470px, calc(100vw - 40px)"
							className="object-cover"
						/>
						<GalleryPlayButton {...args} className="relative" />
					</div>
					<figcaption className="portfolio-meta text-muted-foreground">
						{label}
					</figcaption>
				</figure>
			))}
		</div>
	),
};
