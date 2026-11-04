export const SITE_URL = "https://yaschet.com";
export const SITE_HOSTNAME = "yaschet.com";
export const SITE_EMAIL = "hello@yaschet.com";
export const SITE_BOOKING_URL = "https://cal.com/yassinechettouch/15min";
export const SITE_ROLE = "Product Engineer";
export const SITE_DESCRIPTION =
	"Product Engineer designing and building web applications for onboarding, operations, billing and document workflows.";

/** Vercel supplies this at build time, including for custom branch domains. */
export const IS_PREVIEW_DEPLOYMENT = process.env.VERCEL_ENV === "preview";
