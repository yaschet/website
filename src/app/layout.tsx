import type { Metadata } from "next";
import { Geist_Mono as MonoFont, Geist as SansFont } from "next/font/google";
import "./globals.css";

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
  title: "Yassine Chettouch — Product Engineer",
  description: "Senior Product Engineer blending design and code.",
  appleWebApp: {
    title: "Yaschet.dev",
  },
};

import RootProvider from "@components/providers/root-provider";
import { FloatingNav } from "@components/layout/floating-nav";

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
