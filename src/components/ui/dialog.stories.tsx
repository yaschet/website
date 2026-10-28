import { RiInformationLine } from "@remixicon/react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useId } from "react";
import { expect, waitFor, within } from "storybook/test";
import { SinglePreviewDocsPage } from "../../../.storybook/workshop-docs";
import { Button } from "./button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "./dialog";
import { Input } from "./form/input";
import { Label } from "./form/label";

function DialogExample({ size = "default" }: { size?: "sm" | "default" | "lg" }) {
	const id = useId();
	return (
		<Dialog>
			<DialogTrigger render={<Button variant="outline" />}>Edit example</DialogTrigger>
			<DialogContent size={size}>
				<DialogHeader icon={<RiInformationLine />}>
					<DialogTitle>Edit example</DialogTitle>
					<DialogDescription>
						A local example. Changes are not saved or submitted.
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-2">
					<Label htmlFor={id}>Display name</Label>
					<Input id={id} defaultValue="Yaschet" />
				</div>
				<DialogFooter>
					<DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
					<DialogClose render={<Button />}>Done</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
const meta = {
	id: "primitives-dialog",
	title: "Components/Overlays/Dialog",
	component: DialogExample,
	tags: ["autodocs"],
	parameters: {
		docs: {
			page: SinglePreviewDocsPage,
			description: {
				component:
					"The actual Foundation modal: 384/480/640px content widths, a shared icon chamber and heading, 16px padding, 40px close control, owned focus and keyboard dismissal. Open the example to inspect it in context.",
			},
		},
	},
} satisfies Meta<typeof DialogExample>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Small: Story = { args: { size: "sm" } };
export const Large: Story = { args: { size: "lg" } };
export const KeyboardAndFocus: Story = {
	play: async ({ canvasElement, userEvent }) => {
		const canvas = within(canvasElement);
		const document = within(canvasElement.ownerDocument.body);
		const trigger = canvas.getByRole("button", { name: "Edit example" });
		trigger.focus();
		await userEvent.keyboard("{Enter}");
		const dialog = await document.findByRole("dialog", { name: "Edit example" });
		await waitFor(() =>
			expect(dialog.contains(canvasElement.ownerDocument.activeElement)).toBe(true),
		);
		await userEvent.keyboard("{Escape}");
		await waitFor(() => expect(document.queryByRole("dialog")).not.toBeInTheDocument());
		await expect(trigger).toHaveFocus();
	},
};
