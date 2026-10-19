import { expect, test } from "@playwright/test";
import {
	type ContactDependencies,
	type ContactLimit,
	type ContactRequestContext,
	processContactSubmission,
} from "@/src/lib/contact/submit-contact";
import { contactSubmissionSchema } from "@/src/lib/schemas/contact";

const submission = {
	values: {
		name: "Test Sender",
		email: "sender@example.com",
		subject: "Project inquiry",
		message: "A test message that is never delivered.",
	},
	website: "",
	submissionId: "86abcbbc-505c-45eb-87dc-baf5b73d15e3",
};

function context(headers: Record<string, string> = {}, isVercel = true): ContactRequestContext {
	return {
		headers: new Headers({
			origin: "https://portfolio.example",
			host: "portfolio.example",
			"x-vercel-forwarded-for": "192.0.2.1",
			...headers,
		}),
		isVercel,
	};
}

function fixture() {
	const sent: { values: unknown; key: string }[] = [];
	const consumed: { bucket: ContactLimit; identifier: string }[] = [];
	const dependencies: ContactDependencies = {
		salt: "contact-policy-test-salt-never-used-in-production",
		limit: async (bucket, identifier) => {
			consumed.push({ bucket, identifier });
			return { success: true };
		},
		send: async (values, key) => {
			sent.push({ values, key });
			return true;
		},
	};
	return { sent, consumed, dependencies };
}

test("rejects malformed, oversized, whitespace-only, and header-injection input before I/O", async () => {
	const { dependencies, consumed, sent } = fixture();
	for (const input of [
		null,
		{},
		{ ...submission, submissionId: "invalid" },
		{
			...submission,
			values: { ...submission.values, email: `${"a".repeat(255)}@example.com` },
		},
		{ ...submission, values: { ...submission.values, message: "a".repeat(2001) } },
		{ ...submission, values: { ...submission.values, message: " ".repeat(20) } },
		{
			...submission,
			values: { ...submission.values, subject: "Hello\r\nBcc: victim@example.com" },
		},
		{ ...submission, values: { ...submission.values, subject: "Hello\0world" } },
	]) {
		expect(await processContactSubmission(input, context(), dependencies)).toMatchObject({
			success: false,
			code: "invalid",
		});
	}
	expect(consumed).toHaveLength(0);
	expect(sent).toHaveLength(0);
});

test("rejects absent, malformed, and cross-origin requests before I/O", async () => {
	const { dependencies, consumed, sent } = fixture();
	for (const origin of [
		"",
		"null",
		"https://attacker.example",
		"https://portfolio.example/path",
	]) {
		expect(
			await processContactSubmission(submission, context({ origin }), dependencies),
		).toMatchObject({ success: false, code: "invalid" });
	}
	expect(consumed).toHaveLength(0);
	expect(sent).toHaveLength(0);
});

test("silently discards the honeypot without consuming quotas or sending mail", async () => {
	const { dependencies, consumed, sent } = fixture();
	expect(
		await processContactSubmission(
			{ ...submission, website: "https://spam.example" },
			context(),
			dependencies,
		),
	).toEqual({ success: true });
	expect(consumed).toHaveLength(0);
	expect(sent).toHaveLength(0);
});

test("missing configuration and SDK fail-open timeouts stop delivery", async () => {
	const { dependencies, sent } = fixture();
	expect(await processContactSubmission(submission, context(), null)).toMatchObject({
		success: false,
		code: "unavailable",
	});
	expect(
		await processContactSubmission(submission, context(), { ...dependencies, salt: "short" }),
	).toMatchObject({ success: false, code: "unavailable" });
	dependencies.limit = async () => ({ success: true, reason: "timeout" });
	expect(await processContactSubmission(submission, context(), dependencies)).toMatchObject({
		success: false,
		code: "unavailable",
	});
	expect(sent).toHaveLength(0);
});

for (const blocked of ["ip", "email", "hour", "day"] as const) {
	test(`a rejected ${blocked} quota stops delivery`, async () => {
		const { dependencies, sent } = fixture();
		dependencies.limit = async (bucket) => ({ success: bucket !== blocked });
		expect(await processContactSubmission(submission, context(), dependencies)).toMatchObject({
			success: false,
			code: "blocked",
		});
		expect(sent).toHaveLength(0);
	});
}

