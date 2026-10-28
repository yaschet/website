import { RiCheckboxCircleLine, RiErrorWarningLine, RiInformationLine } from "@remixicon/react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Alert, AlertDescription, AlertTitle } from "./alert";
import { IconChamber } from "./icon-chamber";

const meta = {
	id: "primitives-alert",
	title: "Components/Feedback/Alert",
	component: Alert,
	args: { appearance: "chamber", role: "status" },
	tags: ["autodocs"],
	parameters: {
		layout: "padded",
		docs: {
			description: {
				component:
					"Yaschet Foundation's compact inline feedback: a joined 44px semantic chamber, 20px glyph and 12px text insets. Use StatusDisplay for persistent state changes and first-line alignment on long messages.",
			},
		},
	},
	render: (args) => (
		<Alert {...args} className="max-w-sm">
			<IconChamber aria-hidden>
				<RiInformationLine />
			</IconChamber>
			<AlertDescription>Your draft is safe.</AlertDescription>
		</Alert>
	),
} satisfies Meta<typeof Alert>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Success: Story = {
	args: { variant: "success" },
	render: (args) => (
		<Alert {...args} className="max-w-sm">
			<IconChamber aria-hidden>
				<RiCheckboxCircleLine />
			</IconChamber>
			<AlertDescription>Message sent. Thanks for getting in touch.</AlertDescription>
		</Alert>
	),
};
export const Warning: Story = {
	args: { variant: "warning" },
	render: (args) => (
		<Alert {...args} className="max-w-sm">
			<IconChamber aria-hidden>
				<RiErrorWarningLine />
			</IconChamber>
			<AlertDescription>Add an email address so I can reply.</AlertDescription>
		</Alert>
	),
};
export const ErrorState: Story = {
	args: { variant: "destructive" },
	render: (args) => (
		<Alert {...args} className="max-w-sm">
			<IconChamber aria-hidden>
				<RiErrorWarningLine />
			</IconChamber>
			<AlertDescription>
				Message not sent. Your draft is safe. Try again shortly.
			</AlertDescription>
		</Alert>
	),
};
export const SurfaceWithTitle: Story = {
	args: { appearance: "surface", variant: "info" },
	render: (args) => (
		<Alert {...args} className="max-w-sm">
			<RiInformationLine aria-hidden />
			<AlertTitle>Draft restored</AlertTitle>
			<AlertDescription>Continue from where you left off.</AlertDescription>
		</Alert>
	),
};
