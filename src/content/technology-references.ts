interface TechnologyReference {
	href: string;
	label: string;
}

// Official product pages explain the technology's value without an implementation guide.
const references: Readonly<Record<string, TechnologyReference>> = {
	laravel: { href: "https://laravel.com/", label: "Laravel framework" },
	php: { href: "https://www.php.net/", label: "PHP language" },
	livewire: { href: "https://livewire.laravel.com/", label: "Livewire framework" },
	"alpine.js": { href: "https://alpinejs.dev/", label: "Alpine.js framework" },
	mysql: { href: "https://www.mysql.com/products/community/", label: "MySQL Community Server" },
	redis: { href: "https://redis.io/", label: "Redis data platform" },
	meilisearch: {
		href: "https://www.meilisearch.com/",
		label: "Meilisearch search engine",
	},
	openai: { href: "https://openai.com/api/", label: "OpenAI API platform" },
	"next.js": { href: "https://nextjs.org/", label: "Next.js framework" },
	typescript: { href: "https://www.typescriptlang.org/", label: "TypeScript language" },
	supabase: { href: "https://supabase.com/database", label: "Supabase database" },
	postgresql: { href: "https://www.postgresql.org/", label: "PostgreSQL database" },
	react: { href: "https://react.dev/", label: "React library" },
	"google docs api": {
		href: "https://workspace.google.com/products/docs/",
		label: "Google Docs document collaboration",
	},
	"google cloud": { href: "https://cloud.google.com/", label: "Google Cloud platform" },
	"tanstack query": { href: "https://tanstack.com/query/latest", label: "TanStack Query" },
	stripe: { href: "https://stripe.com/payments/checkout", label: "Stripe Checkout" },
	"cash plus": { href: "https://www.cashplus.ma/", label: "Cash Plus payment services" },
	"trigger.dev": { href: "https://trigger.dev/", label: "Trigger.dev background jobs" },
	"next-intl": { href: "https://next-intl.dev/", label: "next-intl internationalization" },
	"aws textract": {
		href: "https://aws.amazon.com/textract/",
		label: "Amazon Textract document extraction",
	},
	s3: { href: "https://aws.amazon.com/s3/", label: "Amazon S3 object storage" },
	tiptap: {
		href: "https://tiptap.dev/",
		label: "Tiptap document editor",
	},
	github: { href: "https://github.com/features", label: "GitHub platform" },
};

export function getTechnologyReference(name: string): TechnologyReference | undefined {
	const key = name
		.trim()
		.toLowerCase()
		.replace(/\s+\d+(?:\.\d+)*$/, "");
	return Object.hasOwn(references, key) ? references[key] : undefined;
}
