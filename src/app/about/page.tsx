"use client";

import { Avatar, AvatarFallback } from "@components/ui/avatar";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";
import avatarImage from "@/public/images/avatar.jpeg";
import { Button } from "@/src/components/ui/button";
import { LocationBadge, TimeBadge } from "@/src/components/ui/context-badges";
import { HeroGradient } from "@/src/components/ui/hero-gradient";
import { Reveal, ScrollReveal } from "@/src/components/ui/reveal";
import {
  SwissGridProvider,
  SwissGridSection,
} from "@/src/components/ui/swiss-grid-canvas";

export default function AboutPage() {
  return (
    <SwissGridProvider>
      <div className="min-h-screen text-surface-900 selection:bg-surface-900 selection:text-surface-50 dark:text-surface-50 dark:selection:bg-surface-100 dark:selection:text-surface-900">
        <main className="relative z-10 flex min-h-screen flex-col">
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

          {/* Header */}
          <SwissGridSection id="about-header" className="relative w-full">
            <HeroGradient className="absolute inset-x-0 top-0 z-0 h-screen" />

            <Reveal phase={1} className="relative z-10 w-full">
              <section className="w-full">
                <div className="mx-auto max-w-3xl px-6 py-8 sm:px-8">
                  <div className="flex flex-col items-start gap-8 sm:flex-row sm:items-center">
                    <Avatar className="relative size-20 overflow-hidden border border-surface-200 bg-surface-100 transition-transform duration-200 hover:scale-[1.02] dark:border-surface-800 dark:bg-surface-900">
                      <Image
                        src={avatarImage}
                        alt="Yassine Chettouch"
                        className="object-cover grayscale transition-all duration-500 hover:grayscale-0"
                        placeholder="blur"
                        fill
                        sizes="80px"
                      />
                      <AvatarFallback className="flex h-full w-full items-center justify-center bg-surface-100 font-medium text-lg text-surface-400 dark:bg-surface-900 dark:text-surface-500">
                        YC
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="mb-2 font-medium text-xs uppercase tracking-widest text-surface-400 dark:text-surface-500">
                        About
                      </p>
                      <h1 className="text-heading-xl text-surface-900 dark:text-surface-100">
                        Yassine Chettouch
                      </h1>
                      <p className="mt-2 text-body-lg text-surface-500 dark:text-surface-400">
                        Product Engineer · Rabat, Morocco
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </Reveal>
          </SwissGridSection>

          {/* 01 · Introduction */}
          <SwissGridSection id="story" className="w-full">
            <ScrollReveal phase={2} className="w-full">
              <section className="w-full">
                <div className="mx-auto max-w-3xl px-6 py-16 sm:px-8">
                  <ScrollReveal phase={2}>
                    <p className="mb-8 font-medium text-xs uppercase tracking-widest text-surface-400 dark:text-surface-500">
                      01 · Introduction
                    </p>
                  </ScrollReveal>
                  <div className="space-y-6 text-body-md text-surface-600 dark:text-surface-400">
                    <ScrollReveal phase={2} delay={0.05}>
                      <p>
                        I build software that runs in production. SaaS
                        platforms, data pipelines, internal tools—systems that
                        handle real users, real payments, and real complexity.
                      </p>
                    </ScrollReveal>
                    <ScrollReveal phase={2} delay={0.1}>
                      <p>
                        Over the past 5 years, I've shipped AI translation
                        platforms, data matching engines, and customer portals.
                        The kind of software that needs auth, billing,
                        multi-tenancy, and architecture that doesn't fall apart
                        at scale.
                      </p>
                    </ScrollReveal>
                    <ScrollReveal phase={2} delay={0.15}>
                      <p>
                        I work best with founders and companies who need a
                        technical partner— someone who understands both the code
                        and the business problem behind it.
                      </p>
                    </ScrollReveal>
                  </div>
                </div>
              </section>
            </ScrollReveal>
          </SwissGridSection>

          {/* 02 · What I Build */}
          <SwissGridSection id="what-i-build" className="w-full">
            <ScrollReveal phase={2} className="w-full">
              <section className="w-full">
                <div className="mx-auto max-w-3xl px-6 py-16 sm:px-8">
                  <ScrollReveal phase={2}>
                    <p className="mb-8 font-medium text-xs uppercase tracking-widest text-surface-400 dark:text-surface-500">
                      02 · What I Build
                    </p>
                  </ScrollReveal>
                  <div className="grid gap-8 sm:grid-cols-2">
                    <ScrollReveal phase={2} delay={0.05}>
                      <div className="group space-y-2 border border-transparent p-4 transition-all duration-200 hover:border-surface-200 hover:bg-surface-50/50 dark:hover:border-surface-800 dark:hover:bg-surface-900/30">
                        <h3 className="font-medium text-lg text-surface-900 dark:text-surface-50">
                          SaaS Platforms
                        </h3>
                        <p className="text-sm text-surface-600 dark:text-surface-400">
                          Auth, billing, teams, permissions. The infrastructure
                          that lets you charge money and scale users.
                        </p>
                      </div>
                    </ScrollReveal>
                    <ScrollReveal phase={2} delay={0.1}>
                      <div className="group space-y-2 border border-transparent p-4 transition-all duration-200 hover:border-surface-200 hover:bg-surface-50/50 dark:hover:border-surface-800 dark:hover:bg-surface-900/30">
                        <h3 className="font-medium text-lg text-surface-900 dark:text-surface-50">
                          AI Integrations
                        </h3>
                        <p className="text-sm text-surface-600 dark:text-surface-400">
                          OpenAI, embeddings, semantic search. Production
                          systems that process real workloads, not just demos.
                        </p>
                      </div>
                    </ScrollReveal>
                    <ScrollReveal phase={2} delay={0.15}>
                      <div className="group space-y-2 border border-transparent p-4 transition-all duration-200 hover:border-surface-200 hover:bg-surface-50/50 dark:hover:border-surface-800 dark:hover:bg-surface-900/30">
                        <h3 className="font-medium text-lg text-surface-900 dark:text-surface-50">
                          Data Pipelines
                        </h3>
                        <p className="text-sm text-surface-600 dark:text-surface-400">
                          Batch processing, resumable jobs, AI-powered
                          cleansing. For when you've got thousands of records to
                          handle.
                        </p>
                      </div>
                    </ScrollReveal>
                    <ScrollReveal phase={2} delay={0.2}>
                      <div className="group space-y-2 border border-transparent p-4 transition-all duration-200 hover:border-surface-200 hover:bg-surface-50/50 dark:hover:border-surface-800 dark:hover:bg-surface-900/30">
                        <h3 className="font-medium text-lg text-surface-900 dark:text-surface-50">
                          Internal Tools
                        </h3>
                        <p className="text-sm text-surface-600 dark:text-surface-400">
                          Admin dashboards, customer portals, workflow
                          automation. Tools that make your team faster.
                        </p>
                      </div>
                    </ScrollReveal>
                  </div>
                </div>
              </section>
            </ScrollReveal>
          </SwissGridSection>

          {/* 03 · How I Work */}
          <SwissGridSection id="how-i-work" className="w-full">
            <ScrollReveal phase={2} className="w-full">
              <section className="w-full">
                <div className="mx-auto max-w-3xl px-6 py-16 sm:px-8">
                  <ScrollReveal phase={2}>
                    <p className="mb-8 font-medium text-xs uppercase tracking-widest text-surface-400 dark:text-surface-500">
                      03 · How I Work
                    </p>
                  </ScrollReveal>
                  <div className="space-y-6 text-body-md text-surface-600 dark:text-surface-400">
                    <ScrollReveal phase={2} delay={0.05}>
                      <p>
                        Every project starts with a spec document. You know
                        exactly what you're getting, when you're getting it, and
                        what it costs. No scope creep. No surprises.
                      </p>
                    </ScrollReveal>
                    <ScrollReveal phase={2} delay={0.1}>
                      <p>
                        Weekly updates with working demos. You see progress, not
                        promises. If something's taking longer than expected,
                        you know about it early—not at the deadline.
                      </p>
                    </ScrollReveal>
                  </div>
                </div>
              </section>
            </ScrollReveal>
          </SwissGridSection>

          {/* CTA */}
          <SwissGridSection id="about-cta" className="w-full">
            <ScrollReveal phase={3} className="w-full">
              <section className="w-full">
                <div className="mx-auto max-w-3xl px-6 py-16 sm:px-8">
                  <ScrollReveal phase={3}>
                    <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h2 className="text-heading-md text-surface-900 dark:text-surface-100">
                          Have a project in mind?
                        </h2>
                        <p className="mt-1 text-body-md text-surface-500 dark:text-surface-400">
                          I'd like to hear about it.
                        </p>
                      </div>
                      <Button asChild size="lg" variant="solid" color="primary">
                        <Link href="mailto:hello@yaschet.dev">
                          Start a conversation
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
          <footer className="mt-auto w-full">
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
