import {
	getCaseStudyMarkdownBySlug,
	getPublicCaseStudyMarkdownEntries,
} from "@/src/content/ai-markdown";

const MARKDOWN_HEADERS = {
	"Cache-Control": "public, max-age=0, s-maxage=86400",
	"Content-Type": "text/markdown; charset=utf-8",
} as const;

interface CaseStudyMarkdownRouteProps {
	params: Promise<{
		slug: string;
	}>;
}

export async function generateStaticParams() {
	const projects = await getPublicCaseStudyMarkdownEntries();

	return projects.map((project) => ({
		slug: project.slug,
	}));
}

export async function GET(_request: Request, { params }: CaseStudyMarkdownRouteProps) {
	const { slug } = await params;
	const project = await getCaseStudyMarkdownBySlug(slug);

	if (!project) {
		return new Response("Not found", {
			status: 404,
			headers: {
				"Content-Type": "text/plain; charset=utf-8",
			},
		});
	}

	return new Response(project.markdown, {
		headers: MARKDOWN_HEADERS,
	});
}
