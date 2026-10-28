import { expect, test } from "@playwright/test";

test("catalog has one diagram family and keeps compositions separate from page previews", async ({
	request,
}) => {
	const response = await request.get("/index.json");
	expect(response.ok()).toBe(true);
	const index: {
		entries: Record<string, { id: string; title: string; type: string; tags: string[] }>;
	} = await response.json();
	const entries = Object.values(index.entries);
	expect([...new Set(entries.map(({ title }) => title.split("/")[0]))].sort()).toEqual([
		"Components",
		"Foundation",
		"Lab",
		"Overview",
		"Pages",
	]);
	const diagrams = entries.filter(({ title }) => title.endsWith("Case Study Diagram"));
	expect(new Set(diagrams.map(({ title }) => title)).size).toBe(1);
	expect(
		diagrams
			.filter(({ type, tags }) => type === "story" && tags.includes("dev"))
			.map(({ id }) => id)
			.sort(),
	).toEqual([
		"case-study-diagram--one-to-many",
		"case-study-diagram--program-matching",
		"case-study-diagram--system-architecture",
		"case-study-diagram--validation-loop",
	]);
	expect(index.entries["pages-casestudyarchitecture--in-context"].title).toBe("Pages/Case Study");
});

for (const theme of ["light", "dark"]) {
	test(`Overview opens without a component context and links the review paths in ${theme}`, async ({
		page,
	}) => {
		await page.setViewportSize({ width: 390, height: 900 });
		await page.goto(`/iframe.html?id=overview--docs&viewMode=docs&globals=theme:${theme}`);
		const docs = page.locator(".sbdocs-content");
		await expect(docs.getByRole("list")).toHaveCount(2);
		await expect(
			docs.getByRole("heading", { level: 1, name: "Yaschet Portfolio" }),
		).toBeVisible();
		await expect(page.locator("html")).toHaveClass(new RegExp(`\\b${theme}\\b`));
		await expect(
			docs.getByRole("link", { name: "Case study diagram", exact: true }),
		).toHaveAttribute("href", "/?path=/docs/case-study-diagram--docs");
		await expect(
			docs.getByRole("link", { name: "Case study page", exact: true }),
		).toHaveAttribute("href", "/?path=/story/pages-casestudyarchitecture--in-context");
		expect(
			await page.evaluate(
				() => document.documentElement.scrollWidth <= window.innerWidth + 1,
			),
		).toBe(true);
	});
}
