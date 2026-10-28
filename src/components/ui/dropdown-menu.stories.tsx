import { RiArrowDownSLine as CaretDown } from "@remixicon/react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, waitFor, within } from "storybook/test";
import { SinglePreviewDocsPage } from "../../../.storybook/workshop-docs";
import { Button } from "./button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "./dropdown-menu";

function PlaybackMenu({ defaultOpen = false }: { defaultOpen?: boolean }) {
	const [speed, setSpeed] = useState("1");
	return (
		<div className="portfolio-box-pad portfolio-stack-related min-h-[280px]">
			<DropdownMenu defaultOpen={defaultOpen} modal={false}>
				<DropdownMenuTrigger asChild>
					<Button variant="outlined">
						Playback speed <CaretDown size={16} aria-hidden />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="start" sideOffset={8}>
					<DropdownMenuRadioGroup value={speed} onValueChange={setSpeed}>
						<DropdownMenuLabel>Playback speed</DropdownMenuLabel>
						<DropdownMenuRadioItem closeOnClick value="0.5">
							0.5×
						</DropdownMenuRadioItem>
						<DropdownMenuRadioItem closeOnClick value="1">
							Normal
						</DropdownMenuRadioItem>
						<DropdownMenuRadioItem closeOnClick value="1.5">
							1.5×
						</DropdownMenuRadioItem>
						<DropdownMenuRadioItem closeOnClick value="2" disabled>
							2× unavailable
						</DropdownMenuRadioItem>
					</DropdownMenuRadioGroup>
				</DropdownMenuContent>
			</DropdownMenu>
			<p className="portfolio-body-sm" role="status">
				Selected speed: {speed}×
			</p>
		</div>
	);
}

const meta = {
	id: "primitives-dropdownmenu",
	title: "Components/Overlays/Dropdown Menu",
	component: PlaybackMenu,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		docs: {
			page: SinglePreviewDocsPage,
			description: {
				component:
					"Production dropdown primitives composed as a non-modal speed selector without a networked video. Review selection, disabled options, Escape, and returned trigger focus. The production video settings composition has its own stories under Components/Media.",
			},
		},
	},
} satisfies Meta<typeof PlaybackMenu>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Open: Story = {
	args: { defaultOpen: true },
	// Focus sentinels redirect Tab; they are deliberately hidden from the accessibility tree.
	parameters: { a11y: { context: { exclude: ["[data-base-ui-focus-guard]"] } } },
	play: async ({ canvasElement }) => {
		const document = within(canvasElement.ownerDocument.body);
		await waitFor(() => expect(document.getByRole("menu")).toBeVisible());
		await waitFor(() =>
			expect(
				document.getByRole("menu").contains(canvasElement.ownerDocument.activeElement),
			).toBe(true),
		);
	},
};
export const KeyboardSelection: Story = {
	play: async ({ canvas, canvasElement, userEvent }) => {
		const trigger = canvas.getByRole("button", { name: "Playback speed" });
		const document = within(canvasElement.ownerDocument.body);
		trigger.focus();
		await userEvent.keyboard("{ArrowDown}");
		await waitFor(() => expect(document.getByRole("menu")).toBeVisible());
		await userEvent.keyboard("{End}");
		await expect(document.getByRole("menuitemradio", { name: "2× unavailable" })).toHaveFocus();
		await userEvent.keyboard("{Enter}");
		await expect(canvas.getByRole("status")).toHaveTextContent("Selected speed: 1×");
		await expect(document.getByRole("menu")).toBeVisible();
		await userEvent.keyboard("{ArrowUp}");
		await expect(document.getByRole("menuitemradio", { name: "1.5×" })).toHaveFocus();
		await userEvent.keyboard("{Enter}");
		await waitFor(() => expect(trigger).toHaveFocus());
		await expect(canvas.getByRole("status")).toHaveTextContent("Selected speed: 1.5×");
		await userEvent.keyboard("{ArrowDown}");
		await waitFor(() => expect(document.getByRole("menu")).toBeVisible());
		await userEvent.keyboard("{Escape}");
		await waitFor(() => expect(document.queryByRole("menu")).not.toBeInTheDocument());
		await expect(trigger).toHaveFocus();
		await waitFor(() =>
			expect(
				canvasElement.ownerDocument.querySelectorAll("[data-base-ui-focus-guard]"),
			).toHaveLength(0),
		);
	},
};