test("does not trust spoofed forwarding headers outside Vercel", async () => {
	const { dependencies, consumed } = fixture();
	await processContactSubmission(
		submission,
		context({ "x-forwarded-for": "192.0.2.5", "x-vercel-forwarded-for": "192.0.2.5" }, false),
		dependencies,
	);
	await processContactSubmission(
		submission,
		context({ "x-forwarded-for": "192.0.2.6", "x-vercel-forwarded-for": "192.0.2.6" }, false),
		dependencies,
	);
	expect(consumed[0].identifier).toEqual(consumed[4].identifier);
	await processContactSubmission(
		submission,
		context({ "x-vercel-forwarded-for": "192.0.2.5" }),
		dependencies,
	);
	await processContactSubmission(
		submission,
		context({ "x-vercel-forwarded-for": "192.0.2.6" }),
		dependencies,
	);
	expect(consumed[8].identifier).not.toEqual(consumed[12].identifier);
	for (const { bucket, identifier } of consumed) {
		if (bucket === "ip" || bucket === "email") expect(identifier).toMatch(/^[a-f0-9]{64}$/);
	}
});

test("canonicalizes IPv6 and email case before hashing identifiers", async () => {
	const { dependencies, consumed } = fixture();
	await processContactSubmission(
		submission,
		context({ "x-vercel-forwarded-for": "2001:db8::1" }),
		dependencies,
	);
	await processContactSubmission(
		{ ...submission, values: { ...submission.values, email: "SENDER@EXAMPLE.COM" } },
		context({ "x-vercel-forwarded-for": "2001:0db8:0:0:0:0:0:1" }),
		dependencies,
	);
	expect(consumed[0].identifier).toEqual(consumed[4].identifier);
	expect(consumed[1].identifier).toEqual(consumed[5].identifier);
});

test("normalizes content and keeps exact-retry keys stable while changed content gets a new key", async () => {
	const { dependencies, sent } = fixture();
	const padded = { ...submission, values: { ...submission.values, name: "  Test Sender  " } };
	expect(await processContactSubmission(padded, context(), dependencies)).toEqual({
		success: true,
	});
	await processContactSubmission(submission, context(), dependencies);
	await processContactSubmission(
		{
			...submission,
			values: { ...submission.values, message: "A changed message after a failed attempt." },
		},
		context(),
		dependencies,
	);
	expect(sent[0].values).toEqual(submission.values);
	expect(sent[0].key).toEqual(sent[1].key);
	expect(sent[2].key).not.toEqual(sent[1].key);
	expect(sent[0].key).not.toContain(submission.values.email);
});

test("limiter and provider failures return safe responses without a write retry", async () => {
	const { dependencies, sent } = fixture();
	dependencies.limit = async () => {
		throw new Error("secret provider detail");
	};
	const failedLimit = await processContactSubmission(submission, context(), dependencies);
	expect(failedLimit).toMatchObject({ success: false, code: "unavailable" });
	expect(JSON.stringify(failedLimit)).not.toContain("secret");
	expect(sent).toHaveLength(0);
	let attempts = 0;
	dependencies.limit = async () => ({ success: true });
	dependencies.send = async () => {
		attempts++;
		throw new Error("secret email detail");
	};
	const failedSend = await processContactSubmission(submission, context(), dependencies);
	expect(failedSend).toMatchObject({ success: false, code: "unavailable" });
	expect(JSON.stringify(failedSend)).not.toContain("secret");
	expect(attempts).toBe(1);
	dependencies.send = async () => false;
	expect(await processContactSubmission(submission, context(), dependencies)).toMatchObject({
		success: false,
		code: "delivery",
	});
});

test("schema bounds every field independently of client maxLength", () => {
	for (const [field, length] of [
		["name", 101],
		["email", 255],
		["subject", 201],
		["message", 2001],
	] as const) {
		expect(
			contactSubmissionSchema.safeParse({
				...submission,
				values: { ...submission.values, [field]: "a".repeat(length) },
			}).success,
		).toBe(false);
	}
});
