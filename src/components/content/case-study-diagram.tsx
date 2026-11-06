"use client";

import { Collapsible } from "@base-ui/react/collapsible";
import {
	RiArrowDownSLine,
	RiArrowLeftLine,
	RiArrowRightLine,
	RiArrowUpSLine,
	RiExpandDiagonalLine,
	RiFileTextLine,
	RiNodeTree,
} from "@remixicon/react";
import { type CSSProperties, type ReactNode, useId, useState } from "react";
import { Button } from "@/src/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/src/components/ui/dialog";
import { IconChamber } from "@/src/components/ui/icon-chamber";
import { StateSwap } from "@/src/components/ui/state-swap";
import styles from "./case-study-diagram.module.css";
import type { FigureTone } from "./figure-node";

export interface DiagramStep {
	id: string;
	tone?: FigureTone;
	label: string;
	icon: ReactNode;
	title: string;
	description: string;
}

export interface CaseStudyDiagramProps {
	title: string;
	description: string;
	/** Native drawing width plus its owned insets; smaller figures do not acquire empty side gutters. */
	maxWidth?: number;
	/** Large canvases put navigation before the drawing in both visual and focus order. */
	navigationPosition?: "above" | "below";
	/** Authored explanations, including an overview as the first step. */
	steps: readonly [DiagramStep, ...DiagramStep[]];
	/** Each figure owns its drawing and responsive composition, not a forced graph layout. */
	children: (step: DiagramStep) => ReactNode;
}

/** Reader-controlled explanation shell. No autoplay or external data. */
export function CaseStudyDiagram({
	title,
	description,
	steps,
	children,
	maxWidth = 864,
	navigationPosition = "below",
}: CaseStudyDiagramProps) {
	const headingId = useId();
	const [stepId, setStepId] = useState(steps[0].id);
	const [expanded, setExpanded] = useState(false);
	const step = steps.find((item) => item.id === stepId) ?? steps[0];
	const body = (announce: boolean) => (
		<DiagramBody
			steps={steps}
			step={step}
			onSelect={setStepId}
			announce={announce}
			drawing={children(step)}
			navigationPosition={navigationPosition}
		/>
	);

	return (
		<section
			className={styles.figure}
			style={{ maxWidth }}
			aria-labelledby={headingId}
			data-figure
		>
			<header className={styles.heading}>
				<IconChamber size="default" className={styles.headingIcon} aria-hidden="true">
					<RiNodeTree />
				</IconChamber>
				<div className={styles.intro}>
					<h2 id={headingId}>{title}</h2>
					<p>{description}</p>
				</div>
				<Dialog open={expanded} onOpenChange={setExpanded}>
					<DialogTrigger render={<Button variant="soft" color="secondary" size="icon" />}>
						<RiExpandDiagonalLine aria-hidden="true" />
						<span className="sr-only">Expand diagram</span>
					</DialogTrigger>
					<DialogContent className={styles.expanded}>
						<DialogHeader icon={<RiNodeTree />}>
							<DialogTitle>{title}</DialogTitle>
							<DialogDescription>
								Choose a step to follow the explanation.
							</DialogDescription>
						</DialogHeader>
						{body(expanded)}
					</DialogContent>
				</Dialog>
			</header>
			{body(!expanded)}
		</section>
	);
}

