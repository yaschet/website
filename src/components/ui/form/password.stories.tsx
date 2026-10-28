import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useId } from "react";
import { expect, within } from "storybook/test";
import { Input } from "./input";
import { Label } from "./label";

function PasswordExample({
	hasError = false,
	disabled = false,
}: {
	hasError?: boolean;
	disabled?: boolean;
}) {
	const id = useId();
	return (
		<div className="grid w-full max-w-sm gap-2">
			<Label htmlFor={id}>Example password</Label>
			<Input
				id={id}
				hasError={hasError}
				disabled={disabled}
				type="password"
				autoComplete="off"
				defaultValue="Example only"
			/>
		</div>
	);
}
const meta = {
	id: "forms-password",
	title: "Components/Forms/Password",
	component: PasswordExample,
	tags: ["autodocs"],
	parameters: {
		layout: "padded",
		docs: {
			description: {
				component:
					"The Foundation input with its shared two-icon reveal motion. Pointer activation preserves text focus; keyboard activation remains on the reveal control. Masking changes immediately, independently of the decorative transition.",
			},
		},
	},
} satisfies Meta<typeof PasswordExample>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Invalid: Story = { args: { hasError: true } };
export const Disabled: Story = { args: { disabled: true } };
export const RevealAndHide: Story = {
	play: async ({ canvasElement, userEvent }) => {
		const canvas = within(canvasElement);
		const input = canvas.getByLabelText("Example password");
		await userEvent.click(input);
		await userEvent.click(canvas.getByRole("button", { name: "Show password" }));
		await expect(input).toHaveAttribute("type", "text");
		await expect(input).toHaveValue("Example only");
		await expect(input).toHaveFocus();
		await userEvent.tab();
		await expect(canvas.getByRole("button", { name: "Hide password" })).toHaveFocus();
		await userEvent.keyboard("{Enter}");
		await expect(input).toHaveAttribute("type", "password");
		await expect(canvas.getByRole("button", { name: "Show password" })).toHaveFocus();
	},
};
