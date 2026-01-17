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
import { MonolithCard } from "@/src/components/ui/monolith-card";
import {
  SwissGridProvider,
  SwissGridSection,
} from "@/src/components/ui/swiss-grid-canvas";

// Static Assets
import Asset1 from "@/public/images/placeholders/asset-1.jpg";
import Asset2 from "@/public/images/placeholders/asset-2.jpg";
import Asset3 from "@/public/images/placeholders/asset-3.jpg";
import Asset4 from "@/public/images/placeholders/asset-4.jpg";
import Asset5 from "@/public/images/placeholders/asset-5.jpg";
import Asset6 from "@/public/images/placeholders/asset-6.jpg";
import Asset7 from "@/public/images/placeholders/asset-7.jpg";
import Asset8 from "@/public/images/placeholders/asset-8.jpg";
import Asset9 from "@/public/images/placeholders/asset-9.jpg";
import Asset10 from "@/public/images/placeholders/asset-10.jpg";
import Asset11 from "@/public/images/placeholders/asset-11.jpg";
import Asset12 from "@/public/images/placeholders/asset-12.jpg";

export default function Home() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <SwissGridProvider>
      <div className="min-h-screen text-surface-900 selection:bg-surface-900 selection:text-surface-50 dark:text-surface-50 dark:selection:bg-surface-100 dark:selection:text-surface-900">
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
          <SwissGridSection id="profile" className="relative w-full">
            <HeroGradient className="absolute inset-x-0 top-0 z-0 h-screen" />

            <Reveal phase={1} className="relative z-10 w-full">
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
                        Product Engineer
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      asChild
                      variant="solid"
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
                      variant="solid"
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
                      variant="solid"
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

          {/* Hero */}
          <SwissGridSection id="hero" className="w-full">
            <Reveal phase={2} className="w-full">
              <section className="w-full">
                <div className="mx-auto max-w-3xl px-6 py-12 sm:px-8">
                  <Reveal phase={2}>
                    <h1 className="mb-6 text-heading-xl text-surface-900 dark:text-surface-100">
                      I build production systems.
                    </h1>
                  </Reveal>
                  <Reveal phase={2} delay={0.05}>
                    <p className="mb-8 max-w-xl text-body-lg text-surface-600 dark:text-surface-400">
                      SaaS platforms, data engines, internal tools. I've spent 5
                      years shipping software that handles real users, real
                      payments, and real complexity. Here are three systems I
                      built.
                    </p>
                  </Reveal>
                  <Reveal phase={2} delay={0.1}>
                    <div className="flex flex-wrap items-center gap-3">
                      <Button asChild size="lg" variant="solid" color="primary">
                        <Link href="mailto:hello@yaschet.dev">
                          Start a conversation
                          <ArrowRight className="size-4" weight="bold" />
                        </Link>
                      </Button>
                    </div>
                  </Reveal>
                </div>
              </section>
            </Reveal>
          </SwissGridSection>

          {/* Featured: Verto */}
          <SwissGridSection id="featured" className="w-full">
            <ScrollReveal phase={3} className="w-full">
              <section className="w-full">
                <div className="mx-auto max-w-3xl px-6 py-12 sm:px-8">
                  <ScrollReveal phase={3}>
                    <p className="mb-6 font-medium text-xs uppercase tracking-widest text-surface-400 dark:text-surface-500">
                      01 · AI Translation Platform
                    </p>
                  </ScrollReveal>
                  <ScrollReveal phase={3} delay={0.05}>
                    <MonolithCard
                      index="01"
                      title="Verto"
                      description="Enterprise translation platform. Upload a document, AI reconstructs it in another language—preserving layout, tables, and formatting. MFA auth, credit-based billing, real-time processing. I built and own the entire codebase."
                      href="/projects/verto"
                      tags={[
                        "Next.js",
                        "Supabase",
                        "OpenAI",
                        "Stripe",
                        "Trigger.dev",
                      ]}
                      images={[Asset1, Asset2, Asset3, Asset4]}
                    />
                  </ScrollReveal>
                </div>
              </section>
            </ScrollReveal>
          </SwissGridSection>

          {/* Project 2: Data Engine */}
          <SwissGridSection id="project-2" className="w-full">
            <ScrollReveal phase={3} className="w-full">
              <section className="w-full">
                <div className="mx-auto max-w-3xl px-6 py-12 sm:px-8">
                  <ScrollReveal phase={3}>
                    <p className="mb-6 font-medium text-xs uppercase tracking-widest text-surface-400 dark:text-surface-500">
                      02 · Data Matching Engine
                    </p>
                  </ScrollReveal>
                  <ScrollReveal phase={3} delay={0.05}>
                    <MonolithCard
                      index="02"
                      title="Phoenix"
                      description="Data pipeline that processes thousands of records through AI cleansing, then matches them using Meilisearch + OpenAI embeddings. 10-hour overnight jobs with state persistence and automatic resume-on-failure."
                      href="/projects/phoenix"
                      tags={["Laravel", "Meilisearch", "OpenAI", "Redis"]}
                      images={[Asset5, Asset6, Asset7, Asset8]}
                      isPrivate
                    />
                  </ScrollReveal>
                </div>
              </section>
            </ScrollReveal>
          </SwissGridSection>

          {/* Project 3: Onboard Flow */}
          <SwissGridSection id="project-3" className="w-full">
            <ScrollReveal phase={3} className="w-full">
              <section className="w-full">
                <div className="mx-auto max-w-3xl px-6 py-12 sm:px-8">
                  <ScrollReveal phase={3}>
                    <p className="mb-6 font-medium text-xs uppercase tracking-widest text-surface-400 dark:text-surface-500">
                      03 · Customer Onboarding System
                    </p>
                  </ScrollReveal>
                  <ScrollReveal phase={3} delay={0.05}>
                    <MonolithCard
                      index="03"
                      title="Onboard Flow"
                      description="57-screen customer portal with magic link auth, OCR document scanning, and dynamic form logic. Typeform-style UX with enterprise security. Delivered in 6 weeks with full spec documentation."
                      href="/projects/onboard-flow"
                      tags={["Next.js", "Laravel", "AWS S3", "JWT"]}
                      images={[Asset9, Asset10, Asset11, Asset12]}
                      isPrivate
                    />
                  </ScrollReveal>
                </div>
              </section>
            </ScrollReveal>
          </SwissGridSection>

          {/* CTA */}
          <SwissGridSection id="cta" className="w-full">
            <ScrollReveal phase={3} className="w-full">
              <section className="w-full">
                <div className="mx-auto max-w-3xl px-6 py-16 sm:px-8">
                  <ScrollReveal phase={3}>
                    <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h2 className="text-heading-lg text-surface-900 dark:text-surface-100">
                          Have a project in mind?
                        </h2>
                        <p className="mt-1 text-body-md text-surface-600 dark:text-surface-400">
                          I'd like to hear about it.
                        </p>
                      </div>
                      <Button asChild size="lg" variant="solid" color="primary">
                        <Link href="mailto:hello@yaschet.dev">
                          Get in touch
                          <ArrowRight className="size-4" weight="bold" />
                        </Link>
                      </Button>
                    </div>
                  </ScrollReveal>
                </div>
              </section>
            </ScrollReveal>
          </SwissGridSection>

          {/* Footer */}
          <footer className="w-full">
            <div className="mx-auto max-w-3xl px-6 py-12 sm:px-8">
              <ScrollReveal phase={3}>
                <p className="text-body-sm text-surface-400 dark:text-surface-500">
                  © {new Date().getFullYear()} Yassine Chettouch
                </p>
              </ScrollReveal>
            </div>
          </footer>
        </main>
      </div>
    </SwissGridProvider>
  );
}
