import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { usePathname } from "@storybook/nextjs-vite/navigation.mock";
import { articlePreview, longArticlePreview } from "../../../.storybook/blog-fixtures";
import { fullPageDecorator, fullPageParameters } from "../../../.storybook/full-page-preview";
import { BlogPageContent } from "./blog-page";

const meta = {
	id: "pages-blog",
	title: "Pages/Blog",
	component: BlogPageContent,
	tags: ["autodocs"],
	parameters: {
		...fullPageParameters,
		docs: {
			...fullPageParameters.docs,
			description: {
				component:
					"Populated article index with clearly labelled workshop content. Empty is the current website state; these fixtures do not publish an article.",
			},
		},
	},
	decorators: [fullPageDecorator],
	args: { posts: [articlePreview] },
	beforeEach: () => {
		usePathname.mockReturnValue("/blog");
	},
} satisfies Meta<typeof BlogPageContent>;
export default meta;
type Story = StoryObj<typeof meta>;

export const FullPage: Story = {};
export const Empty: Story = { args: { posts: [] } };
export const LongTitle: Story = { args: { posts: [longArticlePreview] } };
