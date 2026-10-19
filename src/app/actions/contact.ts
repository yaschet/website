"use server";

import { headers } from "next/headers";
import { getContactService } from "@/src/lib/contact/contact-service";
import { processContactSubmission } from "@/src/lib/contact/submit-contact";
import type { ContactSubmissionResult } from "@/src/lib/schemas/contact";

/** Public action input is untrusted, even when the browser used our form. */
export async function submitContactForm(input: unknown): Promise<ContactSubmissionResult> {
	return processContactSubmission(
		input,
		{
			headers: await headers(),
			isVercel: process.env.VERCEL === "1",
		},
		getContactService(),
	);
}
