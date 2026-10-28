import type { Metadata } from "next";
import { IS_PREVIEW_DEPLOYMENT, SITE_URL } from "@/src/constants/site";
import "./globals.css";

import RootProvider from "@components/providers/root-provider";
import { fontVariables } from "@/lib/fonts";
import { PortfolioScene } from "@/src/components/layout/portfolio-scene";
import { PortfolioTypeStyles } from "@/src/components/layout/portfolio-type-styles";
import { SiteHeader } from "@/src/components/layout/site-header";

export const metadata: Metadata = {
	metadataBase: new URL(SITE_URL),
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
		url: SITE_URL,
		siteName: "Yassine Chettouch",
		locale: "en_US",
		type: "website",
	},
	robots: {
		index: !IS_PREVIEW_DEPLOYMENT,
		follow: !IS_PREVIEW_DEPLOYMENT,
		googleBot: {
			index: !IS_PREVIEW_DEPLOYMENT,
			follow: !IS_PREVIEW_DEPLOYMENT,
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
	url: SITE_URL,
	sameAs: [
		"https://x.com/yaschett",
		"https://github.com/yaschet",
		"https://linkedin.com/in/yassinechettouch",
	],
};

const THEME_BOOTSTRAP_SCRIPT = `(() => {
  try {
    const root = document.documentElement;
    const cookieTheme = document.cookie
      .split("; ")
      .find((entry) => entry.startsWith("theme="))
      ?.split("=")[1];
    const storedTheme = cookieTheme ?? localStorage.getItem("theme");
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
			className={`${fontVariables} yaschet`}
			data-scroll-behavior="smooth"
		>
			<head>
				<script
					id="theme-bootstrap"
					// biome-ignore lint/security/noDangerouslySetInnerHtml: theme bootstrap must run before first paint
					dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }}
				/>
				<link rel="preconnect" href="https://image.mux.com" crossOrigin="" />
				<link rel="preconnect" href="https://stream.mux.com" crossOrigin="" />
				<link rel="dns-prefetch" href="https://image.mux.com" />
				<link rel="dns-prefetch" href="https://stream.mux.com" />
				<PortfolioTypeStyles />
				<script
					id="person-schema"
					type="application/ld+json"
					// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD schema is trusted static data
					dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
				/>
			</head>
			<body
				className="relative min-h-screen text-foreground antialiased"
				suppressHydrationWarning={true}
			>
				<RootProvider>
					<SiteHeader />
					<PortfolioScene>{children}</PortfolioScene>
				</RootProvider>
			</body>
		</html>
	);
}
