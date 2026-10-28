import { RiCheckLine, RiErrorWarningLine, RiMailLine } from "@remixicon/react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect } from "storybook/test";
import { Button } from "./button";
import { Spinner } from "./spinner";
import { StatusDisplay, type StatusDisplayState } from "./status-display";

const items = {
	idle: { icon: <RiMailLine />, description: "Ready to send." },
	pending: { icon: <Spinner aria-hidden />, description: "Sending message…" },
	success: { icon: <RiCheckLine />, description: "Message sent." },
	error: { icon: <RiErrorWarningLine />, description: "Message not sent. Try again shortly." },
};

function StateExample() {
	const [state, setState] = useState<StatusDisplayState>("idle");
	return (
		<div className="grid w-full max-w-sm gap-4">
			<StatusDisplay state={state} items={items} />
			<div className="flex flex-wrap gap-2">
				{(
					[
						["idle", "Ready"],
						["pending", "Sending"],
						["success", "Sent"],
						["error", "Failed"],
					] as const
				).map(([key, label]) => (
					<Button
						key={key}
						variant="soft"
						size="sm"
						aria-pressed={state === key}
						onClick={() => setState(key)}
					>
						{label}
					</Button>
				))}
			</div>
		</div>
	);
}

const meta = {
	id: "primitives-statusdisplay",
	title: "Components/Feedback/Status Display",
	component: StatusDisplay,
	tags: ["autodocs"],
	args: { state: "idle", items },
	parameters: {
		layout: "padded",
		docs: {
			description: {
				component:
					"The owned Foundation feedback composition: a 48px rail, 20px glyph at a 14px inset, and 16px text padding. Glyph and first text line share the same center. One live region persists through states; inactive content is inert. These are local examples and send no message.",
			},
		},
	},
	decorators: [
		(Story) => (
			<div className="w-full max-w-sm">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof StatusDisplay>;
export default meta;
type Story = StoryObj<typeof meta>;

export const States: Story = {
	render: () => <StateExample />,
	play: async ({ canvas, userEvent }) => {
		const display = canvas.getByRole("status");
		for (const [label, state] of [
			["Sending", "pending"],
			["Failed", "error"],
			["Sent", "success"],
			["Ready", "idle"],
		]) {
			await userEvent.click(canvas.getByRole("button", { name: label }));
			await expect(canvas.getByRole("status")).toBe(display);
			await expect(display).toHaveAttribute("data-state", state);
			await expect(
				display.querySelectorAll('[data-status-copy][aria-hidden="false"]'),
			).toHaveLength(1);
			await expect(display.querySelectorAll("[data-status-copy][inert]")).toHaveLength(3);
		}
	},
};
export const WithTitle: Story = {
	args: {
		state: "error",
		items: {
			...items,
			error: {
				...items.error,
				title: "Message not sent",
				description: "Your draft is safe. Try again shortly.",
			},
		},
	},
};
export const LongMessage: Story = {
	args: {
		state: "error",
		items: {
			...items,
			error: {
				...items.error,
				title: "Message not sent",
				description:
					"Your message could not be delivered right now. Your draft is still available, so you can try again shortly without writing it again.",
			},
		},
	},
};
export const LineRhythm: Story = {
	render: () => (
		<div className="grid gap-4">
			{[1, 2, 3].map((lines) => (
				<StatusDisplay
					key={lines}
					state="error"
					items={{
						...items,
						error: {
							...items.error,
							description: ["Status line 1.", "Status line 2.", "Status line 3."]
								.slice(0, lines)
								.map((line) => <div key={line}>{line}</div>),
						},
					}}
				/>
			))}
		</div>
	),
};
