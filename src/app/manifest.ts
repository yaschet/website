import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: "Yassine Chettouch | Software Engineer",
		short_name: "Yassine",
		description:
			"Portfolio of Yassine Chettouch, a Software Engineer specialized in high-performance web systems.",
		start_url: "/",
		display: "standalone",
		background_color: "#fafafa", // Zinc-50 (Surface Light)
		theme_color: "#09090b", // Zinc-950 (Theme Dark / Primary)
		icons: [
			{
				src: "/apple-icon.png",
				sizes: "180x180",
				type: "image/png",
			},
			{
				src: "/web-app-manifest-192x192.png",
				sizes: "192x192",
				type: "image/png",
				purpose: "maskable",
			},
			{
				src: "/web-app-manifest-512x512.png",
				sizes: "512x512",
				type: "image/png",
				purpose: "maskable",
			},
		],
	};
}
