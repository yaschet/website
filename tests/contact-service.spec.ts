import { expect, test } from "@playwright/test";
import type { ContactDependencies } from "@/src/lib/contact/submit-contact";

test("installed adapters bound quotas and pass safe mail/idempotency options without real I/O", async () => {
	const originalFetch = globalThis.fetch;
	const environment = {
		NEXT_PUBLIC_APP_URL: "http://localhost:3000",
		NEXT_PUBLIC_ENVIRONMENT: "test",
		RESEND_API_KEY: "re_inert_adapter_test_only",
		RESEND_BASE_URL: "https://api.resend.com",
		UPSTASH_REDIS_REST_URL: "https://redis.example.invalid",
		UPSTASH_REDIS_REST_TOKEN: "inert-adapter-test-token",
		CONTACT_RATE_LIMIT_SALT: "inert-adapter-test-salt-never-used-in-production",
	};
	const previous = Object.fromEntries(
		Object.keys(environment).map((key) => [key, process.env[key]]),
	);
	Object.assign(process.env, environment);
	const redisCommands: unknown[] = [];
	let emailRequests = 0;
	let failRedis = false;
	let redisRequests = 0;
	let remaining = 1;
	globalThis.fetch = async (url, options) => {
		// No fallback to real fetch: every transport request is intercepted.
		if (String(url).startsWith("https://redis.example.invalid/")) {
			redisRequests++;
			if (failRedis) throw new Error("inert network failure");
			const commands: unknown = JSON.parse(String(options?.body));
			redisCommands.push(commands);
			expect(options?.signal).toBeDefined();
			const result = { result: [remaining, 5] };
			return Response.json(
				Array.isArray(commands) && Array.isArray(commands[0]) ? [result] : result,
			);
		}
		expect(String(url)).toBe("https://api.resend.com/emails");
		emailRequests++;
		expect(new Headers(options?.headers).get("idempotency-key")).toBe("contact:inert-test-key");
		expect(options?.signal).toBeDefined();
		const payload: unknown = JSON.parse(String(options?.body));
		expect(payload).toEqual({
			from: "Yaschet <contact@mail.yaschet.com>",
			to: ["hello@yaschet.com"],
			reply_to: "sender@example.com",
			subject: "[Contact Form] Test subject",
			text: "Name: Test Sender\nEmail: sender@example.com\n\nMessage:\nNever delivered.",
		});
		return Response.json({ id: "inert-test-email" });
	};
	try {
		const { getContactService } = await import("@/src/lib/contact/contact-service");
		const service: ContactDependencies | null = getContactService();
		expect(service).not.toBeNull();
		if (!service) throw new Error("Fixture service was not configured");
		for (const kind of ["ip", "email", "hour", "day"] as const) {
			expect(await service.limit(kind, "hashed-identifier")).toMatchObject({ success: true });
		}
		const serialized = JSON.stringify(redisCommands);
		for (const [kind, capacity, duration] of [
			["ip", 5, 600_000],
			["email", 3, 3_600_000],
			["hour", 30, 3_600_000],
			["day", 100, 86_400_000],
		] as const) {
			expect(serialized).toContain(`website:contact:v1:${kind}`);
			expect(serialized).toContain(String(capacity));
			expect(serialized).toContain(String(duration));
		}
		remaining = -1;
		expect(await service.limit("ip", "hashed-identifier")).toMatchObject({ success: false });
		failRedis = true;
		const beforeFailure = redisRequests;
		await expect(service.limit("ip", "hashed-identifier")).rejects.toThrow();
		// The limiter tries EVAL after EVALSHA failure; Redis transport retries are disabled.
		expect(redisRequests - beforeFailure).toBe(2);
		expect(
			await service.send(
				{
					name: "Test Sender",
					email: "sender@example.com",
					subject: "Test subject",
					message: "Never delivered.",
				},
				"contact:inert-test-key",
			),
		).toBe(true);
		expect(emailRequests).toBe(1);
	} finally {
		globalThis.fetch = originalFetch;
		for (const [key, value] of Object.entries(previous)) {
			if (value === undefined) delete process.env[key];
			else process.env[key] = value;
		}
	}
});
