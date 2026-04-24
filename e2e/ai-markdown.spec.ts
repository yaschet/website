import { expect, test } from "@playwright/test";

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const MARKDOWN_ROUTES = ["/llms.txt", "/portfolio.md", "/llms-full.txt"] as const;

test.describe("AI-readable Markdown surfaces", () => {
	test("core Markdown routes return clean text responses", async ({ request }) => {
		for (const route of MARKDOWN_ROUTES) {
			const response = await request.get(`${BASE_URL}${route}`);
			expect(response.ok(), `${route} should return 200`).toBeTruthy();
			expect(response.headers()["content-type"]).toContain("text/markdown");

			const body = await response.text();
			expect(body, `${route} should include a Markdown title`).toMatch(/^# /);
			expect(body, `${route} should not include raw metadata exports`).not.toContain(
				"export const metadata",
			);
			expect(body, `${route} should not include unprocessed MDX JSX`).not.toMatch(
				/^<[A-Z][A-Za-z0-9]*\b/m,
			);
		}
	});

	test("llms.txt links every public case-study Markdown resource", async ({ request }) => {
		const response = await request.get(`${BASE_URL}/llms.txt`);
		expect(response.ok()).toBeTruthy();

		const body = await response.text();
		const markdownLinks = Array.from(
			body.matchAll(/\]\(https:\/\/yaschet\.dev\/case-studies\/([^)]+)\.md\)/g),
		).map((match) => match[1]);

		expect(markdownLinks.length).toBeGreaterThan(0);

		for (const slug of markdownLinks) {
			const caseStudyResponse = await request.get(`${BASE_URL}/case-studies/${slug}.md`);
			expect(
				caseStudyResponse.ok(),
				`/case-studies/${slug}.md should return 200`,
			).toBeTruthy();
			expect(caseStudyResponse.headers()["content-type"]).toContain("text/markdown");

			const body = await caseStudyResponse.text();
			expect(body).toMatch(/^# /);
			expect(body).toContain(`Canonical URL: https://yaschet.dev/case-studies/${slug}`);
			expect(body).not.toContain("export const metadata");
			expect(body).not.toMatch(/^<[A-Z][A-Za-z0-9]*\b/m);
		}
	});

	test("unknown case-study Markdown route returns 404", async ({ request }) => {
		const response = await request.get(`${BASE_URL}/case-studies/not-a-real-case-study.md`);
		expect(response.status()).toBe(404);
	});
});
