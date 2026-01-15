import type { Metadata } from "next";
import { Raleway as MonoFont, Inter as SansFont } from "next/font/google";
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
  title: "Yaschet — Product Engineer",
  description: "Senior Product Engineer blending design and code.",
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
      <body
        className="relative min-h-screen antialiased"
        suppressHydrationWarning={true}
      >
        {children}
      </body>
    </html>
  );
}
