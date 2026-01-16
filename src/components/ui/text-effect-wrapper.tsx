"use client";

import {
	AnimatePresence,
	motion,
	type TargetAndTransition,
	type Transition,
	type Variant,
	type Variants,
} from "motion/react";
import React from "react";

import { cn } from "@/src/lib/utils";

export type PresetType = "blur" | "fade-in-blur" | "scale" | "fade" | "slide";

export type PerType = "word" | "char" | "line";

export type TextEffectProps = {
	children: React.ReactNode;
	per?: PerType;
	as?: keyof React.JSX.IntrinsicElements;
	variants?: {
		container?: Variants;
		item?: Variants;
	};
	className?: string;
	preset?: PresetType;
	delay?: number;
	speedReveal?: number;
	speedSegment?: number;
	trigger?: boolean;
	onAnimationComplete?: () => void;
	onAnimationStart?: () => void;
	segmentWrapperClassName?: string;
	containerTransition?: Transition;
	segmentTransition?: Transition;
	style?: React.CSSProperties;
};

const defaultStaggerTimes: Record<PerType, number> = {
	char: 0.03,
	word: 0.05,
	line: 0.1,
};

const rtlStaggerTimes: Record<PerType, number> = {
	char: 0.08, // Slower for word-level animation
	word: 0.05,
	line: 0.1,
};

const defaultContainerVariants: Variants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.05,
		},
	},
	exit: {
		transition: { staggerChildren: 0.05, staggerDirection: -1 },
	},
};

const defaultItemVariants: Variants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
	},
	exit: { opacity: 0 },
};

const presetVariants: Record<PresetType, { container: Variants; item: Variants }> = {
	blur: {
		container: defaultContainerVariants,
		item: {
			hidden: { opacity: 0, filter: "blur(12px)" },
			visible: { opacity: 1, filter: "blur(0px)" },
			exit: { opacity: 0, filter: "blur(12px)" },
		},
	},
	"fade-in-blur": {
		container: defaultContainerVariants,
		item: {
			hidden: { opacity: 0, y: 20, filter: "blur(12px)" },
			visible: { opacity: 1, y: 0, filter: "blur(0px)" },
			exit: { opacity: 0, y: 20, filter: "blur(12px)" },
		},
	},
	scale: {
		container: defaultContainerVariants,
		item: {
			hidden: { opacity: 0, scale: 0 },
			visible: { opacity: 1, scale: 1 },
			exit: { opacity: 0, scale: 0 },
		},
	},
	fade: {
		container: defaultContainerVariants,
		item: {
			hidden: { opacity: 0 },
			visible: { opacity: 1 },
			exit: { opacity: 0 },
		},
	},
	slide: {
		container: defaultContainerVariants,
		item: {
			hidden: { opacity: 0, y: 20 },
			visible: { opacity: 1, y: 0 },
			exit: { opacity: 0, y: 20 },
		},
	},
};

