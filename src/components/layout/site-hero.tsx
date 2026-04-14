"use client";

import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/src/components/ui/button";
import { Reveal } from "@/src/components/ui/reveal";

const signalMask = [
	"radial-gradient(44rem 28rem at -8% 12%, rgba(0, 0, 0, 0.98) 0 34%, transparent 57%)",
	"radial-gradient(30rem 22rem at 18% 88%, rgba(0, 0, 0, 0.98) 0 26%, transparent 48%)",
	"radial-gradient(20rem 58rem at 50% 18%, rgba(0, 0, 0, 0.96) 0 14%, transparent 26%)",
	"radial-gradient(18rem 56rem at 67% 50%, rgba(0, 0, 0, 0.96) 0 11%, transparent 23%)",
	"radial-gradient(18rem 48rem at 86% 84%, rgba(0, 0, 0, 0.96) 0 12%, transparent 23%)",
	"radial-gradient(26rem 18rem at 96% 12%, rgba(0, 0, 0, 0.98) 0 24%, transparent 43%)",
	"radial-gradient(24rem 18rem at 105% 54%, rgba(0, 0, 0, 0.98) 0 22%, transparent 40%)",
	"radial-gradient(18rem 14rem at 76% 78%, rgba(0, 0, 0, 0.9) 0 18%, transparent 34%)",
].join(", ");

const maskStyle: CSSProperties = {
	WebkitMaskImage: signalMask,
	maskImage: signalMask,
	WebkitMaskRepeat: "no-repeat",
	maskRepeat: "no-repeat",
	WebkitMaskSize: "100% 100%",
	maskSize: "100% 100%",
};

const darkBaseDots: CSSProperties = {
	backgroundImage: "radial-gradient(circle, rgba(96, 122, 117, 0.16) 1.05px, transparent 1.35px)",
	backgroundSize: "18px 18px",
	backgroundPosition: "center center",
};

const darkSignalFill: CSSProperties = {
	backgroundImage: [
		"radial-gradient(42rem 26rem at -8% 10%, rgba(40, 235, 219, 0.14), transparent 62%)",
		"radial-gradient(18rem 54rem at 50% 18%, rgba(34, 160, 148, 0.16), transparent 58%)",
		"radial-gradient(24rem 18rem at 96% 12%, rgba(40, 235, 219, 0.13), transparent 58%)",
		"radial-gradient(18rem 48rem at 86% 82%, rgba(34, 160, 148, 0.13), transparent 56%)",
	].join(", "),
};

const darkSignalDots: CSSProperties = {
	backgroundImage: "radial-gradient(circle, rgba(52, 255, 238, 0.92) 1.25px, transparent 1.55px)",
	backgroundSize: "18px 18px",
	backgroundPosition: "center center",
};

const lightBaseDots: CSSProperties = {
	backgroundImage: "radial-gradient(circle, rgba(18, 43, 38, 0.18) 1.05px, transparent 1.35px)",
	backgroundSize: "18px 18px",
	backgroundPosition: "center center",
};

const lightSignalFill: CSSProperties = {
	backgroundImage: [
		"radial-gradient(44rem 28rem at -8% 12%, rgba(134, 208, 195, 0.52), transparent 58%)",
		"radial-gradient(18rem 56rem at 50% 18%, rgba(84, 150, 139, 0.34), transparent 54%)",
		"radial-gradient(26rem 18rem at 96% 12%, rgba(134, 208, 195, 0.42), transparent 54%)",
		"radial-gradient(18rem 48rem at 86% 82%, rgba(84, 150, 139, 0.28), transparent 52%)",
	].join(", "),
};

const lightSignalDots: CSSProperties = {
	backgroundImage: "radial-gradient(circle, rgba(14, 87, 77, 0.78) 1.25px, transparent 1.55px)",
	backgroundSize: "18px 18px",
	backgroundPosition: "center center",
};

function HeroContent() {
	return (
		<div className="relative z-10 p-6 sm:p-8">
			<Reveal phase={2}>
				<h2 className={cn("mb-6 text-heading-xl! text-surface-900 dark:text-surface-100")}>
					I build products for the web.
				</h2>
			</Reveal>
			<Reveal phase={2} delay={0.05}>
				<p
					className={cn(
						"mb-8 max-w-xl text-body-lg text-surface-900 dark:text-surface-100",
					)}
				>
					Web apps. SaaS platforms. Internal tools. From the first idea to the final
					deploy. Complex systems that feel effortless.
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
					<Button asChild size="lg" variant="outlined" color="default">
						<Link href="/contact">Email</Link>
					</Button>
				</div>
			</Reveal>
		</div>
	);
}

function HeroDataPlane() {
	return (
		<div className="pointer-events-none absolute inset-0" aria-hidden="true">
			<div className="absolute inset-0 bg-white dark:bg-surface-900" />
			<div className="absolute inset-0 dark:hidden" style={lightBaseDots} />
			<div className="absolute inset-0 hidden dark:block" style={darkBaseDots} />

			<div
				className="absolute inset-0 animate-data-plane-drift-a dark:hidden"
				style={{ ...maskStyle, ...lightSignalFill }}
			/>
			<div
				className="absolute inset-0 hidden animate-data-plane-drift-a dark:block"
				style={{ ...maskStyle, ...darkSignalFill }}
			/>

			<div
				className="absolute inset-0 animate-data-plane-drift-b opacity-100 dark:hidden"
				style={{ ...maskStyle, ...lightSignalDots }}
			/>
			<div
				className="absolute inset-0 hidden animate-data-plane-drift-b opacity-100 dark:block"
				style={{ ...maskStyle, ...darkSignalDots }}
			/>
			<div className="absolute inset-y-0 left-0 w-[48%] bg-linear-to-r from-white via-white/94 to-transparent dark:from-surface-900 dark:via-surface-900/88 dark:to-transparent" />
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_74%_46%,transparent_0%,transparent_62%,rgba(255,255,255,0.22)_100%)] dark:bg-[radial-gradient(circle_at_74%_46%,transparent_0%,transparent_62%,rgba(0,0,0,0.28)_100%)]" />
		</div>
	);
}

export function SiteHero() {
	return (
		<section id="hero" className="relative isolate w-full overflow-hidden">
			{/* <HeroDataPlane /> */}
			<HeroContent />
		</section>
	);
}
