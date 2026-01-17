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

// Static Assets for Gallery
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
                        Senior Product Engineer
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

          {/* Hero Section — Rewritten with Specificity */}
          <SwissGridSection id="hero" className="w-full">
            <Reveal phase={2} className="w-full">
              <section className="w-full">
                <div className="mx-auto max-w-3xl px-6 py-12 sm:px-8">
                  <Reveal phase={2}>
                    <h1 className="mb-6 text-heading-xl text-surface-900 dark:text-surface-100">
                      I build SaaS products{" "}
                      <span className="text-surface-400 dark:text-surface-500">
                        from zero to revenue.
                      </span>
                    </h1>
                  </Reveal>
                  <Reveal phase={2} delay={0.05}>
                    <p className="mb-8 max-w-xl text-body-lg text-surface-600 dark:text-surface-400">
                      I've shipped an AI translation platform processing
                      thousands of documents monthly, and automated onboarding
                      flows that eliminated hours of manual work. I design
                      systems that scale and interfaces that feel effortless.
                    </p>
                  </Reveal>
                  <Reveal phase={2} delay={0.1}>
                    <div className="flex flex-wrap items-center gap-3">
                      <Button asChild size="lg" variant="solid" color="primary">
                        <Link href="mailto:hello@yaschet.dev">
                          Let's talk
                          <ArrowRight className="size-4" weight="bold" />
                        </Link>
                      </Button>
                      <Button
                        asChild
                        variant="outlined"
                        size="lg"
                        color="primary"
                      >
                        <Link href="/projects">View my work</Link>
                      </Button>
                    </div>
                  </Reveal>
                </div>
              </section>
            </Reveal>
          </SwissGridSection>

          {/* About Snippet — Voice & Personality */}
          <SwissGridSection id="about-snippet" className="w-full">
            <ScrollReveal phase={2} className="w-full">
              <section className="w-full">
                <div className="mx-auto max-w-3xl px-6 py-12 sm:px-8">
                  <ScrollReveal phase={2}>
                    <blockquote className="border-l-2 border-surface-300 pl-6 text-body-lg italic text-surface-600 dark:border-surface-700 dark:text-surface-400">
                      "I obsess over the details others skip—the 200ms animation
                      curve, the edge case in the form flow, the moment a user
                      almost bounces but doesn't. Good software should feel like
                      it was designed just for you."
                    </blockquote>
                  </ScrollReveal>
                </div>
              </section>
            </ScrollReveal>
          </SwissGridSection>

          {/* Featured Project — With Story */}
          <SwissGridSection id="featured" className="w-full">
            <ScrollReveal phase={3} className="w-full">
              <section className="w-full">
                <div className="mx-auto max-w-3xl px-6 py-12 sm:px-8">
                  <ScrollReveal phase={3}>
                    <p className="mb-6 font-medium text-xs uppercase tracking-widest text-surface-400 dark:text-surface-500">
                      Featured Work
                    </p>
                  </ScrollReveal>
                  <ScrollReveal phase={3} delay={0.05}>
                    <MonolithCard
                      index="01"
                      title="Protranslate"
                      description="An AI-powered translation platform I built from scratch. Handles 50+ languages with real-time collaboration, version control, and enterprise security. Thousands of documents processed monthly."
                      href="/projects/protranslate"
                      tags={["Next.js", "Supabase", "OpenAI", "Stripe"]}
                      images={[Asset1, Asset2, Asset3, Asset4]}
                    />
                  </ScrollReveal>
                </div>
              </section>
            </ScrollReveal>
          </SwissGridSection>

          {/* More Projects — With Stories */}
          <SwissGridSection id="more-projects" className="w-full">
            <ScrollReveal phase={3} className="w-full">
              <section className="w-full">
                <div className="mx-auto max-w-3xl px-6 py-12 sm:px-8">
                  <ScrollReveal phase={3}>
                    <p className="mb-6 font-medium text-xs uppercase tracking-widest text-surface-400 dark:text-surface-500">
                      More Work
                    </p>
                  </ScrollReveal>
                  <div className="space-y-8">
                    <ScrollReveal phase={3} delay={0.05}>
                      <MonolithCard
                        index="02"
                        title="Student Onboarding Portal"
                        description="Built for a Moroccan agency processing 500+ applications yearly. Features OCR scanning for IDs and passports, auto-fill workflows, and dynamic question logic. Reduced processing time by 60%."
                        href="/projects/student-portal"
                        tags={["React", "Node.js", "PostgreSQL", "OCR"]}
                        images={[Asset5, Asset6, Asset7, Asset8]}
                        isPrivate
                      />
                    </ScrollReveal>
                    <ScrollReveal phase={3} delay={0.1}>
                      <MonolithCard
                        index="03"
                        title="SaaS Starter Kit"
                        description="An open-source template for launching production-ready SaaS products. Includes authentication, billing, admin dashboard, and deployment scripts. Used by developers worldwide."
                        href="/projects/saas-starter"
                        tags={["Next.js", "Stripe", "Tailwind"]}
                        images={[Asset9, Asset10, Asset11, Asset12]}
                      />
                    </ScrollReveal>
                  </div>
                </div>
              </section>
            </ScrollReveal>
          </SwissGridSection>

          {/* Process Section — How I Work */}
          <SwissGridSection id="process" className="w-full">
            <ScrollReveal phase={3} className="w-full">
              <section className="w-full">
                <div className="mx-auto max-w-3xl px-6 py-12 sm:px-8">
                  <ScrollReveal phase={3}>
                    <p className="mb-6 font-medium text-xs uppercase tracking-widest text-surface-400 dark:text-surface-500">
                      How I Work
                    </p>
                  </ScrollReveal>
                  <div className="grid gap-8 sm:grid-cols-3">
                    <ScrollReveal phase={3} delay={0.05}>
                      <div className="space-y-3">
                        <span className="font-mono text-xs text-surface-400">
                          01
                        </span>
                        <h3 className="font-medium text-lg text-surface-900 dark:text-surface-50">
                          Understand
                        </h3>
                        <p className="text-sm text-surface-600 dark:text-surface-400">
                          I start by understanding your business, users, and
                          constraints. No code until the problem is crystal
                          clear.
                        </p>
                      </div>
                    </ScrollReveal>
                    <ScrollReveal phase={3} delay={0.1}>
                      <div className="space-y-3">
                        <span className="font-mono text-xs text-surface-400">
                          02
                        </span>
                        <h3 className="font-medium text-lg text-surface-900 dark:text-surface-50">
                          Build
                        </h3>
                        <p className="text-sm text-surface-600 dark:text-surface-400">
                          I ship fast with weekly updates. You see progress, not
                          promises. Every decision is documented and reversible.
                        </p>
                      </div>
                    </ScrollReveal>
                    <ScrollReveal phase={3} delay={0.15}>
                      <div className="space-y-3">
                        <span className="font-mono text-xs text-surface-400">
                          03
                        </span>
                        <h3 className="font-medium text-lg text-surface-900 dark:text-surface-50">
                          Launch
                        </h3>
                        <p className="text-sm text-surface-600 dark:text-surface-400">
                          I don't disappear after launch. I help you iterate
                          based on real user feedback until the product works
                          for your business.
                        </p>
                      </div>
                    </ScrollReveal>
                  </div>
                </div>
              </section>
            </ScrollReveal>
          </SwissGridSection>

          {/* Final CTA */}
          <SwissGridSection id="cta" className="w-full">
            <ScrollReveal phase={3} className="w-full">
              <section className="w-full">
                <div className="mx-auto max-w-3xl px-6 py-16 sm:px-8">
                  <ScrollReveal phase={3}>
                    <div className="text-center">
                      <h2 className="mb-4 text-heading-lg text-surface-900 dark:text-surface-100">
                        Ready to build something?
                      </h2>
                      <p className="mb-8 text-body-md text-surface-600 dark:text-surface-400">
                        I'm currently available for new projects.
                      </p>
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
