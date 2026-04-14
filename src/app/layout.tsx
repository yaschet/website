import type { Metadata } from "next";
import Script from "next/script";
import { Suspense } from "react";
import "./globals.css";

import { FloatingNav } from "@components/layout/floating-nav";
import RootProvider from "@components/providers/root-provider";

import { fontVariables } from "@/lib/fonts";
import { PortfolioTypeStyles } from "@/src/components/layout/portfolio-type-styles";

export const metadata: Metadata = {
	metadataBase: new URL("https://yaschet.dev"),
	title: {
		default: "Yassine Chettouch — Software Engineer",
		template: "%s | Yassine Chettouch",
	},
	description:
		"Building systems that scale and experiences that convert. High-performance execution for ambitious products.",
	keywords: [
		"Software Engineer",
		"Senior Software Engineer",
		"Design Systems",
		"Next.js",
		"TypeScript",
		"React",
		"AI Engineering",
		"Software Architecture",
		"Full Stack",
		"Software Engineer",
		"Frontend Engineer",
		"Backend Engineer",
		"Full Stack Engineer",
		"Yassine Chettouch",
		"Chettouch",
		"Yassine",
	],
	alternates: {
		canonical: "/",
	},
	openGraph: {
		title: "Yassine Chettouch — Software Engineer",
		description:
			"Building systems that scale and experiences that convert. High-performance execution for ambitious products.",
		url: "https://yaschet.dev",
		siteName: "Yassine Chettouch",
		locale: "en_US",
		type: "website",
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
	icons: {
		icon: "/images/avatar.jpeg",
	},
	appleWebApp: {
		title: "Yaschet",
	},
};

const personSchema = {
	"@context": "https://schema.org",
	"@type": "Person",
	name: "Yassine Chettouch",
	alternateName: "yaschet",
	jobTitle: "Software Engineer",
	url: "https://yaschet.dev",
	sameAs: [
		"https://x.com/yaschett",
		"https://github.com/yaschet",
		"https://linkedin.com/in/yassinechettouch",
	],
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html suppressHydrationWarning lang="en" className={fontVariables}>
			<head>
				<PortfolioTypeStyles />
				<Script
					id="person-schema"
					type="application/ld+json"
					strategy="beforeInteractive"
					// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD schema is trusted static data
					dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
				/>
			</head>
			<body
				className="relative min-h-screen text-surface-900 antialiased dark:text-surface-50"
				suppressHydrationWarning={true}
			>
				<RootProvider>
					<Suspense fallback={null}>
						<FloatingNav />
					</Suspense>
					{children}
				</RootProvider>
			</body>
		</html>
	);
}
