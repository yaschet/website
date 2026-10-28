"use client";

import {
	RiArchiveLine,
	RiArrowGoBackLine,
	RiDatabase2Line,
	RiFileTextLine,
	RiGitBranchLine,
	RiNextjsFill,
	RiNodeTree,
	RiScanLine,
	RiShieldCheckLine,
	RiStackLine,
	RiSupabaseFill,
	RiUploadCloud2Line,
} from "@remixicon/react";
import { type CSSProperties, type ReactNode, useId } from "react";
import type { CaseStudyDiagramProps, DiagramStep } from "./case-study-diagram";
import { FigureNode } from "./figure-node";
import { type FigureBounds, FigureViewport } from "./figure-viewport";
import styles from "./verto-architecture.module.css";

const steps = [
	{
		id: "map",
		label: "Map",
		icon: <RiNodeTree />,
		title: "Durable work, verified output, recorded state.",
		description:
			"A Next.js request hands reconstruction to Trigger.dev. The builder and auditor control what reaches Google Docs, while Supabase holds the resulting artifacts and usage data.",
	},
	{
		id: "intake",
		tone: "info",
		label: "Intake",
		icon: <RiUploadCloud2Line />,
		title: "The request starts a durable job.",
		description:
			"A document upload passes identity and security checks in Next.js before reaching the Trigger.dev orchestrator. Long-running reconstruction belongs to the job, rather than the lifetime of the web request.",
	},
	{
		id: "check",
		tone: "warning",
		label: "Check",
		icon: <RiArrowGoBackLine />,
		title: "A rejected layout returns to its builder.",
		description:
			"The builder creates a document structure. Rolling context preserves continuity across batches, while the auditor checks geometry against the source. Rejection sends the draft back; an accepted structure proceeds to the compiler.",
	},
	{
		id: "write",
		tone: "success",
		label: "Write",
		icon: <RiFileTextLine />,
		title: "Compile the document and record the result.",
		description:
			"The Google Docs compiler translates the accepted structure into ordered document operations. Artifact storage preserves the output, while the ledger records usage. These are separate responsibilities in Supabase.",
	},
] as const satisfies readonly [DiagramStep, ...DiagramStep[]];

type StepId = (typeof steps)[number]["id"];
type Tone = "neutral" | "info" | "warning" | "success";
interface ArchitectureNode {
	id: string;
	title: string;
	detail: string;
	icon: ReactNode;
	wide: [number, number];
	compactY: number;
	steps: readonly StepId[];
}
const nodes: readonly ArchitectureNode[] = [
	{
		id: "upload",
		title: "Document",
		detail: "User upload",
		icon: <RiUploadCloud2Line />,
		wide: [16, 64],
		compactY: 64,
		steps: ["intake"],
	},
	{
		id: "security",
		title: "Identity",
		detail: "Security checks",
		icon: <RiShieldCheckLine />,
		wide: [288, 64],
		compactY: 184,
		steps: ["intake"],
	},
	{
		id: "orchestrator",
		title: "Orchestrator",
		detail: "Durable execution",
		icon: <RiGitBranchLine />,
		wide: [560, 64],
		compactY: 368,
		steps: ["intake"],
	},
	{
		id: "context",
		title: "Context",
		detail: "Across batches",
		icon: <RiStackLine />,
		wide: [16, 240],
		compactY: 488,
		steps: ["check"],
	},
	{
		id: "builder",
		title: "Builder",
		detail: "Document structure",
		icon: <RiScanLine />,
		wide: [288, 240],
		compactY: 608,
		steps: ["check"],
	},
	{
		id: "auditor",
		title: "Auditor",
		detail: "Geometry checks",
		icon: <RiShieldCheckLine />,
		wide: [560, 240],
		compactY: 768,
		steps: ["check"],
	},
	{
		id: "compiler",
		title: "Compiler",
		detail: "Google Docs",
		icon: <RiFileTextLine />,
		wide: [560, 416],
		compactY: 928,
		steps: ["write"],
	},
	{
		id: "artifacts",
		title: "Artifacts",
		detail: "Document storage",
		icon: <RiArchiveLine />,
		wide: [288, 416],
		compactY: 1112,
		steps: ["write"],
	},
	{
		id: "ledger",
		title: "Ledger",
		detail: "Usage & data",
		icon: <RiDatabase2Line />,
		wide: [16, 416],
		compactY: 1272,
		steps: ["write"],
	},
];
interface ArchitectureEdge {
	id: string;
	wide: string;
	compact: string;
	step: StepId;
	/** Shared order means concurrent branches, rather than an implied dependency. */
	order: number;
	tone?: Tone;
	label?: string;
	labelWide?: [number, number];
	labelCompact?: [number, number];
	reverse?: boolean;
}
const edges: readonly ArchitectureEdge[] = [
	{ id: "authenticate", wide: "M240 100H288", compact: "M144 136V184", step: "intake", order: 0 },
	{ id: "enqueue", wide: "M512 100H560", compact: "M144 256V368", step: "intake", order: 1 },
	{
		id: "build",
		wide: "M672 136V184H384V240",
		compact: "M256 404H276V644H256",
		step: "intake",
		order: 2,
		label: "Run",
		labelWide: [528, 184],
		labelCompact: [246, 456],
	},
	{
		id: "context",
		wide: "M240 276H288",
		compact: "M144 560V608",
		step: "check",
		order: 0,
		reverse: true,
	},
	{ id: "audit", wide: "M512 276H560", compact: "M144 680V768", step: "check", order: 1 },
	{
		id: "retry",
		wide: "M672 240V208H416V240",
		compact: "M32 804H12V644H32",
		step: "check",
		order: 2,
		tone: "warning",
		label: "Revise",
		labelWide: [528, 208],
		labelCompact: [52, 724],
	},
	{
		id: "compile",
		wide: "M672 312V416",
		compact: "M144 840V928",
		step: "write",
		order: 0,
		tone: "success",
		label: "Pass",
		labelWide: [672, 364],
		labelCompact: [144, 884],
	},
	{
		id: "store",
		wide: "M560 452H512",
		compact: "M144 1000V1112",
		step: "write",
		order: 1,
		tone: "success",
	},
	{
		id: "record",
		wide: "M560 468H544V520H128V488",
		compact: "M256 964H276V1308H256",
		step: "write",
		order: 1,
		tone: "success",
	},
];

