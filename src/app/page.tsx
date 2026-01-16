import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";
import { ArrowRight, Github, Linkedin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import avatarImage from "../../public/images/avatar.jpeg";
import { LocationBadge, TimeBadge } from "../components/ui/context-badges";
import { HeroGradient } from "../components/ui/hero-gradient";
import { Reveal, ScrollReveal } from "../components/ui/reveal";

/**
 * SPACING SYSTEM (φ-based, 8px base)
 * ────────────────────────────────────
 * 8px   = base unit
 * 16px  = 2×base
 * 24px  = 3×base (φ¹ ≈ 1.618 × 8 ≈ 13 → rounded to 16 or 24)
 * 32px  = 4×base
 * 48px  = 6×base
 * 64px  = 8×base
 *
 * GRID ROW HEIGHTS
 * ────────────────────────────────────
 * Row 0: StatusBanner = 32px (fixed in layout.tsx)
 * Row 1: Nav Grid     = 96px (24px top + 48px nav + 24px bottom)
 * Row 2: Header       = py-32 content
 * Row 3: Hero         = py-48 content
 * Row 4: Featured     = py-48 content
 * Row 5: More Work    = py-48 content
 * Row 6: Footer       = py-32 content
 *
 * FLOATINGNAV POSITION
 * ────────────────────────────────────
 * Banner: 32px
 * Top padding in nav row: 24px
 * Nav height: ~48px
 * → Nav top = 32 + 24 = 56px from viewport top
 */

export default function Home() {
  return (
    <div className="min-h-screen text-surface-900 dark:text-surface-50 selection:bg-surface-900 selection:text-surface-50 dark:selection:bg-surface-100 dark:selection:text-surface-900">
      {/* Vertical Column Borders */}

      <Reveal phase={1} className="fixed inset-0 pointer-events-none z-0">
        <div className="mx-auto max-w-3xl h-full border-x border-dashed border-surface-200/50 dark:border-surface-800/50" />
      </Reveal>

      <main className="relative z-10 flex flex-col min-h-screen">
        {/* Hero Gradient - positioned behind first sections */}
        <HeroGradient className="z-0" />
        {/* Nav Row: Context badges + Nav space */}
        <Reveal phase={1} className="w-full relative z-20">
          <div className="h-[118px] w-full border-b border-dashed border-surface-200 dark:border-surface-800">
            <div className="mx-auto max-w-3xl h-full px-6 sm:px-8 flex items-center justify-between">
              {/* Left: Location Badge */}
              <div className="hidden sm:block">
                <LocationBadge />
              </div>

              {/* Center: Space for fixed nav (nav is separate, this is just spacing) */}
              <div className="flex-1" />

              {/* Right: Time Badge */}
              <div className="hidden sm:block">
                <TimeBadge />
              </div>
            </div>
          </div>
        </Reveal>

        {/* ═══════════════════════════════════════════════════════════════════
            ROW 2: Header (Avatar + Name | Socials)
            Padding: 32px vertical
        ═══════════════════════════════════════════════════════════════════ */}
        <header className="w-full border-b border-dashed border-surface-200 dark:border-surface-800">
          <div className="mx-auto max-w-3xl px-6 sm:px-8 py-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="relative size-14 rounded-full border border-surface-200 dark:border-surface-800 overflow-hidden bg-surface-100 dark:bg-surface-900">
                <Image
                  src={avatarImage}
                  alt="Yassine Chettouch"
                  className="grayscale hover:grayscale-0 transition-all duration-500 object-cover"
                  placeholder="blur"
                  fill
                  sizes="56px"
                />
                <AvatarFallback className="flex h-full w-full items-center justify-center bg-surface-100 dark:bg-surface-900 text-sm font-medium text-surface-400 dark:text-surface-500">
                  YC
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-body-lg font-semibold text-surface-900 dark:text-surface-100">
                  Yassine Chettouch
                </h1>
                <p className="text-body-sm text-surface-500 dark:text-surface-400">
                  Senior Product Engineer
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-surface-400 dark:text-surface-500">
              <Link
                href="https://x.com/yaschet"
                target="_blank"
                className="hover:text-surface-900 dark:hover:text-surface-100 transition-colors"
                aria-label="X"
              >
                <svg fill="currentColor" viewBox="0 0 24 24" className="size-5">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </Link>
              <Link
                href="https://github.com/yaschet"
                target="_blank"
                className="hover:text-surface-900 dark:hover:text-surface-100 transition-colors"
                aria-label="GitHub"
              >
                <Github className="size-5" />
              </Link>
              <Link
                href="https://linkedin.com/in/yaschet"
                target="_blank"
                className="hover:text-surface-900 dark:hover:text-surface-100 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="size-5" />
              </Link>
            </div>
          </div>
        </header>

        {/* ═══════════════════════════════════════════════════════════════════
            ROW 3: Hero (Headline + Subtitle + CTA)
            Padding: 48px vertical
        ═══════════════════════════════════════════════════════════════════ */}
        <section className="w-full border-b border-dashed border-surface-200 dark:border-surface-800">
          <div className="mx-auto max-w-3xl px-6 sm:px-8 py-12">
            <Reveal>
              <h1 className="text-heading-xl text-surface-900 dark:text-surface-100 mb-6">
                I turn ambitious ideas into{" "}
                <span className="text-surface-400 dark:text-surface-500">
                  revenue-generating products.
                </span>
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="text-body-lg text-surface-600 dark:text-surface-400 max-w-xl mb-8">
                Your vision needs more than just a developer—it needs a partner
                who plays to win. I build systems that scale, experiences that
                convert, and software that defines your brand.
              </p>
            </Reveal>
            <Reveal delay={0.2}>
              <Link
                href="mailto:hello@yaschet.dev"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-surface-900 dark:bg-surface-100 text-surface-50 dark:text-surface-900 rounded-full text-sm font-medium hover:bg-surface-800 dark:hover:bg-surface-200 transition-colors"
              >
                Let's build something
                <ArrowRight className="size-4" />
              </Link>
            </Reveal>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            ROW 4: Featured Project
            Padding: 48px vertical
        ═══════════════════════════════════════════════════════════════════ */}
        <section className="w-full border-b border-dashed border-surface-200 dark:border-surface-800">
          <div className="mx-auto max-w-3xl px-6 sm:px-8 py-12">
            <ScrollReveal>
              <p className="text-xs font-medium text-surface-400 dark:text-surface-500 uppercase tracking-widest mb-6">
                Featured Work
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <Link href="/projects/protranslate" className="group block">
                <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-surface-900 ring-1 ring-surface-200 dark:ring-surface-800 mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-surface-800 to-surface-900 flex items-center justify-center">
                    <div className="text-center px-6 sm:px-8">
                      <h2 className="text-heading-lg text-white mb-2">
                        Protranslate
                      </h2>
                      <p className="text-body-sm text-surface-400 max-w-sm mx-auto">
                        AI-powered document translation SaaS with real-time
                        collaboration and enterprise-grade security.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-body-sm text-surface-500 dark:text-surface-400 group-hover:text-surface-900 dark:group-hover:text-surface-100 transition-colors">
                  View case study
                  <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </ScrollReveal>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            ROW 5: More Projects
            Padding: 48px vertical
        ═══════════════════════════════════════════════════════════════════ */}
        <section className="w-full border-b border-dashed border-surface-200 dark:border-surface-800">
          <div className="mx-auto max-w-3xl px-6 sm:px-8 py-12">
            <ScrollReveal>
              <p className="text-xs font-medium text-surface-400 dark:text-surface-500 uppercase tracking-widest mb-6">
                More Work
              </p>
            </ScrollReveal>
            <div className="space-y-8">
              <ScrollReveal delay={0.1}>
                <Link href="/projects/student-portal" className="group block">
                  <h3 className="text-heading-md text-surface-900 dark:text-surface-100 mb-1 group-hover:text-surface-600 dark:group-hover:text-surface-300 transition-colors">
                    Student Onboarding Portal
                  </h3>
                  <p className="text-body-sm text-surface-500 dark:text-surface-400 mb-2">
                    Enterprise internal tool for streamlining student enrollment
                    and documentation workflows.
                  </p>
                  <div className="flex items-center gap-1 text-body-sm text-surface-400 group-hover:text-surface-600 dark:group-hover:text-surface-300 transition-colors">
                    View project
                    <ArrowRight className="size-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </ScrollReveal>

              <ScrollReveal delay={0.2}>
                <Link href="/projects/automation-suite" className="group block">
                  <h3 className="text-heading-md text-surface-900 dark:text-surface-100 mb-1 group-hover:text-surface-600 dark:group-hover:text-surface-300 transition-colors">
                    AI Automation Suite
                  </h3>
                  <p className="text-body-sm text-surface-500 dark:text-surface-400 mb-2">
                    Data cleansing pipelines and intelligent program search
                    engines for complex enterprise data.
                  </p>
                  <div className="flex items-center gap-1 text-body-sm text-surface-400 group-hover:text-surface-600 dark:group-hover:text-surface-300 transition-colors">
                    View project
                    <ArrowRight className="size-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            ROW 6: Footer
            Padding: 32px vertical
        ═══════════════════════════════════════════════════════════════════ */}
        <footer className="mt-auto">
          <div className="mx-auto max-w-3xl px-6 sm:px-8 py-8 flex items-center justify-between text-body-sm text-surface-400 dark:text-surface-500">
            <p>© 2025 Yassine Chettouch</p>
            <p>Available for new projects</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
