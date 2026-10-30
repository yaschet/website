import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { SwissGridBox, SwissGridRow } from "../ui/swiss-grid";
import { ProfileSection } from "./profile-section";
import { SiteHero } from "./site-hero";

const meta = {
	id: "layout-sitehero",
	title: "Components/Content/Site Hero",
	component: SiteHero,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component:
					"The production hero. A soft sharp/blur boundary travels through the title in reading order without moving its geometry. The primary link uses a staggered character reel and an independent arrow exchange inside a square chamber. Pending feedback stays centered. Pointer motion is interruptible; keyboard, touch and reduced motion keep the resting control immediate. See docs/design-system.md for the motion and geometry contracts.",
			},
		},
	},
	decorators: [
		(Story) => (
			<div className="workshop-stage">
				<div className="mx-auto max-w-5xl">
					<SwissGridBox className="portfolio-hero-frame">
						<SwissGridRow>
							<Story />
						</SwissGridRow>
					</SwissGridBox>
				</div>
			</div>
		),
	],
} satisfies Meta<typeof SiteHero>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvas }) => {
		await expect(
			canvas.getByRole("heading", { name: "Complex systems, clean interfaces." }),
		).toBeVisible();
		await expect(canvas.getByRole("link", { name: "Case studies" })).toHaveAttribute(
			"href",
			"/case-studies",
		);
		await expect(canvas.getByRole("link", { name: "Email" })).toHaveAttribute(
			"href",
			"/contact",
		);
	},
};
export const WithProfile: Story = {
	render: () => (
		<>
			<ProfileSection />
			<SiteHero />
		</>
	),
};
