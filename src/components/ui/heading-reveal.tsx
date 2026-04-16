"use client";

import { motion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";
import { useEffect, useState } from "react";
import { type RevealPhase, useRevealState } from "@/src/components/providers/reveal-provider";
import { distances, tweens } from "@/src/lib/index";
import { TextEffectWrapper } from "./text-effect-wrapper";

interface HeadingRevealProps {
	as?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
	children: ReactNode;
	className?: string;
	delay?: number;
	phase?: RevealPhase;
	style?: CSSProperties;
}

const DESKTOP_QUERY = "(min-width: 768px)";
const HEADING_STAGGER = 0.03;

export function HeadingReveal({
	as = "h2",
	children,
	className,
	delay = 0,
	phase = 1,
	style,
}: HeadingRevealProps) {
	const { environment, entryKey, phase: currentPhase } = useRevealState();
	const [isDesktop, setIsDesktop] = useState(false);

	useEffect(() => {
		if (typeof window === "undefined") return;

		const mediaQuery = window.matchMedia(DESKTOP_QUERY);
		const syncDesktop = () => {
			setIsDesktop(mediaQuery.matches);
		};

		syncDesktop();
		mediaQuery.addEventListener("change", syncDesktop);
		return () => mediaQuery.removeEventListener("change", syncDesktop);
	}, []);

	const isPhaseReached = currentPhase >= phase;
	const isAutomation = environment === "automation";
	const isReduced = environment === "reduced-motion";
	const isTextContent = typeof children === "string" || typeof children === "number";
	const MotionTag = motion[as] as typeof motion.div;
	const StaticTag = as;

	if (isAutomation) {
		return (
			<StaticTag className={className} style={style}>
				{children}
			</StaticTag>
		);
	}

	if (isReduced || !isDesktop || !isTextContent) {
		return (
			<MotionTag
				key={`heading-${entryKey}-${phase}-${delay}`}
				initial={{
					opacity: 0,
					y: isReduced ? 0 : distances.small,
				}}
				animate={
					isPhaseReached
						? { opacity: 1, y: 0 }
						: { opacity: 0, y: isReduced ? 0 : distances.small }
				}
				transition={{
					...(isReduced ? tweens.reduced : tweens.content),
					delay,
				}}
				className={className}
				style={style}
			>
				{children}
			</MotionTag>
		);
	}

	if (!isPhaseReached) {
		return (
			<StaticTag className={className} style={{ ...style, opacity: 0 }}>
				{children}
			</StaticTag>
		);
	}

	return (
		<TextEffectWrapper
			key={`heading-text-${entryKey}-${phase}-${delay}`}
			as={as}
			per="word"
			preset="fade-in-blur"
			delay={delay}
			className={className}
			style={style}
			segmentTransition={{
				type: "tween",
				...tweens.heading,
			}}
			variants={{
				container: {
					hidden: { opacity: 1 },
					visible: {
						opacity: 1,
						transition: {
							staggerChildren: HEADING_STAGGER,
						},
					},
					exit: {
						opacity: 1,
						transition: {
							staggerChildren: HEADING_STAGGER,
							staggerDirection: -1,
						},
					},
				},
			}}
		>
			{children}
		</TextEffectWrapper>
	);
}
