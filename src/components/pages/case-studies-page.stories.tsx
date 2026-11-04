import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { usePathname } from "@storybook/nextjs-vite/navigation.mock";
import { fullPageDecorator, fullPageParameters } from "../../../.storybook/full-page-preview";
import { projectSummaries } from "../../../.storybook/project-fixtures";
import { CaseStudiesPageContent } from "./case-studies-page";

const meta = {
	id: "pages-case-studies",
	title: "Pages/Case Studies",
	component: CaseStudiesPageContent,
	tags: ["autodocs"],
	parameters: fullPageParameters,
	decorators: [fullPageDecorator],
	args: { projects: projectSummaries },
	beforeEach: () => {
		usePathname.mockReturnValue("/case-studies");
	},
} satisfies Meta<typeof CaseStudiesPageContent>;
export default meta;
type Story = StoryObj<typeof meta>;

export const FullPage: Story = {};
export const EmptyArchive: Story = { args: { projects: [] } };
