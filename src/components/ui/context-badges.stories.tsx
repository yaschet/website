import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { LocationBadge, TimeBadge } from "./context-badges";

/**
 * Badges for header and navigation context.
 */
const meta: Meta = {
	title: "Components/ContextBadges",
	tags: ["autodocs"],
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component: "Badges with icon and text content. Integrates with Reveal animations.",
			},
		},
	},
};

export default meta;

type Story = StoryObj;

/**
 * High-fidelity location indicator with edge-mounted flag insignia.
 */
export const Location: Story = {
	render: () => <LocationBadge />,
};

/**
 * Time indicator with GMT calculation.
 */
export const Time: Story = {
	render: () => <TimeBadge />,
};

/**
 * Demonstrates the architectural alignment when multiple badges are clustered.
 */
export const Group: Story = {
	render: () => (
		<div className="flex items-center gap-3">
			<LocationBadge />
			<TimeBadge />
		</div>
	),
};
