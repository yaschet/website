import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useId } from "react";
import { expect } from "storybook/test";
import { Input } from "./input";
import { Label } from "./label";
import { Textarea } from "./textarea";

function Fields({
	error = false,
	disabled = false,
	readOnly = false,
}: {
	error?: boolean;
	disabled?: boolean;
	readOnly?: boolean;
}) {
	const id = useId();
	const nameId = `${id}-name`;
	const messageId = `${id}-message`;
	return (
		<div className="portfolio-stack-related w-full max-w-xl">
			<div className="portfolio-stack-tight">
				<Label htmlFor={nameId}>Name</Label>
				<Input
					id={nameId}
					name="name"
					hasError={error}
					aria-describedby={error ? `${nameId}-error` : undefined}
					disabled={disabled}
					readOnly={readOnly}
					defaultValue={readOnly ? "Read-only example" : ""}
					placeholder="Your name"
				/>
				{error && (
					<p
						id={`${nameId}-error`}
						className="portfolio-caption text-destructive-600 dark:text-destructive-400"
					>
						Enter your name.
					</p>
				)}
			</div>
			<div className="portfolio-stack-tight">
				<Label htmlFor={messageId}>Message</Label>
				<Textarea
					id={messageId}
					name="message"
					hasError={error}
					aria-invalid={error}
					aria-describedby={error ? `${messageId}-error` : undefined}
					disabled={disabled}
					readOnly={readOnly}
					placeholder="Your message"
				/>
				{error && (
					<p
						id={`${messageId}-error`}
						className="portfolio-caption text-destructive-600 dark:text-destructive-400"
					>
						Enter a message.
					</p>
				)}
			</div>
		</div>
	);
}
const meta = {
	id: "forms-fields",
	title: "Components/Forms/Fields",
	component: Fields,
	tags: ["autodocs"],
} satisfies Meta<typeof Fields>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Invalid: Story = { args: { error: true } };
export const Disabled: Story = { args: { disabled: true } };
export const ReadOnly: Story = { args: { readOnly: true } };
export const KeyboardEntry: Story = {
	play: async ({ canvas, userEvent }) => {
		const name = canvas.getByRole("textbox", { name: "Name" });
		name.focus();
		await userEvent.type(name, "Review example");
		await userEvent.tab();
		await expect(canvas.getByRole("textbox", { name: "Message" })).toHaveFocus();
		await expect(name).toHaveValue("Review example");
	},
};
