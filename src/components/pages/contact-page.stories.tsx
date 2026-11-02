import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { usePathname } from "@storybook/nextjs-vite/navigation.mock";
import { expect, fireEvent, mocked, waitFor } from "storybook/test";
import { submitContactForm } from "@/src/app/actions/contact";
import ContactPage from "@/src/app/contact/page";
import { toast } from "@/src/components/ui/sonner";
import { fullPageDecorator, fullPageParameters } from "../../../.storybook/full-page-preview";

const meta = {
	id: "pages-contact",
	title: "Pages/Contact",
	component: ContactPage,
	tags: ["autodocs"],
	parameters: {
		...fullPageParameters,
		docs: {
			...fullPageParameters.docs,
			description: {
				component:
					"The complete contact page with isolated delivery. Named states prepare the real form interaction for review; no email is sent. Full Page is ready for manual interaction.",
			},
		},
	},
	decorators: [fullPageDecorator],
	beforeEach: () => {
		usePathname.mockReturnValue("/contact");
		toast.close();
		mocked(submitContactForm).mockReset();
		mocked(submitContactForm).mockResolvedValue({
			success: false,
			code: "unavailable",
			error: "Workshop preview: delivery is disabled.",
		});
	},
} satisfies Meta<typeof ContactPage>;
export default meta;
type Story = StoryObj<typeof meta>;

const fillAndSubmit: NonNullable<Story["play"]> = async ({ canvas, userEvent }) => {
	for (const [name, value] of [
		["Name", "Workshop Reviewer"],
		["Email", "reviewer@example.test"],
		["Subject", "Portfolio review"],
		["Message", "This message only prepares a Storybook review state. It is never delivered."],
	]) {
		await fireEvent.change(canvas.getByRole("textbox", { name }), { target: { value } });
	}
	await userEvent.click(canvas.getByRole("button", { name: "Send message" }));
};

export const FullPage: Story = {};
export const ValidationErrors: Story = {
	play: async ({ canvas, userEvent }) => {
		const email = canvas.getByRole("textbox", { name: "Email" });
		await userEvent.type(email, "invalid");
		await userEvent.tab();
		await expect(email).toHaveAttribute("aria-invalid", "true");
		await expect(submitContactForm).not.toHaveBeenCalled();
	},
};
export const Sending: Story = {
	beforeEach: () => {
		mocked(submitContactForm).mockImplementation(() => new Promise(() => {}));
	},
	play: async (context) => {
		await fillAndSubmit(context);
		await expect(
			context.canvas.getByRole("button", { name: "Sending message" }),
		).toHaveAttribute("aria-busy", "true");
	},
};
export const MessageSent: Story = {
	beforeEach: () => {
		mocked(submitContactForm).mockResolvedValue({ success: true });
	},
	play: async (context) => {
		await fillAndSubmit(context);
		await waitFor(() => expect(submitContactForm).toHaveBeenCalledOnce());
		await expect(context.canvas.getByRole("textbox", { name: "Message" })).toHaveValue("");
	},
};
export const DeliveryUnavailable: Story = {
	play: async (context) => {
		await fillAndSubmit(context);
		await waitFor(() =>
			expect(
				context.canvasElement.ownerDocument.querySelector('[data-slot="toast"]'),
			).toHaveTextContent("Workshop preview: delivery is disabled."),
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
		await fillAndSubmit(context);
		await waitFor(() =>
			expect(
				context.canvasElement.ownerDocument.querySelector('[data-slot="toast"]'),
			).toHaveTextContent("Too many messages. Please try again later."),
		);
	},
};
