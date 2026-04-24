import { getLlmsTxt } from "@/src/content/ai-markdown";

const MARKDOWN_HEADERS = {
	"Cache-Control": "public, max-age=0, s-maxage=86400",
	"Content-Type": "text/markdown; charset=utf-8",
} as const;

export async function GET() {
	const markdown = await getLlmsTxt();

	return new Response(markdown, {
		headers: MARKDOWN_HEADERS,
	});
}
