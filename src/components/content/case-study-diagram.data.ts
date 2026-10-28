/** Public explanations preserved from content/projects/verto.mdx. */
export const reconstructionEvidence = {
	upload: {
		title: "Upload",
		meta: "Scanned source",
		detail: "The job starts from the scanned document. The words are not enough, because the page structure has to be rebuilt.",
	},
	builder: {
		title: "Builder",
		meta: "Document structure",
		detail: "The builder turns the page image into a document structure. That draft is not accepted yet.",
	},
	auditor: {
		title: "Auditor",
		meta: "Geometric check",
		detail: "The auditor compares the draft with the source image. A missing stamp or a broken table sends the page back.",
	},
	compiler: {
		title: "Compiler",
		meta: "Docs operations",
		detail: "A passing structure becomes ordered Google Docs operations. Tables are written cell by cell from an in-memory grid.",
	},
	ledger: {
		title: "Ledger",
		meta: "Run record",
		detail: "The finished document, its files, and the run record stay stored after compilation.",
	},
} as const;

/** Public explanations preserved from content/projects/clearway-phoenix.mdx. */
export const programMatchingEvidence = {
	schema: {
		title: "Schema",
		meta: "Queryable rules",
		detail: "Eligibility rules leave notes fields and become universities, programs, scholarships, and typed requirements.",
	},
	importStage: {
		title: "Ordered import",
		meta: "Dependencies first",
		detail: "Sheets load in dependency order. A program waits until its university exists, and legacy ids are mapped between stages.",
	},
	resume: {
		title: "Failed stage",
		meta: "Place kept",
		detail: "A failed stage keeps its place in the run. The operator resumes that stage instead of importing the workbook again.",
	},
	search: {
		title: "Hybrid search",
		meta: "Program-row embeddings",
		detail: "Embeddings stay on the program row. Search is hybrid, without a separate vector database.",
	},
	score: {
		title: "Explained score",
		meta: "Separate factors",
		detail: "The score lists grade fit, major alignment, scholarship, deadline, and semantic relevance as separate factors.",
	},
} as const;
