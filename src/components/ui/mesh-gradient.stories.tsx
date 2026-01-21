import { Avatar, AvatarFallback } from "@components/ui/avatar";
import {
	ArrowRightIcon,
	GithubLogoIcon,
	LinkedinLogoIcon,
	XLogoIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import avatarImage from "@/public/images/avatar.jpeg";
import { SiteFooter } from "@/src/components/layout/site-footer";
import { SiteHeader } from "@/src/components/layout/site-header";
import { Button } from "@/src/components/ui/button";
import { MeshGradient, useMeshGradient } from "@/src/components/ui/mesh-gradient";
import { Reveal, ScrollReveal } from "@/src/components/ui/reveal";
import { SwissGridProvider, SwissGridSection } from "@/src/components/ui/swiss-grid-canvas";

/**
 * Mesh Gradient — Canvas-Based Hero Background
 *
 * Pixel-perfect mesh gradient using canvas rendering.
 * Shares SwissGrid's coordinate system for sub-pixel alignment.
 * Edge fade to transparent prevents grid clipping.
 */
const meta: Meta<typeof MeshGradient> = {
	title: "UI/MeshGradient",
	component: MeshGradient,
	parameters: {
		layout: "fullscreen",
		backgrounds: { disable: true },
	},
};

/**
 * Hero content that adapts to the mesh gradient.
 */
function HeroContent() {
	const gradient = useMeshGradient();
	const needsLightText = gradient?.needsLightText ?? false;

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
					<div className="mx-auto max-w-3xl px-6 pt-16 pb-24 sm:px-8">
						<Reveal phase={2}>
							<h1 className={cn("mb-6 text-heading-xl", textPrimary)}>
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

const HeroSectionPreview = () => (
	<SwissGridProvider>
		<div className="flex flex-1 flex-col text-surface-900 selection:bg-surface-900 selection:text-surface-50 dark:text-surface-50 dark:selection:bg-surface-100 dark:selection:text-surface-900">
			<main className="relative z-10 flex flex-1 flex-col" style={{ overflowAnchor: "none" }}>
				{/* Nav Row */}
				<SiteHeader />

				{/* Hero — Unified section (profile + headline) */}
				<SwissGridSection id="hero" className="relative w-full overflow-hidden">
					{/* Mesh Gradient — Theme-reactive ambient background */}
					<MeshGradient className="pointer-events-none absolute inset-0 z-1">
						<HeroContent />
					</MeshGradient>
				</SwissGridSection>

				{/* CTA */}
				<SwissGridSection id="cta" className="w-full">
					<ScrollReveal phase={3} className="w-full">
						<section className="w-full">
							<div className="mx-auto max-w-3xl px-6 py-16 sm:px-8">
								<div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
									<div>
										<h2 className="text-heading-lg text-surface-900 dark:text-surface-100">
											View selected work.
										</h2>
									</div>
									<div className="flex items-center gap-3">
										<Button
											asChild
											size="lg"
											variant="outlined"
											color="default"
										>
											<Link href="/contact">Email</Link>
										</Button>
										<Button asChild size="lg" variant="solid" color="primary">
											<Link href="/projects">
												Case Studies
												<ArrowRightIcon className="size-4" weight="bold" />
											</Link>
										</Button>
									</div>
								</div>
							</div>
						</section>
					</ScrollReveal>
				</SwissGridSection>
			</main>
			<SiteFooter />
			<SwissGridSection id="nav-spacer" className="h-29.5 w-full" />
		</div>
	</SwissGridProvider>
);

export default meta;

type Story = StoryObj<typeof MeshGradient>;

/**
 * Default view - Mesh gradient in hero section.
 * Toggle dark mode to see theme-reactive color adaptation.
 */
export const Default: Story = {
	args: {},
	render: () => <HeroSectionPreview />,
};
