import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useCallback, useEffect, useState } from "react";
import { expect, waitFor, within } from "storybook/test";
import { SinglePreviewDocsPage } from "../../../.storybook/workshop-docs";
import { Button } from "./button";
import { createToastManager, Toaster } from "./sonner";

type ToastKind = "message" | "success" | "error" | "warning" | "info";
function ToastExample({
	kind = "message",
	title = "Draft saved",
	description,
	action = false,
}: {
	kind?: ToastKind;
	title?: string;
	description?: string;
	action?: boolean;
}) {
	const [manager] = useState(() => createToastManager());
	const [preview, setPreview] = useState<HTMLDivElement | null>(null);
	const [result, setResult] = useState("No action taken");
	const show = useCallback(() => {
		manager.add({
			id: "example-notification",
			title,
			type: kind,
			description,
			timeout: 0,
			...(action
				? {
						actionProps: {
							children: "Undo",
							onClick: () => {
								setResult("Example change undone");
								manager.close("example-notification");
							},
						},
					}
				: {}),
		});
	}, [manager, kind, title, description, action]);
	useEffect(() => {
		show();
		return () => manager.close();
	}, [manager, show]);
	return (
		<div
			ref={setPreview}
			data-toast-preview=""
			className="relative min-h-64 w-full max-w-xl p-4 [contain:layout]"
		>
			<div className="flex flex-wrap items-center gap-3">
				<Button variant="soft" onClick={show}>
					Show notification
				</Button>
				{action && (
					<p role="status" className="portfolio-body-sm">
						{result}
					</p>
				)}
			</div>
			<Toaster toastManager={manager} container={preview} />
		</div>
	);
}
const meta = {
	id: "primitives-toaster",
	title: "Components/Feedback/Toasts",
	component: ToastExample,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		docs: {
			page: SinglePreviewDocsPage,
			description: {
				component:
					"Base UI toast behavior with Yaschet's padded notification heading: matching 40px icon and soft dismiss chambers, centered 14/20 title and 12/16 supporting text, and 16px insets and gaps. Each preview owns an isolated manager and portal host. No requests are sent.",
			},
		},
	},
} satisfies Meta<typeof ToastExample>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
	args: { description: "You can keep editing before sending." },
};
export const Success: Story = {
	args: { kind: "success", title: "Message sent", description: "Thanks for getting in touch." },
};
export const ErrorState: Story = {
	args: {
		kind: "error",
		title: "Message not sent",
		description: "Your draft is safe. Try again shortly.",
	},
};
export const Warning: Story = {
	args: {
		kind: "warning",
		title: "Check your message",
		description: "Add an email address so I can reply.",
	},
};
export const Info: Story = {
	args: {
		kind: "info",
		title: "Draft restored",
		description: "Continue from where you left off.",
	},
};
export const WithAction: Story = {
	args: { action: true, title: "Draft cleared", description: "Restore this example draft." },
	play: async ({ canvasElement, userEvent }) => {
		const document = within(canvasElement.ownerDocument.body);
		await userEvent.click(await document.findByRole("button", { name: "Undo" }));
		await expect(document.getByRole("status")).toHaveTextContent("Example change undone");
		await waitFor(() =>
			expect(
				canvasElement.ownerDocument.querySelector('[data-slot="toast"]'),
			).not.toBeInTheDocument(),
		);
	},
};
export const LongMessage: Story = {
	args: {
		kind: "error",
		title: "Message not sent",
		description:
			"Your message could not be delivered right now. Your draft is still available, so you can try again shortly without writing it again.",
	},
};
export const TitleOnly: Story = { args: { title: "Saved" } };
export const Dismiss: Story = {
	play: async ({ canvasElement, userEvent }) => {
		const close = canvasElement.ownerDocument.querySelector<HTMLButtonElement>(
			'[data-slot="toast-close"]',
		);
		if (!close) throw new Error("Toast close control must be rendered");
		await expect(close).toBeVisible();
		await userEvent.click(close);
		await waitFor(() =>
			expect(
				canvasElement.ownerDocument.querySelector('[data-slot="toast"]'),
			).not.toBeInTheDocument(),
		);
	},
};
