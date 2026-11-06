"use client";

import {
	RiArrowGoBackLine,
	RiDatabase2Line,
	RiEditLine,
	RiFileTextLine,
	RiNodeTree,
	RiRssLine,
	RiScanLine,
	RiSearchLine,
	RiShareForwardLine,
	RiShieldCheckLine,
} from "@remixicon/react";
import type { CaseStudyDiagramProps, DiagramStep } from "./case-study-diagram";
import { reconstructionEvidence } from "./case-study-diagram.data";
import { Drawing, Node, Route } from "./diagram-drawing";
import styles from "./figure-drawing.module.css";

const reconstructionSteps = [
	{
		id: "overview",
		label: "Map",
		icon: <RiNodeTree />,
		title: "A check separates the draft from the record.",
		description:
			"Follow the scanned source through reconstruction, review and compilation. The return arrow shows where a failed check goes.",
	},
	{
		id: "build",
		tone: "info",
		label: "Build",
		icon: <RiEditLine />,
		title: "Reconstruct the page, not just its words.",
		description: reconstructionEvidence.builder.detail,
	},
	{
		id: "retry",
		tone: "warning",
		label: "Return",
		icon: <RiArrowGoBackLine />,
		title: "A failed check returns to the builder.",
		description: reconstructionEvidence.auditor.detail,
	},
	{
		id: "write",
		tone: "success",
		label: "Write",
		icon: <RiFileTextLine />,
		title: "Only a passing structure reaches compilation.",
		description: reconstructionEvidence.compiler.detail,
	},
] satisfies readonly [DiagramStep, ...DiagramStep[]];

const publishingSteps = [
	{
		id: "overview",
		label: "Map",
		icon: <RiNodeTree />,
		title: "Several outputs can share one source.",
		description:
			"This illustrative pattern connects an authored record to an article, search index and feed. It demonstrates a different diagram shape, not a claim about a client project.",
	},
	{
		id: "source",
		tone: "info",
		label: "Source",
		icon: <RiDatabase2Line />,
		title: "Author the information once.",
		description:
			"The saved record owns the title, body and summary. Each output reads the fields it needs instead of maintaining another authored copy.",
	},
	{
		id: "outputs",
		tone: "success",
		label: "Outputs",
		icon: <RiShareForwardLine />,
		title: "Follow each branch to its destination.",
		description:
			"The article presents the full body. Search uses the title and summary. The feed distributes the same record. One-to-many relationships need a branching composition, not a sequence of equal stages.",
	},
] satisfies readonly [DiagramStep, ...DiagramStep[]];

/** Uses public reconstruction evidence, with the same node geometry as the system map. */
export const validationLoopDiagram: CaseStudyDiagramProps = {
	title: "Reconstruction loop",
	maxWidth: 824,
	description: "A failed check returns the draft to its builder.",
	steps: reconstructionSteps,
	children: (step) => (
		<>
			<ReconstructionDrawing step={step.id} />
			<ReconstructionDrawing step={step.id} mobile />
		</>
	),
};

