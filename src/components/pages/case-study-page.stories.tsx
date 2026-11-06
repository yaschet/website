import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { usePathname } from "@storybook/nextjs-vite/navigation.mock";
import { expect } from "storybook/test";
import { ProjectContentRSC } from "@/src/components/content/project-content-rsc";
import { PageGalleryScope } from "@/src/components/ui/page-gallery-scope";
import { fullPageDecorator, fullPageParameters } from "../../../.storybook/full-page-preview";
import { erp, phoenix, portal, verto } from "../../../.storybook/project-fixtures";

const meta = {
	id: "pages-case-study",
	title: "Pages/Case Study",
	component: ProjectContentRSC,
	tags: ["autodocs"],
	parameters: {
		...fullPageParameters,
		docs: {
			...fullPageParameters.docs,
			description: {
				component:
					"Complete authored articles, using the same MDX, page shell and media components as the website. ERP intentionally has no cover media. The long-title state is a layout fixture.",
			},
		},
	},
	decorators: [
		fullPageDecorator,
		(Story) => (
			<PageGalleryScope>
				<Story />
			</PageGalleryScope>
		),
	],
	args: { project: verto },
	beforeEach: ({ args }) => {
		usePathname.mockReturnValue(args.project.urlPath);
	},
	play: async ({ canvas, canvasElement, args }) => {
		await expect(
			canvas.getByRole("heading", { level: 1, name: args.project.title }),
		).toBeVisible();
		const opening = canvasElement.querySelector("#project-main header");
		if (args.project.overview) {
			await expect(opening).toHaveTextContent(args.project.overview.challenge);
			await expect(opening).toHaveTextContent(args.project.overview.summary);
		}
		const panels = canvasElement.querySelectorAll(
			'#project-main figure[data-slot="media-panel"]',
		);
		await expect(panels).toHaveLength(args.project.slug === "clearway-erp" ? 0 : 3);
		if (panels[0] && opening) {
			await expect(
				opening.compareDocumentPosition(panels[0]) & Node.DOCUMENT_POSITION_FOLLOWING,
			).toBeTruthy();
		}
	},
} satisfies Meta<typeof ProjectContentRSC>;
export default meta;
type Story = StoryObj<typeof meta>;

export const FullPage: Story = { name: "Full page · Verto" };
export const Phoenix: Story = { args: { project: phoenix } };
export const Portal: Story = { args: { project: portal } };
export const Erp: Story = { name: "ERP · No cover media", args: { project: erp } };
export const LongTitle: Story = {
	args: {
		project: {
			...erp,
			title: "A longer case study title about the connected workflows behind an agency's operations and billing",
		},
	},
};
