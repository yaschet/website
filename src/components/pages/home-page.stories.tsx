import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { usePathname } from "@storybook/nextjs-vite/navigation.mock";
import { fullPageDecorator, fullPageParameters } from "../../../.storybook/full-page-preview";
import { projectSummaries } from "../../../.storybook/project-fixtures";
import { HomePageContent } from "./home-page";

const meta = {
	id: "pages-home",
	title: "Pages/Home",
	component: HomePageContent,
	tags: ["autodocs"],
	parameters: fullPageParameters,
	decorators: [fullPageDecorator],
	args: { projects: projectSummaries },
	beforeEach: () => {
		usePathname.mockReturnValue("/");
	},
} satisfies Meta<typeof HomePageContent>;
export default meta;
type Story = StoryObj<typeof meta>;

export const FullPage: Story = {};
export const EmptyArchive: Story = { args: { projects: [] } };
