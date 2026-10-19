/* Server-side policy, with injected transports so tests never send real mail. */
import { createHmac } from "node:crypto";
import { isIP } from "node:net";
import {
	type ContactFormValues,
	type ContactSubmissionResult,
	contactSubmissionSchema,
} from "@/src/lib/schemas/contact";

export type ContactLimit = "ip" | "email" | "hour" | "day";

export interface ContactDependencies {
	salt: string;
	limit: (
		bucket: ContactLimit,
		identifier: string,
	) => Promise<{
		success: boolean;
		reason?: string;
	}>;
	send: (values: ContactFormValues, idempotencyKey: string) => Promise<boolean>;
}

export interface ContactRequestContext {
	headers: Pick<Headers, "get">;
	isVercel: boolean;
}

const unavailable: ContactSubmissionResult = {
	success: false,
	code: "unavailable",
	error: "Contact is temporarily unavailable. Please try again later.",
};

/** Require a browser origin matching the host; retain Next's own origin checks too. */
function hasSameOrigin({ headers, isVercel }: ContactRequestContext): boolean {
	try {
		const origin = new URL(headers.get("origin") ?? "");
		const host = (isVercel ? headers.get("x-forwarded-host") : null) ?? headers.get("host");
		return (
			(origin.protocol === "https:" || origin.protocol === "http:") &&
			origin.origin === headers.get("origin") &&
			origin.host === host?.toLowerCase()
		);
	} catch {
		return false;
	}
}

/** Only Vercel's overwritten header is trusted; other hosts share a bounded bucket. */
function clientAddress({ headers, isVercel }: ContactRequestContext): string {
	const address = isVercel ? headers.get("x-vercel-forwarded-for")?.trim() : undefined;
	if (!address || !isIP(address)) return "unidentified";
	// Canonicalize IPv6 spellings so equivalent addresses share their quota.
	return address.includes(":") ? new URL(`http://[${address}]/`).hostname : address;
}

/**
 * Validate before spending provider quota. Missing configuration, limiter errors,
 * and SDK fail-open timeouts all stop delivery. No raw address enters Redis.
 */
export async function processContactSubmission(
	input: unknown,
	context: ContactRequestContext,
	dependencies: ContactDependencies | null,
): Promise<ContactSubmissionResult> {
	const parsed = contactSubmissionSchema.safeParse(input);
	if (!parsed.success || !hasSameOrigin(context)) {
		return { success: false, code: "invalid", error: "Invalid form submission." };
	}
	if (parsed.data.website !== "") return { success: true };
	if (!dependencies || dependencies.salt.length < 32) return unavailable;
	const { values, submissionId } = parsed.data;
	const digest = (value: string) =>
		createHmac("sha256", dependencies.salt).update(value).digest("hex");
	const identifiers: Record<ContactLimit, string> = {
		ip: digest(`ip:${clientAddress(context)}`),
		email: digest(`email:${values.email.toLowerCase()}`),
		hour: "all",
		day: "all",
	};

	try {
		for (const bucket of ["ip", "email", "hour", "day"] as const) {
			const result = await dependencies.limit(bucket, identifiers[bucket]);
			// Upstash returns success=true on its timeout path. Explicitly reject it.
			if (result.reason === "timeout") return unavailable;
			if (!result.success) {
				return {
					success: false,
					code: "blocked",
					error: "Too many messages. Please try again later.",
				};
			}
		}
		// Resend deduplicates an exact retry for 24h. Content changes get a new key.
		const idempotencyKey = `contact:${submissionId}:${digest(JSON.stringify(values))}`;
		if (!(await dependencies.send(values, idempotencyKey))) {
			return {
				success: false,
				code: "delivery",
				error: "Failed to send email. Please try again later.",
			};
		}
		return { success: true };
	} catch {
		// Do not expose provider responses, request data, or credentials.
		return unavailable;
	}
}
