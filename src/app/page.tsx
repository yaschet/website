import { ArrowRight, GithubLogo, LinkedinLogo } from "@phosphor-icons/react/dist/ssr";
import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";
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
		<div className="min-h-screen text-surface-900 selection:bg-surface-900 selection:text-surface-50 dark:text-surface-50 dark:selection:bg-surface-100 dark:selection:text-surface-900">
			{/* Vertical Column Borders — Phase 0: Instant structure */}
			<Reveal phase={0} className="pointer-events-none fixed inset-0 z-0">
				<div className="mx-auto h-full max-w-3xl border-surface-200/50 border-x border-dashed dark:border-surface-800/50" />
			</Reveal>

			<main
				className="relative z-10 flex min-h-screen flex-col"
				style={{ overflowAnchor: "none" }}
			>
				{/* Hero Gradient - positioned behind first sections */}
				<HeroGradient className="z-0" />

				{/* Nav Row: Context badges + Nav space — Phase 1: Primary content */}
				<Reveal phase={1} className="relative z-20 w-full">
					<div className="h-[118px] w-full border-surface-200 border-b border-dashed dark:border-surface-800">
						<div className="mx-auto flex h-full max-w-3xl items-center justify-between px-6 sm:px-8">
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

				{/* Profile Section — Phase 1: Primary content */}
				<Reveal phase={1} className="w-full">
					<header className="w-full border-surface-200 border-b border-dashed dark:border-surface-800">
						<Reveal
							phase={1}
							className="mx-auto flex max-w-3xl items-center justify-between px-6 py-8 sm:px-8"
						>
							<div className="flex items-center gap-4">
								<Avatar className="relative size-14 overflow-hidden rounded-full border border-surface-200 bg-surface-100 dark:border-surface-800 dark:bg-surface-900">
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

							<div className="flex items-center gap-4 text-surface-400 dark:text-surface-500">
								<Link
									href="https://x.com/yaschet"
									target="_blank"
									className="transition-colors hover:text-surface-900 dark:hover:text-surface-100"
									aria-label="X"
								>
									<svg fill="currentColor" viewBox="0 0 24 24" className="size-5">
										<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
									</svg>
								</Link>
								<Link
									href="https://github.com/yaschet"
									target="_blank"
									className="transition-colors hover:text-surface-900 dark:hover:text-surface-100"
									aria-label="GitHub"
								>
									<GithubLogo className="size-5" weight="duotone" />
								</Link>
								<Link
									href="https://linkedin.com/in/yaschet"
									target="_blank"
									className="transition-colors hover:text-surface-900 dark:hover:text-surface-100"
									aria-label="LinkedIn"
								>
									<LinkedinLogo className="size-5" weight="duotone" />
								</Link>
							</div>
						</Reveal>
					</header>
				</Reveal>

				{/* Hero Section — Phase 2: Hero content */}
				<Reveal phase={2} className="w-full">
					<section className="w-full border-surface-200 border-b border-dashed dark:border-surface-800">
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
									Your vision needs more than just a developer—it needs a partner
									who plays to win. I build systems that scale, experiences that
									convert, and software that defines your brand.
								</p>
							</Reveal>
							<Reveal phase={2} delay={0.1}>
								<Link
									href="mailto:hello@yaschet.dev"
									className="inline-flex items-center gap-2 rounded-full bg-surface-900 px-5 py-2.5 font-medium text-sm text-surface-50 transition-colors hover:bg-surface-800 dark:bg-surface-100 dark:text-surface-900 dark:hover:bg-surface-200"
								>
									Let's build something
									<ArrowRight className="size-4" weight="bold" />
								</Link>
							</Reveal>
						</div>
					</section>
				</Reveal>

				{/* ROW 4: Featured Project — Phase 3: Scroll content */}
				<section className="w-full border-surface-200 border-b border-dashed dark:border-surface-800">
					<div className="mx-auto max-w-3xl px-6 py-12 sm:px-8">
						<ScrollReveal phase={3}>
							<p className="mb-6 font-medium text-surface-400 text-xs uppercase tracking-widest dark:text-surface-500">
								Featured Work
							</p>
						</ScrollReveal>
						<ScrollReveal phase={3} delay={0.05}>
							<Link href="/projects/protranslate" className="group block">
								<div className="relative mb-6 aspect-[16/9] overflow-hidden rounded-xl bg-surface-900 ring-1 ring-surface-200 dark:ring-surface-800">
									<div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-surface-800 to-surface-900">
										<div className="px-6 text-center sm:px-8">
											<h2 className="mb-2 text-heading-lg text-white">
												Protranslate
											</h2>
											<p className="mx-auto max-w-sm text-body-sm text-surface-400">
												AI-powered document translation SaaS with real-time
												collaboration and enterprise-grade security.
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

				{/* ROW 5: More Projects — Phase 3: Scroll content */}
				<section className="w-full border-surface-200 border-b border-dashed dark:border-surface-800">
					<div className="mx-auto max-w-3xl px-6 py-12 sm:px-8">
						<ScrollReveal phase={3}>
							<p className="mb-6 font-medium text-surface-400 text-xs uppercase tracking-widest dark:text-surface-500">
								More Work
							</p>
						</ScrollReveal>
						<div className="space-y-8">
							<ScrollReveal phase={3} delay={0.05}>
								<Link href="/projects/student-portal" className="group block">
									<h3 className="mb-1 text-heading-md text-surface-900 transition-colors group-hover:text-surface-600 dark:text-surface-100 dark:group-hover:text-surface-300">
										Student Onboarding Portal
									</h3>
									<p className="mb-2 text-body-sm text-surface-500 dark:text-surface-400">
										Enterprise internal tool for streamlining student enrollment
										and documentation workflows.
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
								<Link href="/projects/automation-suite" className="group block">
									<h3 className="mb-1 text-heading-md text-surface-900 transition-colors group-hover:text-surface-600 dark:text-surface-100 dark:group-hover:text-surface-300">
										AI Automation Suite
									</h3>
									<p className="mb-2 text-body-sm text-surface-500 dark:text-surface-400">
										Data cleansing pipelines and intelligent program search
										engines for complex enterprise data.
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

				{/* ═══════════════════════════════════════════════════════════════════
            ROW 6: Footer
            Padding: 32px vertical
        ═══════════════════════════════════════════════════════════════════ */}
				<footer className="mt-auto">
					<div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-8 text-body-sm text-surface-400 sm:px-8 dark:text-surface-500">
						<p>© 2025 Yassine Chettouch</p>
						<p>Available for new projects</p>
					</div>
				</footer>
			</main>
		</div>
	);
}
