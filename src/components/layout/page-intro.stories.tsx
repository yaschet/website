import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PageIntro } from "./page-intro";

const meta = {
	id: "layout-pageintro",
	title: "Components/Content/Page Intro",
	component: PageIntro,
	tags: ["autodocs"],
	parameters: { layout: "fullscreen" },
	decorators: [
		(Story) => (
			<div className="portfolio-box-pad mx-auto max-w-5xl">
				<Story />
			</div>
		),
	],
	args: {
		eyebrow: "About",
		title: "How I work.",
		description: "Engineering principles and the path that produced them.",
	},
} satisfies Meta<typeof PageIntro>;
export default meta;
type Story = StoryObj<typeof meta>;
export const About: Story = {};
export const Contact: Story = {
	args: {
		eyebrow: "Contact",
		title: "Let’s talk.",
		description:
			"Internal systems, workflow software, and customer-facing products where clear interfaces sit on top of heavy logic.",
	},
};
