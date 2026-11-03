import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { usePathname } from "@storybook/nextjs-vite/navigation.mock";
import { PostContentRSC } from "@/src/components/content/post-content-rsc";
import { articlePreview, longArticlePreview } from "../../../.storybook/blog-fixtures";
import { fullPageDecorator, fullPageParameters } from "../../../.storybook/full-page-preview";

const meta = {
	id: "pages-blog-post",
	title: "Pages/Blog Post",
	component: PostContentRSC,
	tags: ["autodocs"],
	parameters: {
		...fullPageParameters,
		docs: {
			...fullPageParameters.docs,
			description: {
				component:
					"The production article template with unpublished workshop content. Includes headings, lists, a quote, a table and a long code line for mobile review. No public blog post is created.",
			},
		},
	},
	decorators: [fullPageDecorator],
	args: { post: articlePreview },
	beforeEach: () => {
		usePathname.mockReturnValue(articlePreview.urlPath);
	},
} satisfies Meta<typeof PostContentRSC>;
export default meta;
type Story = StoryObj<typeof meta>;

export const FullPage: Story = {};
export const LongTitle: Story = { args: { post: longArticlePreview } };
