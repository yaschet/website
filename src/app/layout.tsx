import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

import { FloatingNav } from "@components/layout/floating-nav";
import RootProvider from "@components/providers/root-provider";

import { fontVariables } from "@/lib/fonts";

export const metadata: Metadata = {
	title: "Yassine Chettouch — Senior Product Engineer",
	description:
		"Building systems that scale and experiences that convert. High-performance execution for ambitious products.",
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
	jobTitle: "Senior Product Engineer",
	url: "https://yaschet.dev",
	sameAs: [
		"https://x.com/yaschet",
		"https://github.com/yaschet",
		"https://linkedin.com/in/yaschet",
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
				<Script
					id="person-schema"
					type="application/ld+json"
					strategy="beforeInteractive"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
				/>
			</head>
			<body
				className="relative min-h-screen text-surface-900 antialiased dark:text-surface-50"
				suppressHydrationWarning={true}
			>
				<RootProvider>
					<FloatingNav />
					{children}
				</RootProvider>
			</body>
		</html>
	);
}
