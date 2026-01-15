import type { Metadata } from "next";
import { Geist_Mono as MonoFont, Geist as SansFont } from "next/font/google";
import Script from "next/script";
import "./globals.css";

import { FloatingNav } from "@components/layout/floating-nav";
import RootProvider from "@components/providers/root-provider";

const fontSans = SansFont({
  adjustFontFallback: false,
  display: "swap",
  subsets: ["latin"],
  variable: "--font-app-sans",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const fontMono = MonoFont({
  adjustFontFallback: true,
  display: "swap",
  subsets: ["latin"],
  variable: "--font-app-mono",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

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
    <html
      suppressHydrationWarning
      lang="en"
      className={`${fontSans.variable} ${fontMono.variable}`}
    >
      <head>
        <Script
          id="person-schema"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
      </head>
      <body
        className="relative min-h-screen antialiased bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50"
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
