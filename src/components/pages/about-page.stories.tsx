import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { usePathname } from "@storybook/nextjs-vite/navigation.mock";
import AboutPage from "@/src/app/about/page";
import { fullPageDecorator, fullPageParameters } from "../../../.storybook/full-page-preview";

const meta = {
	id: "pages-about",
	title: "Pages/About",
	component: AboutPage,
	tags: ["autodocs"],
	parameters: fullPageParameters,
	decorators: [fullPageDecorator],
	beforeEach: () => {
		usePathname.mockReturnValue("/about");
	},
} satisfies Meta<typeof AboutPage>;
export default meta;
type Story = StoryObj<typeof meta>;

export const FullPage: Story = {};
