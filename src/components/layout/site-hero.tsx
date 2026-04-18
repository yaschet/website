"use client";

import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { useLayoutEffect, useRef, useState, type RefObject } from "react";
import { Button } from "@/components/ui/button";
import { HeadingReveal } from "@/components/ui/heading-reveal";
import {
	INSTRUMENT_DOT_RADIUS,
	INSTRUMENT_GRID_MIN_INSET,
	INSTRUMENT_GRID_ORIGIN,
	INSTRUMENT_GRID_STEP,
} from "@/components/ui/instrument-field-metrics";
import { Reveal } from "@/components/ui/reveal";
import {
	InstrumentField,
	type InstrumentFieldReadZone,
} from "@/components/ui/topographic-dot-field";
import { cn } from "@/lib/utils";

const HERO_COLUMN_MAX_WIDTH = "calc(var(--portfolio-grid-step) * 50)";
const HERO_BODY_MAX_WIDTH = "58ch";
const HERO_FIELD_SPEED = 0.32;

interface ZoneConfig {
	featherFactor: number;
	minFeather: number;
	padXFactor: number;
	padYFactor: number;
	strength: number;
}

function clamp01(value: number) {
	return Math.min(1, Math.max(0, value));
}

function zonesEqual(a: InstrumentFieldReadZone[], b: InstrumentFieldReadZone[]) {
	if (a.length !== b.length) return false;

	return a.every((zone, index) => {
		const other = b[index];
		if (!other) return false;

		return (
			Math.abs(zone.centerX - other.centerX) < 0.0005 &&
			Math.abs(zone.centerY - other.centerY) < 0.0005 &&
			Math.abs(zone.width - other.width) < 0.0005 &&
			Math.abs(zone.height - other.height) < 0.0005 &&
			Math.abs(zone.padX - other.padX) < 0.0005 &&
			Math.abs(zone.padY - other.padY) < 0.0005 &&
			Math.abs(zone.feather - other.feather) < 0.0005 &&
			Math.abs(zone.strength - other.strength) < 0.0005
		);
	});
}

function createReadZone(
	target: Element | null,
	containerRect: DOMRect,
	config: ZoneConfig,
): InstrumentFieldReadZone | null {
	if (!target || containerRect.width <= 0 || containerRect.height <= 0) {
		return null;
	}

	const rect = target.getBoundingClientRect();
	if (rect.width <= 0 || rect.height <= 0) {
		return null;
	}

	const width = rect.width / containerRect.width;
	const height = rect.height / containerRect.height;
	const centerX = ((rect.left - containerRect.left) + rect.width * 0.5) / containerRect.width;
	const centerY = ((rect.top - containerRect.top) + rect.height * 0.5) / containerRect.height;
	const minDimension = Math.min(containerRect.width, containerRect.height);

	return {
		centerX: clamp01(centerX),
		centerY: clamp01(centerY),
		width,
		height,
		padX: Math.max(width * config.padXFactor, 12 / containerRect.width),
		padY: Math.max(height * config.padYFactor, 10 / containerRect.height),
		feather: Math.max(Math.max(width, height) * config.featherFactor, config.minFeather / minDimension),
		strength: config.strength,
	};
}

function HeroContent({
	headingRef,
	bodyRef,
	caseStudiesRef,
	emailRef,
}: {
	headingRef: RefObject<HTMLDivElement | null>;
	bodyRef: RefObject<HTMLParagraphElement | null>;
	caseStudiesRef: RefObject<HTMLSpanElement | null>;
	emailRef: RefObject<HTMLSpanElement | null>;
}) {
	return (
		<div className="portfolio-box-pad relative z-10">
			<div className="portfolio-stack-related w-full" style={{ maxWidth: HERO_COLUMN_MAX_WIDTH }}>
				<div className="portfolio-stack-related">
					<div ref={headingRef} className="w-fit max-w-full">
						<HeadingReveal
							as="h1"
							phase={1}
							className="portfolio-heading-xl portfolio-capsize-heading-xl w-fit max-w-full text-surface-800 dark:text-surface-100"
							style={{ margin: 0 }}
						>
							Complex systems, clean interfaces.
						</HeadingReveal>
					</div>
					<Reveal phase={2} delay={0.05}>
						<p
							ref={bodyRef}
							className="portfolio-body-lg text-surface-700 dark:text-surface-300"
							style={{ maxWidth: HERO_BODY_MAX_WIDTH, margin: 0 }}
						>
							I build CRMs, billing systems, document workflows, and{" "}
							<span className="whitespace-nowrap">AI pipelines</span> that replace manual
							work. Internal tools and SaaS for small businesses, made to feel simple to
							use.
						</p>
					</Reveal>
				</div>
				<Reveal phase={2} delay={0.1}>
					<div className="portfolio-control-row pointer-events-auto">
						<span ref={caseStudiesRef} className="inline-flex">
							<Button
								asChild
								size="md"
								variant="soft"
								color="default"
								className="bg-surface-900 text-surface-50 hover:bg-surface-800 focus-visible:bg-surface-800 dark:bg-surface-100 dark:text-surface-950 dark:hover:bg-surface-200 dark:focus-visible:bg-surface-200"
							>
								<Link href="/case-studies">
									Case Studies
									<ArrowRightIcon className="size-4" weight="bold" />
								</Link>
							</Button>
						</span>
						<span ref={emailRef} className="inline-flex">
							<Button
								asChild
								size="md"
								variant="soft"
								color="default"
								className="bg-surface-100 text-surface-800 hover:bg-surface-200 focus-visible:bg-surface-200 dark:bg-surface-800 dark:text-surface-200 dark:hover:bg-surface-700 dark:focus-visible:bg-surface-700"
							>
								<Link href="/contact">Email</Link>
							</Button>
						</span>
					</div>
				</Reveal>
			</div>
		</div>
	);
}

