"use client";

import {
	RiArrowGoBackLine,
	RiDatabase2Line,
	RiFileList3Line,
	RiNodeTree,
	RiSearchLine,
	RiUploadCloud2Line,
} from "@remixicon/react";
import type { CaseStudyDiagramProps, DiagramStep } from "./case-study-diagram";
import { programMatchingEvidence as evidence } from "./case-study-diagram.data";
import { Drawing, Node, Route } from "./diagram-drawing";
import styles from "./figure-drawing.module.css";

const steps = [
	{
		id: "map",
		label: "Map",
		icon: <RiNodeTree />,
		title: "Queryable rules precede import and advice.",
		description: evidence.schema.detail,
	},
	{
		id: "import",
		label: "Import",
		tone: "info",
		icon: <RiUploadCloud2Line />,
		title: "Load the dependencies before their records.",
		description: evidence.importStage.detail,
	},
	{
		id: "resume",
		label: "Resume",
		tone: "warning",
		icon: <RiArrowGoBackLine />,
		title: "A failed import stage keeps its place.",
		description: evidence.resume.detail,
	},
	{
		id: "advice",
		label: "Advice",
		tone: "success",
		icon: <RiSearchLine />,
		title: "Make the match explainable.",
		description: `${evidence.search.detail} ${evidence.score.detail}`,
	},
] satisfies readonly [DiagramStep, ...DiagramStep[]];

/** Program Matching's public narrative, rendered with the canonical diagram frame. */
export const programMatchingDiagram: CaseStudyDiagramProps = {
	title: "Program matching pipeline",
	description: "Structured rules, resumable imports and explained recommendations.",
	maxWidth: 824,
	steps,
	children: (step) => (
		<>
			<ProgramMatchingDrawing step={step.id} />
			<ProgramMatchingDrawing step={step.id} mobile />
		</>
	),
};

function ProgramMatchingDrawing({ step, mobile = false }: { step: string; mobile?: boolean }) {
	const importing = step === "import";
	const resuming = step === "resume";
	const advising = step === "advice";
	return (
		<Drawing
			mobile={mobile}
			width={mobile ? 288 : 792}
			height={mobile ? 672 : 360}
			label="Schema precedes ordered import. A failed stage resumes at the import. Successful imports support hybrid search and an explained score."
		>
			<rect
				className={styles.boundary}
				x={mobile ? 16 : 268}
				y={mobile ? 128 : 16}
				width={256}
				height={mobile ? 256 : 328}
			/>
			<text className={styles.phase} x={mobile ? 32 : 284} y={mobile ? 152 : 48}>
				Resumable import
			</text>
			<Route d={mobile ? "M144 88V176" : "M240 172H284"} active={importing} tone="info" />
			<Route d={mobile ? "M144 248V296" : "M396 208V256"} active={resuming} tone="warning" />
			<Route
				d={mobile ? "M256 332H276V212H256" : "M284 292H252V104H396V136"}
				active={resuming}
				tone="warning"
				order={1}
			/>
			<Route
				d={mobile ? "M32 212H12V476H32" : "M508 172H552"}
				active={advising}
				tone="success"
			/>
			<Route
				d={mobile ? "M144 512V584" : "M664 208V256"}
				active={advising}
				tone="success"
				order={1}
			/>
			<Node
				x={mobile ? 32 : 16}
				y={mobile ? 16 : 136}
				title="Schema"
				detail="Queryable rules"
				icon={<RiDatabase2Line />}
				tone="info"
				active={importing}
			/>
			<Node
				x={mobile ? 32 : 284}
				y={mobile ? 176 : 136}
				title="Ordered import"
				detail="Dependencies first"
				icon={<RiUploadCloud2Line />}
				tone="info"
				active={importing || resuming}
			/>
			<Node
				x={mobile ? 32 : 284}
				y={mobile ? 296 : 256}
				title="Failed stage"
				detail="Checkpoint kept"
				icon={<RiArrowGoBackLine />}
				tone="warning"
				active={resuming}
			/>
			<Node
				x={mobile ? 32 : 552}
				y={mobile ? 440 : 136}
				title="Hybrid search"
				detail="Row embeddings"
				icon={<RiSearchLine />}
				tone="success"
				active={advising}
			/>
			<Node
				x={mobile ? 32 : 552}
				y={mobile ? 584 : 256}
				title="Explained score"
				detail="Separate factors"
				icon={<RiFileList3Line />}
				tone="success"
				active={advising}
			/>
		</Drawing>
	);
}