function ReconstructionDrawing({ step, mobile = false }: { step: string; mobile?: boolean }) {
	const build = step === "build";
	const retry = step === "retry";
	const write = step === "write";
	return (
		<Drawing
			mobile={mobile}
			width={mobile ? 288 : 792}
			height={mobile ? 640 : 360}
			label="Reconstruction loop: source to builder to auditor. A failed check returns to the builder. A passing check goes to compiler, then ledger."
		>
			<rect
				className={styles.boundary}
				x={mobile ? 16 : 260}
				y={mobile ? 112 : 16}
				width={mobile ? 256 : 516}
				height={mobile ? 264 : 208}
			/>
			<text className={styles.phase} x={mobile ? 32 : 276} y={mobile ? 136 : 48}>
				Reconstruction
			</text>
			<Route d={mobile ? "M144 88V160" : "M240 172H276"} active={build} tone="info" />
			<Route
				d={mobile ? "M144 232V288" : "M500 172H536"}
				active={build}
				tone="info"
				order={1}
			/>
			<Route
				d={mobile ? "M256 324H276V196H256" : "M648 136V80H388V136"}
				active={retry}
				tone="warning"
				label="Revise"
				labelSurface="control"
				labelAt={mobile ? [224, 260] : [518, 80]}
			/>
			<Route
				d={mobile ? "M144 360V440" : "M648 208V272"}
				active={write}
				tone="success"
				label="Pass"
				labelAt={mobile ? [144, 400] : [648, 248]}
			/>
			<Route
				d={mobile ? "M144 512V552" : "M536 308H500"}
				active={write}
				tone="success"
				order={1}
			/>
			<Node
				x={mobile ? 32 : 16}
				y={mobile ? 16 : 136}
				title="Scan"
				detail="Source page"
				icon={<RiScanLine />}
				tone="info"
				active={build}
			/>
			<Node
				x={mobile ? 32 : 276}
				y={mobile ? 160 : 136}
				title="Builder"
				detail="Draft layout"
				icon={<RiEditLine />}
				tone="info"
				active={build || retry}
			/>
			<Node
				x={mobile ? 32 : 536}
				y={mobile ? 288 : 136}
				title="Auditor"
				detail="Geometry checks"
				icon={<RiShieldCheckLine />}
				tone="warning"
				active={retry}
			/>
			<Node
				x={mobile ? 32 : 536}
				y={mobile ? 440 : 272}
				title="Compiler"
				detail="Google Docs"
				icon={<RiFileTextLine />}
				tone="success"
				active={write}
			/>
			<Node
				x={mobile ? 32 : 276}
				y={mobile ? 552 : 272}
				title="Ledger"
				detail="Run record"
				icon={<RiDatabase2Line />}
				tone="success"
				active={write}
			/>
		</Drawing>
	);
}

/** Explicitly illustrative: a composition pattern, not a client-system claim. */
export const oneToManyDiagram: CaseStudyDiagramProps = {
	title: "One source, three outputs",
	maxWidth: 800,
	description: "An illustrative pattern for shared content.",
	steps: publishingSteps,
	children: (step) => (
		<>
			<PublishingDrawing step={step.id} />
			<PublishingDrawing step={step.id} mobile />
		</>
	),
};

function PublishingDrawing({ step, mobile = false }: { step: string; mobile?: boolean }) {
	const source = step === "source";
	const outputs = step === "outputs";
	return (
		<Drawing
			mobile={mobile}
			width={mobile ? 288 : 768}
			height={mobile ? 456 : 360}
			label="A saved content record branches to three outputs: the article, search and feed."
		>
			<text className={styles.phase} x={mobile ? 32 : 16} y={mobile ? 122 : 28}>
				{mobile ? "Shared outputs" : "Authored once"}
			</text>
			{!mobile && (
				<text className={styles.phase} x={528} y={28}>
					Used in three places
				</text>
			)}
			<Route
				d={mobile ? "M32 52H12V404" : "M240 196H384"}
				active={outputs}
				tone="success"
				arrow={false}
			/>
			<Route
				d={mobile ? "M12 180H32" : "M384 196V84H528"}
				active={outputs}
				tone="success"
				order={1}
			/>
			<Route
				d={mobile ? "M12 292H32" : "M384 196H528"}
				active={outputs}
				tone="success"
				order={1}
			/>
			<Route
				d={mobile ? "M12 404H32" : "M384 196V308H528"}
				active={outputs}
				tone="success"
				order={1}
			/>
			<Node
				x={mobile ? 32 : 16}
				y={mobile ? 16 : 160}
				title="Saved record"
				detail="Shared content"
				icon={<RiDatabase2Line />}
				tone="info"
				active={source}
			/>
			<Node
				x={mobile ? 32 : 528}
				y={mobile ? 144 : 48}
				title="Article"
				detail="Full content"
				icon={<RiFileTextLine />}
				tone="success"
				active={outputs}
			/>
			<Node
				x={mobile ? 32 : 528}
				y={mobile ? 256 : 160}
				title="Search"
				detail="Title & summary"
				icon={<RiSearchLine />}
				tone="success"
				active={outputs}
			/>
			<Node
				x={mobile ? 32 : 528}
				y={mobile ? 368 : 272}
				title="Feed"
				detail="Latest updates"
				icon={<RiRssLine />}
				tone="success"
				active={outputs}
			/>
		</Drawing>
	);
}
