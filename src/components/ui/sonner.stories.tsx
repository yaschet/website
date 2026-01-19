/**
 * Storybook for the Swiss Design Toast component (Sonner).
 *
 * @remarks
 * Demonstrates the "Swiss Design" aesthetics:
 * - 0px Radius ("The Blade")
 * - No Shadows (Depth via Border/Contrast)
 * - Uppercase Bold Titles
 * - Monospace Descriptions
 * - Regular Weight Icons
 */

import type { Meta, StoryObj } from "@storybook/react";
import { toast } from "sonner";
import { Button } from "@/src/components/ui/button";
import { Toaster } from "@/src/components/ui/sonner";

// Wrapper component to trigger toasts
const ToastDemo = ({ action }: { action: () => void }) => {
	return (
		<div className="flex flex-col items-center justify-center gap-4 p-8">
			<Button onClick={action}>Trigger Toast</Button>
			<Toaster />
		</div>
	);
};

const meta: Meta<typeof Toaster> = {
	title: "UI/Toaster",
	component: Toaster,
	tags: ["autodocs"],
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component:
					"An opinionated, high-performance toast notification system inspired by Swiss Design patterns. Features 0px radius, high contrast, and architectural typography.",
			},
		},
	},
	decorators: [
		(Story) => (
			<div className="relative flex min-h-[300px] min-w-[600px] items-center justify-center border border-surface-200 bg-surface-50 dark:border-surface-800 dark:bg-surface-950">
				<Story />
			</div>
		),
	],
};

export default meta;

type Story = StoryObj<typeof Toaster>;

/**
 * The standard toast notification. Useful for simple feedback.
 */
export const Default: Story = {
	render: () => <ToastDemo action={() => toast("Operation completed.")} />,
};

/**
 * Toast with a description. Uses the Monospace font for data-heavy context.
 */
export const WithDescription: Story = {
	render: () => (
		<ToastDemo
			action={() =>
				toast("File Uploaded", {
					description: "IMG_2049.jpg (4.2MB) has been processed.",
				})
			}
		/>
	),
};

/**
 * Success state. Uses "Regular" weight CheckIcon and success semantic colors.
 */
export const Success: Story = {
	render: () => (
		<ToastDemo
			action={() =>
				toast.success("Deployment Successful", {
					description: "Production build v4.2.0 is now live.",
				})
			}
		/>
	),
};

/**
 * Error state. Uses "Regular" weight WarningDiamondIcon and destructive semantic colors.
 */
export const ErrorState: Story = {
	render: () => (
		<ToastDemo
			action={() =>
				toast.error("Connection Failed", {
					description: "Could not resolve hostname 'api.production'.",
				})
			}
		/>
	),
};

/**
 * Warning state. Uses "Regular" weight ExclamationMarkIcon and warning semantic colors.
 */
export const Warning: Story = {
	render: () => (
		<ToastDemo
			action={() =>
				toast.warning("High Memory Usage", {
					description: "Process 8021 is consuming 85% RAM.",
				})
			}
		/>
	),
};

/**
 * Info state. Uses "Regular" weight InfoIcon and info semantic colors.
 */
export const Info: Story = {
	render: () => (
		<ToastDemo
			action={() =>
				toast.info("Update Available", {
					description: "A new version of the system is ready to install.",
				})
			}
		/>
	),
};

/**
 * Action toast. Includes a button for user interaction.
 */
export const WithAction: Story = {
	render: () => (
		<ToastDemo
			action={() =>
				toast("Undo Delete", {
					description: "Project 'Falcon' has been moved to trash.",
					action: {
						label: "Undo",
						onClick: () => {
							// Handle undo
						},
					},
				})
			}
		/>
	),
};

/**
 * Promise toast. Automatically transitions from Loading -> Success/Error.
 */
export const PromiseToast: Story = {
	render: () => (
		<ToastDemo
			action={() =>
				toast.promise(() => new Promise((resolve) => setTimeout(resolve, 2000)), {
					loading: "Compiling assets...",
					success: "Compilation finished in 2.1s",
					error: "Compilation failed",
				})
			}
		/>
	),
};