const AnimationComponent: React.FC<{
	segment: string;
	variants: Variants;
	per: "line" | "word" | "char";
	segmentWrapperClassName?: string;
	nextSegment?: string; // Added to check following segment
	isInRTLContext?: boolean; // Added to know overall context
}> = React.memo(
	({ segment, variants, per, segmentWrapperClassName, nextSegment, isInRTLContext }) => {
		const isRTLChar = (s: string) =>
			/[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF]/.test(
				s,
			);

		const trailingPunctuationRegex = /[.,;:!?؟،؛"'“”«»()\[\]{}]+$/u;
		const punctuationOnlyRegex = /^[.,;:!?؟،؛"'“”«»()\[\]{}]+$/u;

		const isLatinText = (s: string) => {
			const cleaned = s.replace(trailingPunctuationRegex, "").trim();
			if (!cleaned) return false;
			const hasLatinCharacters = /[A-Za-z\u00C0-\u024F]/.test(cleaned);
			return hasLatinCharacters && !isRTLChar(cleaned);
		};
		const isPunctuation = (s: string) => punctuationOnlyRegex.test(s.trim());
		const endsWithPunctuation = (s: string) => trailingPunctuationRegex.test(s);
		const LRM = "\u200E"; // Left-to-Right Mark
		const RLM = "\u200F"; // Right-to-Left Mark (for completeness)
		const LRI = "\u2066"; // Introduce isolate for LTR runs inside RTL context
		const PDI = "\u2069"; // Pop directional isolate

		const segmentGraphemes = (s: string): string[] => {
			try {
				// Use browser grapheme segmentation when available
				if (typeof Intl !== "undefined" && typeof Intl.Segmenter !== "undefined") {
					const seg = new Intl.Segmenter(undefined, {
						granularity: "grapheme",
					});
					return Array.from(seg.segment(s), (it: any) => it.segment as string);
				}
			} catch {
				// Ignore and fall back
			}
			return Array.from(s);
		};

		const content =
			per === "line" ? (
				<motion.span variants={variants} className="block">
					{segment}
				</motion.span>
			) : per === "word" ? (
				(() => {
					const isRTLWord = isRTLChar(segment);
					const isLatin = isLatinText(segment);

					// Handle Latin words in RTL context
					let displayText = segment;
					if (isInRTLContext && isLatin) {
						// If the word ends with punctuation, add LRM after it
						if (endsWithPunctuation(segment)) {
							displayText = segment + LRM;
						}
						// If next segment is punctuation, add LRM to keep it attached
						else if (nextSegment && isPunctuation(nextSegment)) {
							displayText = segment + LRM;
						}

						displayText = `${LRI}${displayText}${PDI}`;
					}

					return (
						<motion.span
							aria-hidden="true"
							variants={variants}
							className="inline-block whitespace-pre"
							dir={isRTLWord ? "rtl" : "ltr"}
							style={{ unicodeBidi: "isolate" }}
						>
							{displayText}
						</motion.span>
					);
				})()
			) : (
				<motion.span
					className="inline-block whitespace-pre"
					style={{ unicodeBidi: "isolate" }}
				>
					{(() => {
						// If segment contains RTL, animate as a whole to preserve ligatures/joins
						if (isRTLChar(segment)) {
							return (
								<motion.span
									aria-hidden="true"
									variants={variants}
									className="inline-block whitespace-pre"
									dir="rtl"
									style={{ unicodeBidi: "isolate" }}
								>
									{segment}
								</motion.span>
							);
						}
						// Otherwise animate per grapheme (safe for emoji & accents)
						const parts = segmentGraphemes(segment);

						// Check if this Latin word needs LRM for punctuation handling
						const isLatin = isLatinText(segment);
						let shouldAddLRM = false;
						if (isInRTLContext && isLatin) {
							// Add LRM if the segment ends with punctuation OR if followed by punctuation
							if (
								endsWithPunctuation(segment) ||
								(nextSegment && isPunctuation(nextSegment))
							) {
								shouldAddLRM = true;
							}
						}

						const leadingIsolate = isInRTLContext && isLatin ? LRI : "";
						const trailingIsolate = isInRTLContext && isLatin ? PDI : "";

						// Wrap LTR graphemes in an inline-flex ltr container to preserve ordering in RTL parents
						return (
							<span
								dir="ltr"
								style={{ unicodeBidi: "isolate", display: "inline-flex" }}
							>
								{leadingIsolate || null}
								{parts.map((g, i) => {
									const isLastChar = i === parts.length - 1;
									const displayChar = isLastChar && shouldAddLRM ? g + LRM : g;

									if (/^\s+$/.test(g)) {
										return (
											<span
												key={`ws-${i}`}
												aria-hidden="true"
												className="whitespace-pre"
											>
												{displayChar}
											</span>
										);
									}
									return (
										<motion.span
											// biome-ignore lint/suspicious/noArrayIndexKey: index used for stable sequence
											key={`g-${i}`}
											aria-hidden="true"
											variants={variants}
											className="inline-block whitespace-pre"
											style={{ unicodeBidi: "isolate" }}
										>
											{displayChar}
										</motion.span>
									);
								})}
								{trailingIsolate || null}
							</span>
						);
					})()}
				</motion.span>
			);

		if (!segmentWrapperClassName) {
			return content;
		}

		const defaultWrapperClassName = per === "line" ? "block" : "inline-block";

		return (
			<span className={cn(defaultWrapperClassName, segmentWrapperClassName)}>{content}</span>
		);
	},
);

AnimationComponent.displayName = "AnimationComponent";

const splitText = (text: string, per: "line" | "word" | "char") => {
	if (per === "line") return text.split("\n");
	if (per === "char") {
		// For Arabic/RTL text, split by words to preserve character joining
		return text.split(/(\s+)/);
	}
	return text.split(/(\s+)/);
};

const hasTransition = (
	variant: Variant,
): variant is TargetAndTransition & { transition?: Transition } => {
	return typeof variant === "object" && variant !== null && "transition" in variant;
};

const createVariantsWithTransition = (
	baseVariants: Variants,
	transition?: Transition & { exit?: Transition },
): Variants => {
	if (!transition) return baseVariants;

	const { exit: _, ...mainTransition } = transition;

	return {
		...baseVariants,
		visible: {
			...baseVariants.visible,
			transition: {
				...(hasTransition(baseVariants.visible) ? baseVariants.visible.transition : {}),
				...mainTransition,
			},
		},
		exit: {
			...baseVariants.exit,
			transition: {
				...(hasTransition(baseVariants.exit) ? baseVariants.exit.transition : {}),
				...mainTransition,
				staggerDirection: -1,
			},
		},
	};
};

export function TextEffectWrapper({
	children,
	per = "word",
	as = "p",
	variants,
	className,
	preset = "fade",
	delay = 0,
	speedReveal = 1,
	speedSegment = 1,
	trigger = true,
	onAnimationComplete,
	onAnimationStart,
	segmentWrapperClassName,
	containerTransition,
	segmentTransition,
	style,
}: TextEffectProps) {
	const segments = splitText(String(children), per);
	const MotionTag = motion[as as keyof typeof motion] as typeof motion.div;

	const baseVariants = preset
		? presetVariants[preset]
		: { container: defaultContainerVariants, item: defaultItemVariants };

	const isRTL =
		/[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF]/.test(
			String(children),
		);
	const stagger = (isRTL ? rtlStaggerTimes[per] : defaultStaggerTimes[per]) / speedReveal;

	const baseDuration = 0.3 / speedSegment;

	const customStagger = hasTransition(variants?.container?.visible ?? {})
		? (variants?.container?.visible as TargetAndTransition).transition?.staggerChildren
		: undefined;

	const customDelay = hasTransition(variants?.container?.visible ?? {})
		? (variants?.container?.visible as TargetAndTransition).transition?.delayChildren
		: undefined;

	const computedVariants = {
		container: createVariantsWithTransition(variants?.container || baseVariants.container, {
			staggerChildren: customStagger ?? stagger,
			delayChildren: customDelay ?? delay,
			...containerTransition,
			exit: {
				staggerChildren: customStagger ?? stagger,
				staggerDirection: -1,
			},
		}),
		item: createVariantsWithTransition(variants?.item || baseVariants.item, {
			duration: baseDuration,
			...segmentTransition,
		}),
	};

	// If not triggered, show the text without animation
	if (!trigger) {
		const Tag = as as React.ElementType<{
			className?: string;
			style?: React.CSSProperties;
			children: React.ReactNode;
		}>;
		return (
			<Tag className={className} style={style}>
				{children}
			</Tag>
		);
	}

	return (
		<AnimatePresence mode="popLayout">
			<MotionTag
				key="text-effect"
				initial="hidden"
				animate="visible"
				exit="exit"
				variants={computedVariants.container}
				className={className}
				onAnimationComplete={onAnimationComplete}
				onAnimationStart={onAnimationStart}
				style={style}
			>
				{per !== "line" ? <span className="sr-only">{children}</span> : null}
				{segments.map((segment, index) => (
					<AnimationComponent
						key={`${per}-${index}-${segment}`}
						segment={segment}
						variants={computedVariants.item}
						per={per}
						segmentWrapperClassName={segmentWrapperClassName}
						nextSegment={segments[index + 1]}
						isInRTLContext={isRTL}
					/>
				))}
			</MotionTag>
		</AnimatePresence>
	);
}