function DiagramBody({
	steps,
	step,
	onSelect,
	announce,
	drawing,
	navigationPosition,
}: {
	steps: CaseStudyDiagramProps["steps"];
	step: DiagramStep;
	onSelect: (id: string) => void;
	announce: boolean;
	drawing: ReactNode;
	navigationPosition: "above" | "below";
}) {
	const captionId = useId();
	const [transcriptOpen, setTranscriptOpen] = useState(false);
	const [keyboard, setKeyboard] = useState(false);
	const index = steps.findIndex((item) => item.id === step.id);
	const select = (id: string, detail: number) => {
		setKeyboard(detail === 0);
		onSelect(id);
	};
	const controls = (
		<fieldset className={styles.controls}>
			<legend className="sr-only">Diagram walkthrough</legend>
			<div
				className={styles.steps}
				data-figure-step-track
				data-tone={step.tone ?? "neutral"}
				style={
					{
						"--step-count": steps.length,
						"--step-index": index,
						"--step-column": index % 2,
						"--step-row": Math.floor(index / 2),
						"--step-span": steps.length % 2 === 1 && index === steps.length - 1 ? 2 : 1,
					} as CSSProperties
				}
			>
				<span className={styles.selection} data-figure-selection aria-hidden="true" />
				{steps.map((item) => (
					<button
						type="button"
						key={item.id}
						className={styles.step}
						data-tone={item.tone ?? "neutral"}
						aria-pressed={step.id === item.id}
						aria-controls={captionId}
						onClick={(event) => select(item.id, event.detail)}
					>
						<IconChamber className={styles.stepIcon} aria-hidden="true">
							{item.icon}
						</IconChamber>
						<span>{item.label}</span>
					</button>
				))}
			</div>
			<div className={styles.arrows}>
				<Button
					variant="soft"
					color="secondary"
					size="icon"
					aria-label="Previous step"
					disabled={index === 0}
					onClick={(event) => select(steps[index - 1].id, event.detail)}
				>
					<RiArrowLeftLine aria-hidden="true" />
				</Button>
				<Button
					variant="soft"
					color="secondary"
					size="icon"
					aria-label="Next step"
					disabled={index === steps.length - 1}
					onClick={(event) => select(steps[index + 1].id, event.detail)}
				>
					<RiArrowRightLine aria-hidden="true" />
				</Button>
			</div>
		</fieldset>
	);
	return (
		<div className={styles.body} data-motion-input={keyboard ? "keyboard" : "pointer"}>
			{navigationPosition === "above" && <div className={styles.navigation}>{controls}</div>}
			<div className={styles.drawing} data-figure-canvas>
				{drawing}
			</div>
			<div className={styles.reading} data-figure-reading>
				{navigationPosition === "below" && controls}
				<div className={styles.captions} id={captionId}>
					<IconChamber
						size="default"
						className={styles.captionIcon}
						data-tone={step.tone ?? "neutral"}
						aria-hidden="true"
					>
						<StateSwap
							value={step.id}
							items={Object.fromEntries(steps.map((item) => [item.id, item.icon]))}
						/>
					</IconChamber>
					<div className={styles.captionText}>
						{steps.map((item) => (
							<div
								className={styles.caption}
								key={item.id}
								data-active={step.id === item.id}
								aria-hidden={step.id !== item.id}
							>
								<h3>{item.title}</h3>
								<p>{item.description}</p>
							</div>
						))}
					</div>
				</div>
				<p className="sr-only" aria-live={announce ? "polite" : "off"} aria-atomic="true">
					{step.title} {step.description}
				</p>
			</div>
			<Collapsible.Root
				className={styles.transcript}
				open={transcriptOpen}
				onOpenChange={(open, details) => {
					setTranscriptOpen(open);
					setKeyboard(
						details.event.type.startsWith("key") ||
							(details.event.type === "click" &&
								"detail" in details.event &&
								details.event.detail === 0),
					);
				}}
			>
				<Collapsible.Trigger className={styles.disclosure}>
					<IconChamber
						size="default"
						className={styles.disclosureIcon}
						aria-hidden="true"
					>
						<RiFileTextLine />
					</IconChamber>
					<span>Full explanation</span>
					<IconChamber
						size="default"
						className={styles.disclosureIcon}
						aria-hidden="true"
					>
						<StateSwap
							value={transcriptOpen ? "open" : "closed"}
							items={{ closed: <RiArrowDownSLine />, open: <RiArrowUpSLine /> }}
						/>
					</IconChamber>
				</Collapsible.Trigger>
				<Collapsible.Panel className={styles.transcriptPanel}>
					<ol className={styles.transcriptList}>
						{steps.map((item, itemIndex) => (
							<li key={item.id}>
								<span className={styles.transcriptNumber} aria-hidden="true">
									{itemIndex + 1}
								</span>
								<div>
									<strong>{item.title}</strong>
									<p>{item.description}</p>
								</div>
							</li>
						))}
					</ol>
				</Collapsible.Panel>
			</Collapsible.Root>
		</div>
	);
}
