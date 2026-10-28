import { fn } from "storybook/test";
import type { ContactSubmissionResult } from "../../src/lib/schemas/contact";

/** Storybook-only transport: server code and email credentials are never imported. */
export const submitContactForm = fn<(input: unknown) => Promise<ContactSubmissionResult>>()
	.mockName("submitContactForm")
	.mockResolvedValue({
		success: false,
		code: "unavailable",
		error: "Workshop preview: delivery is disabled.",
	});
