// Presentation priorities, independent of the authored stack's completeness.
// The rail includes a highlight only when that technology exists in its stack.
const highlights: Readonly<Record<string, readonly string[]>> = {
	"clearway-phoenix": ["Laravel", "OpenAI", "MeiliSearch"],
	verto: ["Next.js", "OpenAI", "Google Docs API", "Stripe"],
	"clearway-portal": ["Next.js", "Laravel", "AWS Textract"],
	"clearway-erp": ["Laravel", "Cash Plus", "MySQL"],
};

export function getProjectTechnologyHighlights(slug: string): readonly string[] | undefined {
	return highlights[slug];
}
