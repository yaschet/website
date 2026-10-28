import type { MetadataRoute } from "next";
import { IS_PREVIEW_DEPLOYMENT, SITE_URL } from "@/src/constants/site";

export default function robots(): MetadataRoute.Robots {
	if (IS_PREVIEW_DEPLOYMENT) return { rules: { userAgent: "*", disallow: "/" } };
	const baseUrl = SITE_URL;

	return {
		rules: {
			userAgent: "*",
			allow: "/",
			disallow: ["/private/", "/admin/"],
		},
		sitemap: `${baseUrl}/sitemap.xml`,
	};
}
