/* Server transport adapters. Imported only by the contact Server Action. */
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { Resend } from "resend";
import { SITE_EMAIL } from "@/src/constants/site";
import { env } from "@/src/env";
import type { ContactDependencies, ContactLimit } from "@/src/lib/contact/submit-contact";

let service: ContactDependencies | undefined;

/** Lazily configure shared limits. Missing credentials never enable an in-memory fallback. */
export function getContactService(): ContactDependencies | null {
	if (service) return service;
	const url = env.UPSTASH_REDIS_REST_URL;
	const token = env.UPSTASH_REDIS_REST_TOKEN;
	const salt = env.CONTACT_RATE_LIMIT_SALT;
	if (!url || !token || !salt) return null;
	const redis = new Redis({ url, token, retry: false, signal: () => AbortSignal.timeout(2000) });
	const limiter = (kind: ContactLimit, algorithm: ReturnType<typeof Ratelimit.slidingWindow>) =>
		new Ratelimit({
			redis,
			limiter: algorithm,
			prefix: `website:contact:v1:${kind}`,
			timeout: 1500,
			analytics: false,
			ephemeralCache: false,
		});
	const limits: Record<ContactLimit, Ratelimit> = {
		ip: limiter("ip", Ratelimit.slidingWindow(5, "10 m")),
		email: limiter("email", Ratelimit.slidingWindow(3, "1 h")),
		hour: limiter("hour", Ratelimit.slidingWindow(30, "1 h")),
		day: limiter("day", Ratelimit.slidingWindow(100, "1 d")),
	};
	const resend = new Resend(env.RESEND_API_KEY);
	service = {
		salt,
		limit: async (bucket, identifier) => {
			const result = await limits[bucket].limit(identifier);
			// Drain SDK work without letting late rejections escape the action.
			void result.pending.catch(() => undefined);
			return { success: result.success, reason: result.reason };
		},
		send: async ({ name, email, subject, message }, idempotencyKey) => {
			const { data, error } = await resend.emails.send(
				{
					from: "Yaschet <contact@mail.yaschet.com>",
					to: [SITE_EMAIL],
					replyTo: email,
					subject: `[Contact Form] ${subject}`,
					text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
				},
				{ idempotencyKey, signal: AbortSignal.timeout(10_000) },
			);
			return !error && !!data?.id;
		},
	};
	return service;
}
