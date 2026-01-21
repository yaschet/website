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
import avatarImage from "@/public/images/avatar.jpeg";
import { SiteHeader } from "@/src/components/layout/site-header";
import { Button } from "@/src/components/ui/button";
import { Reveal } from "@/src/components/ui/reveal";
import { SwissGridProvider, SwissGridSection } from "@/src/components/ui/swiss-grid-canvas";
import { AtmosphereCanvas } from "./atmosphere-canvas";

/**
 * Atmosphere Canvas — Integrated Hero Section
 *
 * Renders the same hero section as the homepage with SwissGrid integration.
 */
const meta: Meta<typeof AtmosphereCanvas> = {
	title: "UI/AtmosphereCanvas",
	component: AtmosphereCanvas,
	parameters: {
		layout: "fullscreen",
		backgrounds: { disable: true },
	},
	argTypes: {
		debugHour: {
			control: { type: "range", min: 0, max: 24, step: 0.5 },
			description: "Override hour for testing (0-24)",
		},
	},
};

const HeroSectionPreview = ({ debugHour }: { debugHour?: number }) => (
	<SwissGridProvider>
		<div className="flex min-h-[640px] flex-1 flex-col text-surface-900 selection:bg-surface-900 selection:text-surface-50 dark:text-surface-50 dark:selection:bg-surface-100 dark:selection:text-surface-900">
			<main className="relative z-10 flex flex-1 flex-col" style={{ overflowAnchor: "none" }}>
				<SiteHeader />
				<SwissGridSection id="hero" className="relative w-full">
					<AtmosphereCanvas
						className="pointer-events-none absolute inset-0 -z-10"
						debugHour={debugHour}
					/>

					<Reveal phase={1} className="relative z-10 w-full">
						<header className="w-full">
							<div className="mx-auto flex h-full max-w-3xl items-center justify-between px-6 py-12 sm:px-8">
								<div className="flex items-center gap-4">
									<Avatar className="relative size-14 overflow-hidden rounded-(--radius) border border-surface-200 bg-surface-100 dark:border-surface-800 dark:bg-surface-900">
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

								<div className="flex items-center gap-0.5">
									<Link
										href="https://linkedin.com/in/yaschet"
										target="_blank"
										aria-label="LinkedIn"
										className="inline-flex size-10 items-center justify-center text-surface-500 transition-colors hover:text-accent-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface-400 focus-visible:ring-offset-2 dark:text-surface-400 dark:hover:text-accent-400"
									>
										<LinkedinLogoIcon className="size-5" weight="regular" />
									</Link>
									<Link
										href="https://github.com/yaschet"
										target="_blank"
										aria-label="GitHub"
										className="inline-flex size-10 items-center justify-center text-surface-500 transition-colors hover:text-accent-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface-400 focus-visible:ring-offset-2 dark:text-surface-400 dark:hover:text-accent-400"
									>
										<GithubLogoIcon className="size-5" weight="regular" />
									</Link>
									<Link
										href="https://x.com/yaschet"
										target="_blank"
										aria-label="X"
										className="inline-flex size-10 items-center justify-center text-surface-500 transition-colors hover:text-accent-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface-400 focus-visible:ring-offset-2 dark:text-surface-400 dark:hover:text-accent-400"
									>
										<XLogoIcon className="size-5" weight="regular" />
									</Link>
								</div>
							</div>
						</header>
					</Reveal>

					<Reveal phase={2} className="relative z-10 w-full">
						<section className="w-full">
							<div className="mx-auto max-w-3xl px-6 py-16 sm:px-8">
								<Reveal phase={2}>
									<h1 className="mb-6 text-heading-xl text-surface-900 dark:text-surface-100">
										I build products for the web.
									</h1>
								</Reveal>
								<Reveal phase={2} delay={0.05}>
									<p className="mb-8 max-w-xl text-body-lg text-surface-600 dark:text-surface-400">
										Web apps. SaaS platforms. Internal tools. From the first
										idea to the final deploy. Complex systems that feel
										effortless.
									</p>
								</Reveal>
								<Reveal phase={2} delay={0.1}>
									<div className="flex flex-wrap items-center gap-3">
										<Button asChild size="lg" variant="solid" color="primary">
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
										>
											<Link href="/contact">Email</Link>
										</Button>
									</div>
								</Reveal>
							</div>
						</section>
					</Reveal>
				</SwissGridSection>
			</main>
		</div>
	</SwissGridProvider>
);

export default meta;

type Story = StoryObj<typeof AtmosphereCanvas>;

/**
 * Default view - uses current system time
 */
export const Default: Story = {
	args: {},
	render: (args) => <HeroSectionPreview debugHour={args.debugHour} />,
};

/**
 * Fajr / Blue Hour (5:30 AM)
 * Low-angle morning palette
 */
export const Fajr: Story = {
	args: {
		debugHour: 5.5,
	},
	render: (args) => <HeroSectionPreview debugHour={args.debugHour} />,
};

/**
 * Dawn (7:00 AM)
 * Warm morning palette
 */
export const Dawn: Story = {
	args: {
		debugHour: 7,
	},
	render: (args) => <HeroSectionPreview debugHour={args.debugHour} />,
};

/**
 * Day (12:00 PM)
 * Midday palette
 */
export const Day: Story = {
	args: {
		debugHour: 12,
	},
	render: (args) => <HeroSectionPreview debugHour={args.debugHour} />,
};

/**
 * Dusk (18:00 / 6:00 PM)
 * Evening palette
 */
export const Dusk: Story = {
	args: {
		debugHour: 18,
	},
	render: (args) => <HeroSectionPreview debugHour={args.debugHour} />,
};

/**
 * Night (20:00 / 8:00 PM)
 * Night palette
 */
export const Night: Story = {
	args: {
		debugHour: 20,
	},
	render: (args) => <HeroSectionPreview debugHour={args.debugHour} />,
};

/**
 * Interactive - Use the slider to test any time
 */
export const Interactive: Story = {
	args: {
		debugHour: 6,
	},
	render: (args) => <HeroSectionPreview debugHour={args.debugHour} />,
};
