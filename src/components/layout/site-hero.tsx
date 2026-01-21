"use client";

import {
	ArrowRightIcon,
	GithubLogoIcon,
	LinkedinLogoIcon,
	XLogoIcon,
} from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import avatarImage from "@/public/images/avatar.jpeg";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { Button } from "@/src/components/ui/button";
import { Reveal } from "@/src/components/ui/reveal";
import { SwissGridSection } from "@/src/components/ui/swiss-grid-canvas";
import { AtmosphereCanvas, useAtmosphere } from "../ui/atmosphere-canvas";

/**
 * Hero content that adapts to the atmosphere.
 * Uses the atmosphere context to determine text colors.
 */
function HeroContent() {
	const atmosphere = useAtmosphere();

	// Determine color scheme based on atmosphere
	// Light text for dark sky (night), dark text for bright sky (day)
	const needsLightText = atmosphere?.needsLightText ?? true;

	// Dynamic color classes based on atmosphere
	const textPrimary = needsLightText ? "text-surface-100" : "text-surface-900";
	const textSecondary = needsLightText ? "text-surface-400" : "text-surface-600";
	const iconColor = needsLightText
		? "text-surface-400 hover:text-accent-400"
		: "text-surface-600 hover:text-accent-600";
	const avatarBorder = needsLightText ? "border-surface-800" : "border-surface-200";
	const avatarBg = needsLightText ? "bg-surface-900" : "bg-surface-100";

	return (
		<>
			{/* Profile Row */}
			<Reveal phase={1} className="relative z-10 w-full">
				<header className="w-full">
					<div className="mx-auto flex h-full max-w-3xl items-center justify-between px-6 py-12 sm:px-8">
						<div className="flex items-center gap-4">
							<Avatar
								className={cn(
									"relative size-14 overflow-hidden rounded-(--radius) border",
									avatarBorder,
									avatarBg,
								)}
							>
								<Image
									src={avatarImage}
									alt="Yassine Chettouch"
									className="object-cover grayscale transition-all duration-500 hover:grayscale-0"
									placeholder="blur"
									fill
									sizes="56px"
								/>
								<AvatarFallback
									className={cn(
										"flex h-full w-full items-center justify-center font-medium text-sm",
										avatarBg,
										textSecondary,
									)}
								>
									YC
								</AvatarFallback>
							</Avatar>
							<div>
								<h1 className={cn("font-semibold text-body-lg", textPrimary)}>
									Yassine Chettouch
								</h1>
								<p className={cn("text-body-sm", textSecondary)}>
									Product Engineer
								</p>
							</div>
						</div>

						<div className="flex items-center gap-0.5">
							<Link
								href="https://linkedin.com/in/yaschet"
								target="_blank"
								aria-label="LinkedIn"
								className={cn(
									"inline-flex size-10 items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface-400 focus-visible:ring-offset-2",
									iconColor,
								)}
							>
								<LinkedinLogoIcon className="size-5" weight="regular" />
							</Link>
							<Link
								href="https://github.com/yaschet"
								target="_blank"
								aria-label="GitHub"
								className={cn(
									"inline-flex size-10 items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface-400 focus-visible:ring-offset-2",
									iconColor,
								)}
							>
								<GithubLogoIcon className="size-5" weight="regular" />
							</Link>
							<Link
								href="https://x.com/yaschet"
								target="_blank"
								aria-label="X"
								className={cn(
									"inline-flex size-10 items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface-400 focus-visible:ring-offset-2",
									iconColor,
								)}
							>
								<XLogoIcon className="size-5" weight="regular" />
							</Link>
						</div>
					</div>
				</header>
			</Reveal>

			{/* Headline Content */}
			<Reveal phase={2} className="relative z-10 w-full">
				<section className="w-full">
					<div className="mx-auto max-w-3xl px-6 py-16 sm:px-8">
						<Reveal phase={2}>
							<h1 className={cn("mb-6 text-heading-xl!", textPrimary)}>
								I build products for the web.
							</h1>
						</Reveal>
						<Reveal phase={2} delay={0.05}>
							<p className={cn("mb-8 max-w-xl text-body-lg", textSecondary)}>
								Web apps. SaaS platforms. Internal tools. From the first idea to the
								final deploy. Complex systems that feel effortless.
							</p>
						</Reveal>
						<Reveal phase={2} delay={0.1}>
							<div className="flex flex-wrap items-center gap-3">
								{/* Primary CTA - Always high contrast against atmosphere */}
								<Button
									asChild
									size="lg"
									variant="solid"
									color="primary"
									className={cn(
										needsLightText
											? "bg-surface-50 text-surface-950 hover:bg-surface-200"
											: "bg-surface-950 text-surface-50 hover:bg-surface-800",
									)}
								>
									<Link href="/projects">
										Case Studies
										<ArrowRightIcon className="size-4" weight="bold" />
									</Link>
								</Button>
								{/* Secondary CTA - Outlined, adapts to atmosphere */}
								<Button
									asChild
									size="lg"
									variant="outlined"
									color="default"
									className={cn(
										needsLightText
											? "border-surface-600 text-surface-100 hover:bg-surface-800/50"
											: "border-surface-400 text-surface-900 hover:bg-surface-100/50",
									)}
								>
									<Link href="/contact">Email</Link>
								</Button>
							</div>
						</Reveal>
					</div>
				</section>
			</Reveal>
		</>
	);
}

export function SiteHero() {
	return (
		<SwissGridSection id="hero" className="relative w-full overflow-hidden">
			{/* Sky Atmosphere — Time-reactive, provides context to children */}
			<AtmosphereCanvas className="pointer-events-none absolute inset-0 z-1">
				<HeroContent />
			</AtmosphereCanvas>
		</SwissGridSection>
	);
}
