import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
	const baseUrl = "https://yaschet.dev";

	return {
		rules: {
			userAgent: "*",
			allow: "/",
			disallow: ["/private/", "/admin/"],
		},
		sitemap: `${baseUrl}/sitemap.xml`,
	};
}
