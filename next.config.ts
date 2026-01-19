import type { NextConfig } from "next";
import { withContentlayer } from "next-contentlayer2";

const nextConfig: NextConfig = {
	reactCompiler: true,

	images: {
		formats: ["image/avif", "image/webp"],
		qualities: [25, 50, 75, 100],
		minimumCacheTTL: 60,
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
		// @ts-expect-error - Required for instrumentation.ts logic in v16
		instrumentationHook: true,
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
				],
			},
		];
	},
};

export default withContentlayer(nextConfig);
