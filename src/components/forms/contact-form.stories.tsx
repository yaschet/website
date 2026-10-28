import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { ReactNode } from "react";
import { expect, fireEvent, mocked, waitFor } from "storybook/test";
import { submitContactForm } from "@/src/app/actions/contact";
import { Toaster, toast } from "@/src/components/ui/sonner";
import { SinglePreviewDocsPage } from "../../../.storybook/workshop-docs";
import { ContactForm } from "./contact-form";
import { ContactMessage } from "./contact-message";

const meta = {
	id: "forms-contact",
	title: "Components/Forms/Contact Form",
	component: ContactForm,
	tags: ["autodocs"],
	parameters: {
		docs: {
			page: SinglePreviewDocsPage,
			description: {
				component:
					"The production contact form with a workshop-only action mock. No email is sent. Failure stories retain the draft; retry preserves its submission identifier.",
			},
		},
	},
	beforeEach: () => {
		toast.close();
		mocked(submitContactForm).mockReset();
		mocked(submitContactForm).mockResolvedValue({
			success: false,
			code: "unavailable",
			error: "Contact is temporarily unavailable. Please try again later.",
		});
	},
	decorators: [
		(Story) => (
			<div className="portfolio-box-pad mx-auto w-full max-w-3xl">
				<ContactPreview>
					<Story />
				</ContactPreview>
			</div>
		),
	],
} satisfies Meta<typeof ContactForm>;
function ContactPreview({ children }: { children: ReactNode }) {
	return (
		<>
			{children}
			<Toaster />
		</>
	);
}
export default meta;
type Story = StoryObj<typeof meta>;

const draft = {
	name: "Workshop Reviewer",
	email: "reviewer@example.test",
	subject: "Portfolio review",
	message: "This is a workshop-only message for a component test.",
};
const fill: NonNullable<Story["play"]> = async ({ canvas, userEvent }) => {
	for (const [label, value] of [
		["Name", draft.name],
		["Email", draft.email],
		["Subject", draft.subject],
		["Message", draft.message],
	]) {
		await userEvent.type(canvas.getByRole("textbox", { name: label }), value);
	}
};
/** Foundation notifications are portalled outside the story canvas. */
async function expectNotification(canvasElement: HTMLElement, message: string) {
	await waitFor(() => {
		const notification = canvasElement.ownerDocument.querySelector('[data-slot="toast"]');
		expect(notification).toBeVisible();
		expect(notification).toHaveTextContent(message);
	});
}
export const Empty: Story = {};
export const PageSection: Story = { render: () => <ContactMessage /> };
export const Validation: Story = {
	play: async (context) => {
		const email = context.canvas.getByRole("textbox", { name: "Email" });
		await context.userEvent.type(email, "invalid");
		await context.userEvent.tab();
		await expect(email).toHaveAttribute("aria-invalid", "true");
		await expect(context.canvas.getByText("Please enter a valid email address")).toBeVisible();
		await expect(submitContactForm).not.toHaveBeenCalled();
	},
};
export const Submitting: Story = {
	beforeEach: () => {
		mocked(submitContactForm).mockImplementation(() => new Promise(() => {}));
	},
	play: async (context) => {
		await fill(context);
		const pending = context.canvas.getByRole("button", { name: "Send message" });
		const idleHeight = pending.getBoundingClientRect().height;
		await context.userEvent.click(pending);
		await expect(pending).toHaveAttribute("aria-disabled", "true");
		await expect(pending).toHaveFocus();
		await expect(pending).toHaveAttribute("aria-busy", "true");
		await expect(pending).toHaveAccessibleName("Sending message");
		await expect(pending.getBoundingClientRect().height).toBe(idleHeight);
		await context.userEvent.keyboard("{Enter} ");
		const form = pending.closest("form");
		if (!form) throw new Error("The contact form must contain its submit control.");
		await fireEvent.submit(form);
		await expect(submitContactForm).toHaveBeenCalledTimes(1);
	},
};
export const Success: Story = {
	beforeEach: () => {
		mocked(submitContactForm).mockResolvedValue({ success: true });
	},
	play: async (context) => {
		await fill(context);
		await context.userEvent.click(context.canvas.getByRole("button", { name: "Send message" }));
		await waitFor(() => expect(submitContactForm).toHaveBeenCalledTimes(1));
		await waitFor(() =>
			expect(context.canvas.getByRole("textbox", { name: "Message" })).toHaveValue(""),
		);
	},
};
export const RateLimited: Story = {
	beforeEach: () => {
		mocked(submitContactForm).mockResolvedValue({
			success: false,
			code: "blocked",
			error: "Too many messages. Please try again later.",
		});
	},
	play: async (context) => {
		await fill(context);
		await context.userEvent.click(context.canvas.getByRole("button", { name: "Send message" }));
		await waitFor(() => expect(submitContactForm).toHaveBeenCalledTimes(1));
		await expectNotification(
			context.canvasElement,
			"Too many messages. Please try again later.",
		);
		await expect(context.canvas.getByRole("textbox", { name: "Message" })).toHaveValue(
			draft.message,
		);
	},
};
export const RetryAfterFailure: Story = {
	play: async (context) => {
		await fill(context);
		const button = context.canvas.getByRole("button", { name: "Send message" });
		await context.userEvent.click(button);
		await waitFor(() => expect(submitContactForm).toHaveBeenCalledTimes(1));
		await expectNotification(
			context.canvasElement,
			"Contact is temporarily unavailable. Please try again later.",
		);
		await expect(context.canvas.getByRole("textbox", { name: "Message" })).toHaveValue(
			draft.message,
		);
		mocked(submitContactForm).mockResolvedValue({ success: true });
		await context.userEvent.click(button);
		await waitFor(() => expect(submitContactForm).toHaveBeenCalledTimes(2));
		const calls = mocked(submitContactForm).mock.calls;
		await expect(calls[0][0]).toEqual(calls[1][0]);
		await waitFor(() =>
			expect(context.canvas.getByRole("textbox", { name: "Message" })).toHaveValue(""),
		);
	},
};

export const TransportFailure: Story = {
	beforeEach: () => {
		mocked(submitContactForm).mockRejectedValue(new Error("Workshop offline"));
	},
	play: async (context) => {
		await fill(context);
		await context.userEvent.click(context.canvas.getByRole("button", { name: "Send message" }));
		await expectNotification(
			context.canvasElement,
			"An unexpected error occurred. Please try again.",
		);
		await expect(context.canvas.getByRole("textbox", { name: "Message" })).toHaveValue(
			draft.message,
		);
		await expect(submitContactForm).toHaveBeenCalledTimes(1);
	},
};
