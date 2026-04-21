import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

import RootProvider from "@components/providers/root-provider";
import { fontVariables } from "@/lib/fonts";
import { PortfolioTypeStyles } from "@/src/components/layout/portfolio-type-styles";
import { DeferredGlobalChrome } from "@/src/components/providers/deferred-global-chrome";

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
		icon: "/images/avatar.png",
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

const THEME_BOOTSTRAP_SCRIPT = `(() => {
  try {
    const root = document.documentElement;
    const storedTheme = localStorage.getItem("theme");
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const resolvedTheme =
      storedTheme === "light" || storedTheme === "dark"
        ? storedTheme
        : systemDark
          ? "dark"
          : "light";

    root.classList.toggle("dark", resolvedTheme === "dark");
    root.dataset.theme = resolvedTheme;
    root.style.colorScheme = resolvedTheme;
  } catch {
    // Fall back to the server-rendered light shell when storage is unavailable.
  }
})();`;

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			suppressHydrationWarning
			lang="en"
			className={fontVariables}
			data-scroll-behavior="smooth"
		>
			<head>
				<link rel="preconnect" href="https://image.mux.com" crossOrigin="" />
				<link rel="preconnect" href="https://stream.mux.com" crossOrigin="" />
				<link rel="dns-prefetch" href="https://image.mux.com" />
				<link rel="dns-prefetch" href="https://stream.mux.com" />
				<PortfolioTypeStyles />
				<Script id="theme-bootstrap" strategy="beforeInteractive">
					{THEME_BOOTSTRAP_SCRIPT}
				</Script>
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
					<DeferredGlobalChrome />
					{children}
				</RootProvider>
			</body>
		</html>
	);
}
