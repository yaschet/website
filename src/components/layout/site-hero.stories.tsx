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
	parameters: { layout: "fullscreen" },
	decorators: [
		(Story) => (
			<div className="mx-auto max-w-7xl">
				<SwissGridBox>
					<SwissGridRow>
						<Story />
					</SwissGridRow>
				</SwissGridBox>
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
