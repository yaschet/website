import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { usePathname } from "@storybook/nextjs-vite/navigation.mock";
import { expect } from "storybook/test";
import { FloatingNav } from "@/src/components/layout/floating-nav";
import { SiteHeader } from "@/src/components/layout/site-header";
import { WorkshopPagePreview } from "../../.storybook/page-preview";
import Loading from "./loading";

const meta = {
	title: "Pages/Loading",
	component: Loading,
	beforeEach: () => {
		usePathname.mockReturnValue("/");
	},
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component:
					"The production content-only fallback. The header and navigation stay available while the route streams; short loads skip the delayed visual mark. Reduced motion shows the completed square.",
			},
		},
	},
	decorators: [
		(Story) => (
			<WorkshopPagePreview>
				<Story />
			</WorkshopPagePreview>
		),
	],
} satisfies Meta<typeof Loading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithNavigation: Story = {
	name: "With navigation",
	render: () => (
		<>
			<SiteHeader />
			<Loading />
			<FloatingNav />
		</>
	),
	play: async ({ canvas, canvasElement }) => {
		const header = canvasElement.querySelector("#header");
		await expect(header).toBeVisible();
		await expect(header).not.toHaveAttribute("inert");
		await expect(canvas.getByRole("navigation", { name: "Main navigation" })).toBeVisible();
		await expect(canvas.getByRole("status", { name: "Loading page" })).toBeVisible();
	},
};