const wideBounds: FigureBounds = { x: 0, y: 0, width: 800, height: 552 };

/** Guided mobile views are complete compositions, never crops through adjacent nodes. */
const compactStages: Record<
	Exclude<StepId, "map">,
	{
		height: number;
		focus: FigureBounds;
		nodes: Readonly<Record<string, number>>;
		edges: readonly { id: string; path: string; label?: [number, number] }[];
	}
> = {
	intake: {
		height: 344,
		focus: { x: 32, y: 16, width: 224, height: 312 },
		nodes: { upload: 16, security: 136, orchestrator: 256 },
		edges: [
			{ id: "authenticate", path: "M144 88V136" },
			{ id: "enqueue", path: "M144 208V256" },
		],
	},
	check: {
		height: 384,
		focus: { x: 16, y: 16, width: 240, height: 352 },
		nodes: { context: 16, builder: 136, auditor: 296 },
		edges: [
			{ id: "context", path: "M144 88V136" },
			{ id: "audit", path: "M144 208V296" },
			{ id: "retry", path: "M32 332H16V172H32", label: [52, 252] },
		],
	},
	write: {
		height: 344,
		focus: { x: 32, y: 16, width: 240, height: 312 },
		nodes: { compiler: 16, artifacts: 136, ledger: 256 },
		edges: [
			{ id: "store", path: "M144 88V136" },
			{ id: "record", path: "M256 52H272V292H256" },
		],
	},
};

/** Authored from content/projects/verto.mdx, Architecture A–C and Infrastructure. */
export const systemArchitectureDiagram: CaseStudyDiagramProps = {
	maxWidth: 864,
	navigationPosition: "above",
	title: "Verto architecture",
	description: "From document upload to a verified, editable result.",
	steps,
	children: (step) => {
		const selected = steps.find((item) => item.id === step.id) ?? steps[0];
		return (
			<FigureViewport
				label="Verto system architecture"
				stepId={selected.id}
				wide={{
					width: wideBounds.width,
					height: wideBounds.height,
					focus: wideBounds,
					drawing: <ArchitectureMap step={selected.id} compact={false} />,
				}}
				compact={{
					width: 288,
					height: selected.id === "map" ? 1376 : compactStages[selected.id].height,
					focus:
						selected.id === "map"
							? { x: 0, y: 0, width: 288, height: 1376 }
							: compactStages[selected.id].focus,
					drawing: <ArchitectureMap step={selected.id} compact />,
				}}
			/>
		);
	},
};

