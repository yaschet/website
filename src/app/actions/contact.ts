"use server";

import { Resend } from "resend";
import { contactSchema, type ContactFormValues } from "@/src/lib/schemas/contact";
import { env } from "@/src/env";

const resend = new Resend(env.RESEND_API_KEY);

export async function submitContactForm(values: ContactFormValues) {
	// 1. Validate on server side
	const validated = contactSchema.safeParse(values);

	if (!validated.success) {
		return {
			success: false,
			error: "Invalid form data.",
		};
	}

	const { name, email, subject, message } = validated.data;

	try {
		// 2. Send email via Resend
		const { data, error } = await resend.emails.send({
			from: "Yaschet <contact@yaschet.dev>",
			to: ["hello@yaschet.dev"], // The user's email
			replyTo: email,
			subject: `[Contact Form] ${subject}`,
			text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
		});

		if (error) {
			return {
				success: false,
				error: "Failed to send email. Please try again later.",
			};
		}

		return {
			success: true,
			data: data,
		};
	} catch (err) {
		return {
			success: false,
			error: "An unexpected error occurred.",
		};
	}
}
