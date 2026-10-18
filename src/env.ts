import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
	client: {
		// ==============================================================================
		// APPLICATION URLS & DOMAIN CONFIGURATION
		// ==============================================================================
		NEXT_PUBLIC_APP_URL: z
			.string()
			.url("Invalid Next.js App URL, please make sure it is a valid URL.")
			.min(1, "The Next.js App URL is required."),

		// ==============================================================================
		// APPLICATION CORE
		// ==============================================================================
		NEXT_PUBLIC_ENVIRONMENT: z
			.enum(["development", "production", "test"])
			.default("development"),
	},
	server: {
		// ==============================================================================
		// EXTERNAL SERVICES
		// ==============================================================================
		RESEND_API_KEY: z.string().min(1, "The Resend API Key is required."),
		UPSTASH_REDIS_REST_URL: z.url().startsWith("https://").optional(),
		UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
		CONTACT_RATE_LIMIT_SALT: z.string().min(32).optional(),
	},
	runtimeEnv: {
		// ==============================================================================
		// APPLICATION URLS & DOMAIN CONFIGURATION
		// ==============================================================================
		NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
		NEXT_PUBLIC_ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT,
		// ==============================================================================
		// EXTERNAL SERVICES
		// ==============================================================================
		RESEND_API_KEY: process.env.RESEND_API_KEY,
		UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL || undefined,
		UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN || undefined,
		CONTACT_RATE_LIMIT_SALT: process.env.CONTACT_RATE_LIMIT_SALT || undefined,
	},
});
