import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Table as ArticleTable, Pre, TBody, TD, TH, THead, TR } from "./mdx-components";
import { MermaidDiagram } from "./mermaid-diagram";

const meta = {
	id: "article-blocks",
	title: "Components/Content/Article Blocks",
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component:
					"Production Markdown code and table renderers. Long source lines scroll within their frame; copy feedback stays beside its trigger. Fixtures demonstrate rendering behavior without depending on case-study prose.",
			},
		},
	},
	decorators: [
		(Story) => (
			<div className="workshop-stage">
				<div className="mx-auto max-w-3xl">
					<Story />
				</div>
			</div>
		),
	],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Code: Story = {
	render: () => (
		<Pre>
			<code className="language-typescript">{`type ImportResult = { accepted: number; rejected: number };

export function summarizeImport(result: ImportResult): string {
  // Keep a readable audit summary alongside the imported records.
  return \`Accepted: \${result.accepted}; rejected: \${result.rejected}\`;
}
`}</code>
		</Pre>
	),
};

export const Table: Story = {
	render: () => (
		<ArticleTable aria-label="Import outcomes">
			<THead>
				<TR>
					<TH>Outcome</TH>
					<TH>Records</TH>
					<TH>Next step</TH>
				</TR>
			</THead>
			<TBody>
				<TR>
					<TD>Accepted</TD>
					<TD>120</TD>
					<TD>Review</TD>
				</TR>
				<TR>
					<TD>Rejected</TD>
					<TD>3</TD>
					<TD>Correct source</TD>
				</TR>
			</TBody>
		</ArticleTable>
	),
};

// Compatibility coverage for fenced Mermaid content. The authored interactive
// diagram family remains Components / Content / Case Study Diagram.
export const MarkdownFlowchart: Story = {
	tags: ["!dev", "!autodocs"],
	render: () => <MermaidDiagram code={"flowchart LR\n  A[Input] --> B[Validate] --> C[Store]"} />,
};
