"use client";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { AppProgressBar as ProgressBar, useRouter } from "next-nprogress-bar";
import { ThemeProvider } from "next-themes";
import React, { Fragment } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { NAVIGATION_SHORTCUTS } from "@/src/constants/navigation";
import { Toaster } from "@components/ui/sonner";
import { RevealProvider } from "./reveal-provider";

export default function RootProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();

  useHotkeys(
    [NAVIGATION_SHORTCUTS.home.win, NAVIGATION_SHORTCUTS.home.mac],
    () => router.push(NAVIGATION_SHORTCUTS.home.link),
    {
      description: NAVIGATION_SHORTCUTS.home.description,
    }
  );

  useHotkeys(
    [NAVIGATION_SHORTCUTS.blog.win, NAVIGATION_SHORTCUTS.blog.mac],
    () => router.push(NAVIGATION_SHORTCUTS.blog.link),
    {
      description: NAVIGATION_SHORTCUTS.blog.description,
    }
  );
  useHotkeys(
    [NAVIGATION_SHORTCUTS.projects.win, NAVIGATION_SHORTCUTS.projects.mac],
    () => router.push(NAVIGATION_SHORTCUTS.projects.link),
    {
      description: NAVIGATION_SHORTCUTS.projects.description,
    }
  );
  useHotkeys(
    [NAVIGATION_SHORTCUTS.contact.win, NAVIGATION_SHORTCUTS.contact.mac],
    () => router.push(NAVIGATION_SHORTCUTS.contact.link),
    {
      description: NAVIGATION_SHORTCUTS.contact.description,
    }
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem={true}>
      <RevealProvider>
        <Fragment>
          {children}

          <SpeedInsights />
          <Analytics />

          <ProgressBar
            color="var(--foreground)" // Using foreground color (black/white) for progress bar
            delay={300}
            disableSameURL={true}
            height="2px"
            options={{
              easing: "easeInOutCubic",
              showSpinner: false,
              speed: 500,
            }}
            shallowRouting={true}
            startPosition={0.3}
            stopDelay={200}
          />
          <Toaster
            closeButton={true}
            expand={false}
            position="top-center"
            richColors={false}
          />
        </Fragment>
      </RevealProvider>
    </ThemeProvider>
  );
}
