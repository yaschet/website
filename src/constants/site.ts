export const SITE_URL = "https://yaschet.com";
export const SITE_HOSTNAME = "yaschet.com";
export const SITE_EMAIL = "hello@yaschet.com";
export const SITE_ROLE = "Product Engineer";
export const SITE_DESCRIPTION =
	"Full-stack product engineer specializing in applied AI. I build and improve SaaS and e-commerce products.";

/** Vercel supplies this at build time, including for custom branch domains. */
export const IS_PREVIEW_DEPLOYMENT = process.env.VERCEL_ENV === "preview";
