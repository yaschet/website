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
  },
});
