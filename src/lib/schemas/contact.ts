import { z } from "zod";

export const contactSchema = z.object({
	name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
	email: z.string().trim().max(254).email("Please enter a valid email address"),
	subject: z
		.string()
		.trim()
		.min(5, "Subject must be at least 5 characters")
		.max(200)
		.refine(
			(value) => !["\r", "\n", "\0"].some((control) => value.includes(control)),
			"Subject must be a single line",
		),
	message: z.string().trim().min(10, "Message must be at least 10 characters").max(2000),
});

export type ContactFormValues = z.infer<typeof contactSchema>;

/** Untrusted action envelope; the visible form shares only contactSchema. */
export const contactSubmissionSchema = z.strictObject({
	values: contactSchema,
	website: z.string().max(200),
	submissionId: z.uuid(),
});

export type ContactSubmissionResult =
	| { success: true }
	| { success: false; code: "invalid" | "blocked" | "unavailable" | "delivery"; error: string };
