import type { NextConfig } from "next";
import { withContentlayer } from "next-contentlayer2";

const nextConfig: NextConfig = {
	// Note: middleware.ts is required for advanced routing/headers even if empty
	reactCompiler: true,

	images: {
		formats: ["image/avif", "image/webp"],
		qualities: [25, 50, 75, 100],
		minimumCacheTTL: 60,
		// Explicitly match our grid breakpoints (640, 768, 1024, 1280, 1536)
		deviceSizes: [640, 768, 1024, 1280, 1536, 1920],
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
		remotePatterns: [
			{
				protocol: "https",
				hostname: "images.unsplash.com",
			},
		],
	},

	compiler: {
		removeConsole:
			process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
	},

	logging: {
		fetches: {
			fullUrl: true,
		},
	},

	cacheComponents: true,

	experimental: {
		optimizePackageImports: [
			"@phosphor-icons/react",
			"lucide-react",
			"@radix-ui/react-icons",
			"@radix-ui/react-slot",
			"@radix-ui/react-accordion",
			"@radix-ui/react-avatar",
			"@radix-ui/react-dialog",
			"@radix-ui/react-dropdown-menu",
			"@radix-ui/react-tooltip",
			"framer-motion",
			"date-fns",
			"lodash",
		],
	},

	async headers() {
		return [
			{
				source: "/(.*)",
				headers: [
					{
						key: "X-Content-Type-Options",
						value: "nosniff",
					},
					{
						key: "X-Frame-Options",
						value: "DENY",
					},
					{
						key: "X-XSS-Protection",
						value: "1; mode=block",
					},
					{
						key: "Referrer-Policy",
						value: "strict-origin-when-cross-origin",
					},
					{
						key: "Permissions-Policy",
						value: "camera=(), microphone=(), geolocations=()",
					},
					{
						key: "Strict-Transport-Security",
						value: "max-age=63072000; includeSubDomains; preload",
					},
					{
						key: "Cross-Origin-Opener-Policy",
						value: "same-origin",
					},
					{
						key: "Content-Security-Policy",
						value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' data: https:; connect-src 'self' https:;",
					},
				],
			},
		];
	},
};

import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
	enabled: process.env.ANALYZE === "true",
});

export default withContentlayer(withBundleAnalyzer(nextConfig));
