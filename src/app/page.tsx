"use client";

import { Avatar, AvatarFallback } from "@components/ui/avatar";
import { ArrowRight, GithubLogo, LinkedinLogo } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import avatarImage from "@/public/images/avatar.jpeg";
import { Button } from "@/src/components/ui/button";
import { LocationBadge, TimeBadge } from "@/src/components/ui/context-badges";
import { HeroGradient } from "@/src/components/ui/hero-gradient";
import { Reveal, ScrollReveal } from "@/src/components/ui/reveal";
import {
  SwissGridProvider,
  SwissGridSection,
} from "@/src/components/ui/swiss-grid-canvas";

export default function Home() {
  // Fix scroll position on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <SwissGridProvider>
      <div className="min-h-screen text-surface-900 selection:bg-surface-900 selection:text-surface-50 dark:text-surface-50 dark:selection:bg-surface-100 dark:selection:text-surface-900">
        {/* Hero Gradient */}
        <HeroGradient className="fixed inset-0 z-0 size-full" />

        <main
          className="relative z-10 flex min-h-screen flex-col"
          style={{ overflowAnchor: "none" }}
        >
          {/* Nav Row */}
          <SwissGridSection id="nav" className="relative z-20 w-full">
            <Reveal phase={1} className="w-full">
              <div className="h-[118px] w-full">
                <div className="mx-auto flex h-full max-w-3xl items-center justify-between px-6 sm:px-8">
                  <div className="hidden sm:block">
                    <LocationBadge />
                  </div>
                  <div className="flex-1" />
                  <div className="hidden sm:block">
                    <TimeBadge />
                  </div>
                </div>
              </div>
            </Reveal>
          </SwissGridSection>

          {/* Profile Section */}
          <SwissGridSection id="profile" className="w-full">
            <Reveal phase={1} className="w-full">
              <header className="w-full">
                <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-8 sm:px-8">
                  <div className="flex items-center gap-4">
                    <Avatar className="relative size-14 overflow-hidden rounded-[var(--radius)] border border-surface-200 bg-surface-100 dark:border-surface-800 dark:bg-surface-900">
                      <Image
                        src={avatarImage}
                        alt="Yassine Chettouch"
                        className="object-cover grayscale transition-all duration-500 hover:grayscale-0"
                        placeholder="blur"
                        fill
                        sizes="56px"
                      />
                      <AvatarFallback className="flex h-full w-full items-center justify-center bg-surface-100 font-medium text-sm text-surface-400 dark:bg-surface-900 dark:text-surface-500">
                        YC
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h1 className="font-semibold text-body-lg text-surface-900 dark:text-surface-100">
                        Yassine Chettouch
                      </h1>
                      <p className="text-body-sm text-surface-500 dark:text-surface-400">
                        Senior Product Engineer
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      asChild
                      variant="plain"
                      size="icon"
                      shape="default"
                      tooltipContent="X (Twitter)"
                    >
                      <Link
                        href="https://x.com/yaschet"
                        target="_blank"
                        aria-label="X"
                      >
                        <svg
                          aria-hidden="true"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          className="size-5"
                        >
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="plain"
                      size="icon"
                      shape="default"
                      tooltipContent="GitHub"
                    >
                      <Link
                        href="https://github.com/yaschet"
                        target="_blank"
                        aria-label="GitHub"
                      >
                        <GithubLogo className="size-5" weight="duotone" />
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="plain"
                      size="icon"
                      shape="default"
                      tooltipContent="LinkedIn"
                    >
                      <Link
                        href="https://linkedin.com/in/yaschet"
                        target="_blank"
                        aria-label="LinkedIn"
                      >
                        <LinkedinLogo className="size-5" weight="duotone" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </header>
            </Reveal>
          </SwissGridSection>

          {/* Hero Section */}
          <SwissGridSection id="hero" className="w-full">
            <Reveal phase={2} className="w-full">
              <section className="w-full">
                <div className="mx-auto max-w-3xl px-6 py-12 sm:px-8">
                  <Reveal phase={2}>
                    <h1 className="mb-6 text-heading-xl text-surface-900 dark:text-surface-100">
                      I turn ambitious ideas into{" "}
                      <span className="text-surface-400 dark:text-surface-500">
                        revenue-generating products.
                      </span>
                    </h1>
                  </Reveal>
                  <Reveal phase={2} delay={0.05}>
                    <p className="mb-8 max-w-xl text-body-lg text-surface-600 dark:text-surface-400">
                      Your vision needs more than just a developer—it needs a
                      partner who plays to win. I build systems that scale,
                      experiences that convert, and software that defines your
                      brand.
                    </p>
                  </Reveal>
                  <Reveal phase={2} delay={0.1}>
                    <div className="flex flex-wrap items-center gap-3">
                      <Button asChild size="lg">
                        <Link href="mailto:hello@yaschet.dev">
                          Let's talk
                          <ArrowRight className="size-4" weight="bold" />
                        </Link>
                      </Button>
                      <Button asChild variant="outlined" size="lg">
                        <Link href="/projects">View my work</Link>
                      </Button>
                    </div>
                  </Reveal>
                </div>
              </section>
            </Reveal>
          </SwissGridSection>

          {/* Featured Project */}
          <SwissGridSection id="featured" className="w-full">
            <ScrollReveal phase={3} className="w-full">
              <section className="w-full">
                <div className="mx-auto max-w-3xl px-6 py-12 sm:px-8">
                  <ScrollReveal phase={3}>
                    <p className="mb-6 font-medium text-surface-400 text-xs uppercase tracking-widest dark:text-surface-500">
                      Featured Work
                    </p>
                  </ScrollReveal>
                  <ScrollReveal phase={3} delay={0.05}>
                    <Link href="/projects/protranslate" className="group block">
                      <div className="relative mb-6 aspect-[16/9] overflow-hidden rounded-[var(--radius)] bg-surface-900 ring-1 ring-surface-200 dark:ring-surface-800">
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-surface-800 to-surface-900">
                          <div className="px-6 text-center sm:px-8">
                            <h2 className="mb-2 text-heading-lg text-white">
                              Protranslate
                            </h2>
                            <p className="mx-auto max-w-sm text-body-sm text-surface-400">
                              AI-powered document translation SaaS with
                              real-time collaboration and enterprise-grade
                              security.
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-body-sm text-surface-500 transition-colors group-hover:text-surface-900 dark:text-surface-400 dark:group-hover:text-surface-100">
                        View case study
                        <ArrowRight
                          className="size-4 transition-transform group-hover:translate-x-1"
                          weight="bold"
                        />
                      </div>
                    </Link>
                  </ScrollReveal>
                </div>
              </section>
            </ScrollReveal>
          </SwissGridSection>

          {/* More Projects */}
          <SwissGridSection id="more-projects" className="w-full">
            <ScrollReveal phase={3} className="w-full">
              <section className="w-full">
                <div className="mx-auto max-w-3xl px-6 py-12 sm:px-8">
                  <ScrollReveal phase={3}>
                    <p className="mb-6 font-medium text-surface-400 text-xs uppercase tracking-widest dark:text-surface-500">
                      More Work
                    </p>
                  </ScrollReveal>
                  <div className="space-y-8">
                    <ScrollReveal phase={3} delay={0.05}>
                      <Link
                        href="/projects/student-portal"
                        className="group block"
                      >
                        <h3 className="mb-1 text-heading-md text-surface-900 transition-colors group-hover:text-surface-600 dark:text-surface-100 dark:group-hover:text-surface-300">
                          Student Onboarding Portal
                        </h3>
                        <p className="mb-2 text-body-sm text-surface-500 dark:text-surface-400">
                          Enterprise internal tool for streamlining student
                          enrollment and documentation workflows.
                        </p>
                        <div className="flex items-center gap-1 text-body-sm text-surface-400 transition-colors group-hover:text-surface-600 dark:group-hover:text-surface-300">
                          View project
                          <ArrowRight
                            className="size-3 transition-transform group-hover:translate-x-1"
                            weight="bold"
                          />
                        </div>
                      </Link>
                    </ScrollReveal>

                    <ScrollReveal phase={3} delay={0.1}>
                      <Link
                        href="/projects/saas-starter"
                        className="group block"
                      >
                        <h3 className="mb-1 text-heading-md text-surface-900 transition-colors group-hover:text-surface-600 dark:text-surface-100 dark:group-hover:text-surface-300">
                          SaaS Starter Kit
                        </h3>
                        <p className="mb-2 text-body-sm text-surface-500 dark:text-surface-400">
                          Production-ready Next.js template with authentication,
                          billing, and admin dashboard.
                        </p>
                        <div className="flex items-center gap-1 text-body-sm text-surface-400 transition-colors group-hover:text-surface-600 dark:group-hover:text-surface-300">
                          View project
                          <ArrowRight
                            className="size-3 transition-transform group-hover:translate-x-1"
                            weight="bold"
                          />
                        </div>
                      </Link>
                    </ScrollReveal>
                  </div>
                </div>
              </section>
            </ScrollReveal>
          </SwissGridSection>

          {/* Footer */}
          <footer className="w-full">
            <div className="mx-auto max-w-3xl px-6 py-12 sm:px-8">
              <ScrollReveal phase={3}>
                <p className="text-body-sm text-surface-400 dark:text-surface-500">
                  © {new Date().getFullYear()} Yassine Chettouch. All rights
                  reserved.
                </p>
              </ScrollReveal>
            </div>
          </footer>
        </main>
      </div>
    </SwissGridProvider>
  );
}
