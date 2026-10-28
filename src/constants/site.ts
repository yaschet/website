export const SITE_URL = "https://yaschet.com";
export const SITE_HOSTNAME = "yaschet.com";

/** Vercel supplies this at build time, including for custom branch domains. */
export const IS_PREVIEW_DEPLOYMENT = process.env.VERCEL_ENV === "preview";