function ArchitectureMap({ step, compact }: { step: StepId; compact: boolean }) {
	const arrowId = useId();

	const stage = compact && step !== "map" ? compactStages[step] : null;
	const height = compact ? (stage?.height ?? 1376) : wideBounds.height;
	const visibleNodes = stage ? nodes.filter((node) => node.id in stage.nodes) : nodes;
	const visibleEdges = stage
		? stage.edges.map((route) => {
				const edge = edges.find((item) => item.id === route.id);
				if (!edge) throw new Error(`Unknown architecture connection: ${route.id}`);
				return {
					...edge,
					compact: route.path,
					labelCompact: route.label,
					order: edge.order - (step === "write" ? 1 : 0),
				};
			})
		: edges;
	const groups = compact
		? stage
			? []
			: [
					{ title: "Request", detail: "Next.js", x: 32, y: 16, width: 224 },
					{ title: "Reconstruction", detail: "Trigger.dev", x: 32, y: 320, width: 224 },
					{ title: "Persistence", detail: "Supabase", x: 32, y: 1064, width: 224 },
				]
		: [
				{
					title: "Request & orchestration",
					detail: "Next.js → Trigger.dev",
					x: 16,
					y: 16,
					width: 768,
				},
				{ title: "Reconstruction", detail: "", x: 16, y: 192, width: 224 },
				{ title: "Persistence", detail: "Supabase", x: 16, y: 368, width: 496 },
			];
	return (
		<div className={styles.map} data-architecture-map data-compact={compact} data-stage={step}>
			{groups.map((group) => (
				<div
					key={group.title}
					className={styles.groupHeading}
					style={{ left: group.x, top: group.y, width: group.width }}
				>
					<strong>{group.title}</strong>
					<span>
						{group.detail.startsWith("Next.js") ? (
							<RiNextjsFill aria-hidden="true" />
						) : group.detail === "Supabase" ? (
							<RiSupabaseFill aria-hidden="true" />
						) : null}
						{group.detail}
					</span>
				</div>
			))}
			<svg
				className={styles.connections}
				width={compact ? 288 : wideBounds.width}
				height={height}
				viewBox={`0 0 ${compact ? 288 : wideBounds.width} ${height}`}
				role="img"
				aria-label="Upload passes security to orchestration. Builder and context exchange state; the auditor returns rejected layouts or passes accepted layouts to the compiler, artifact storage and ledger."
			>
				<defs>
					<marker
						id={arrowId}
						viewBox="0 0 8 8"
						refX="7"
						refY="4"
						markerWidth="8"
						markerHeight="8"
						orient="auto-start-reverse"
						markerUnits="userSpaceOnUse"
					>
						<path
							d="M2 1L6 4L2 7"
							fill="none"
							stroke="context-stroke"
							strokeWidth="1.25"
						/>
					</marker>
				</defs>
				{visibleEdges.map((edge) => {
					const active = edge.step === step;
					const [x, y] = (compact ? edge.labelCompact : edge.labelWide) ?? [0, 0];
					const path = compact ? edge.compact : edge.wide;
					return (
						<g
							key={edge.id}
							className={styles.edge}
							data-active={active}
							data-tone={edge.tone ?? "info"}
						>
							<path
								d={path}
								markerEnd={`url(#${arrowId})`}
								markerStart={edge.reverse ? `url(#${arrowId})` : undefined}
							/>
							{active && (
								<path
									key={`${step}-${edge.id}`}
									className={styles.trace}
									d={path}
									pathLength="1"
									style={
										{
											"--edge-order": edge.order,
										} as CSSProperties
									}
								/>
							)}
							{edge.label && (
								<g className={styles.edgeLabel}>
									<rect x={x - 26} y={y - 11} width="52" height="22" />
									<text x={x} y={y} dominantBaseline="central">
										{edge.label}
									</text>
								</g>
							)}
						</g>
					);
				})}
			</svg>
			{visibleNodes.map((node) => (
				<FigureNode
					key={node.id}
					id={node.id}
					title={node.title}
					detail={node.detail}
					icon={node.icon}
					active={node.steps.includes(step)}
					tone={
						node.id === "auditor"
							? "warning"
							: node.steps.includes("write")
								? "success"
								: "info"
					}
					x={compact ? 32 : node.wide[0]}
					y={compact ? (stage?.nodes[node.id] ?? node.compactY) : node.wide[1]}
				/>
			))}
		</div>
	);
}