function HeroInstrumentPlane({
	className,
	readZones,
}: {
	className?: string;
	readZones: InstrumentFieldReadZone[];
}) {
	return (
		<div className={cn("absolute inset-0", className)} aria-hidden="true">
			<div
				className="pointer-events-none absolute inset-0"
				style={{ backgroundColor: "var(--instrument-field-bg-auto)" }}
			/>
			<InstrumentField
				interactive
				step={INSTRUMENT_GRID_STEP}
				minInset={INSTRUMENT_GRID_MIN_INSET}
				readZones={readZones}
				origin={INSTRUMENT_GRID_ORIGIN}
				radius={INSTRUMENT_DOT_RADIUS}
				speed={HERO_FIELD_SPEED}
				surface="hero"
				variant="terrain"
			/>
		</div>
	);
}

export function SiteHero() {
	const sectionRef = useRef<HTMLElement>(null);
	const headingRef = useRef<HTMLDivElement>(null);
	const bodyRef = useRef<HTMLParagraphElement>(null);
	const caseStudiesRef = useRef<HTMLSpanElement>(null);
	const emailRef = useRef<HTMLSpanElement>(null);
	const [readZones, setReadZones] = useState<InstrumentFieldReadZone[]>([]);

	useLayoutEffect(() => {
		if (typeof window === "undefined") return;

		const section = sectionRef.current;
		if (!section) return;

		let frameId = 0;
		const queueMeasure = () => {
			if (frameId) {
				cancelAnimationFrame(frameId);
			}

			frameId = requestAnimationFrame(() => {
				frameId = 0;
				const containerRect = section.getBoundingClientRect();
				if (containerRect.width <= 0 || containerRect.height <= 0) {
					return;
				}

				const nextZones = [
					createReadZone(headingRef.current, containerRect, {
						padXFactor: 0.045,
						padYFactor: 0.12,
						featherFactor: 0.12,
						minFeather: 10,
						strength: 0.98,
					}),
					createReadZone(bodyRef.current, containerRect, {
						padXFactor: 0.040,
						padYFactor: 0.14,
						featherFactor: 0.12,
						minFeather: 10,
						strength: 0.95,
					}),
					createReadZone(caseStudiesRef.current, containerRect, {
						padXFactor: 0.08,
						padYFactor: 0.14,
						featherFactor: 0.10,
						minFeather: 9,
						strength: 0.92,
					}),
					createReadZone(emailRef.current, containerRect, {
						padXFactor: 0.08,
						padYFactor: 0.14,
						featherFactor: 0.10,
						minFeather: 9,
						strength: 0.90,
					}),
				].filter((zone): zone is InstrumentFieldReadZone => zone !== null);

				setReadZones((current) => (zonesEqual(current, nextZones) ? current : nextZones));
			});
		};

		const resizeObserver = new ResizeObserver(queueMeasure);
		resizeObserver.observe(section);
		if (headingRef.current) resizeObserver.observe(headingRef.current);
		if (bodyRef.current) resizeObserver.observe(bodyRef.current);
		if (caseStudiesRef.current) resizeObserver.observe(caseStudiesRef.current);
		if (emailRef.current) resizeObserver.observe(emailRef.current);
		queueMeasure();
		window.addEventListener("resize", queueMeasure, { passive: true });

		return () => {
			if (frameId) {
				cancelAnimationFrame(frameId);
			}
			resizeObserver.disconnect();
			window.removeEventListener("resize", queueMeasure);
		};
	}, []);

	return (
		<section ref={sectionRef} id="hero" className="relative isolate w-full overflow-hidden">
			<HeroInstrumentPlane className="opacity-100 dark:opacity-100" readZones={readZones} />
			<HeroContent
				headingRef={headingRef}
				bodyRef={bodyRef}
				caseStudiesRef={caseStudiesRef}
				emailRef={emailRef}
			/>
		</section>
	);
}
