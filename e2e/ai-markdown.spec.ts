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
			body.matchAll(/\]\(https:\/\/yaschet\.com\/case-studies\/([^)]+)\.md\)/g),
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
			expect(body).toContain(`Canonical URL: https://yaschet.com/case-studies/${slug}`);
			expect(body).not.toContain("export const metadata");
			expect(body).not.toMatch(/^<[A-Z][A-Za-z0-9]*\b/m);
		}
	});

	test("unknown case-study Markdown route returns 404", async ({ request }) => {
		const response = await request.get(`${BASE_URL}/case-studies/not-a-real-case-study.md`);
		expect(response.status()).toBe(404);
	});

	test("mixed evidence and the opening argument survive Markdown export", async ({ request }) => {
		const examples = {
			"clearway-phoenix": [
				"Year: 2025",
				"Date: 2025",
				"19,874 programs ranked using 13 criteria",
				"33,614-row import using synthetic data",
				"AI-assisted spreadsheet import",
				"phase-1/03-programs-modal-grade-requirements.png",
				"phase-3/p3-06-assigned-programs-workflow.png",
				"I rebuilt Phoenix as three connected parts",
				"AI importer to process the spreadsheets row by row",
				"films and screenshots use synthetic records and prepared replay data",
			],
			"clearway-portal": [
				"Year: 2025",
				"Date: 2025",
				"clearway-portal-transcript-erp-4k.png",
				"**17,50 / 20**",
				"The demonstration uses synthetic student data and prepared document responses",
			],
			verto: [
				"Year: 2026",
				"Date: 2026",
				"Video: Document Translation With Editable Tables: Walkthrough",
				"## Generate A Native Google Doc",
				"rather than live processing speed or customer adoption",
			],
			"clearway-erp": [
				"Years: 2022–2025",
				"Date: 2026-10-30",
				"returned for several rounds of client-requested improvements",
				"Clearway is an anonymized client identity",
			],
		};
		for (const [slug, evidence] of Object.entries(examples)) {
			const response = await request.get(`${BASE_URL}/case-studies/${slug}.md`);
			expect(response.ok()).toBeTruthy();
			const body = await response.text();
			expect(body).toContain("## The problem");
			expect(body).toContain("## What I built");
			expect(body).toContain("Status: ");
			expect(body).toContain("Related work:");
			for (const detail of evidence) expect(body).toContain(detail);
			expect(body).not.toMatch(/items=\{|^<[A-Z]/m);
		}
	});
});
