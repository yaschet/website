// Short stack roles, grounded in the authored project content. Unknown entries
// keep their name without inventing an implementation claim.
const roles: Readonly<Record<string, string>> = {
	"Next.js": "Web application",
	React: "Interface components",
	TypeScript: "Typed application code",
	Laravel: "Backend and business logic",
	PHP: "Server-side language",
	Livewire: "Server-driven interfaces",
	"Alpine.js": "Interface interactions",
	MySQL: "Relational database",
	Redis: "In-memory data store",
	MeiliSearch: "Search and matching",
	Supabase: "Hosted database",
	PostgreSQL: "Relational data storage",
	"Trigger.dev": "Background processing",
	Stripe: "Credit payments",
	"Google Docs API": "Editable document export",
	Tiptap: "Document review editor",
	"AWS Textract": "Document data extraction",
	S3: "Document storage",
	"next-intl": "Languages and localization",
	"TanStack Query": "Server-state management",
	"Cash Plus": "Payment integration",
};

export function getProjectTechnologyRole(name: string, projectTitle: string): string | undefined {
	if (name === "OpenAI") {
		if (projectTitle === "Verto: AI Translation Platform") return "Translation and checking";
		if (projectTitle === "University Program Matching") return "Academic data import";
		if (projectTitle === "Student Applications & Document Collection")
			return "Document processing";
	}
	return Object.hasOwn(roles, name) ? roles[name] : undefined;
}
