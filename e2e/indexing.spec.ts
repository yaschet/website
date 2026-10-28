import { expect, test } from "@playwright/test";

test("deployment indexing policy covers pages, assets, robots and sitemap", async ({ request }) => {
	const preview = process.env.VERCEL_ENV === "preview";
	const home = await request.get("/");
	expect(home.ok()).toBeTruthy();
	const html = await home.text();
	expect(html).toContain('rel="canonical" href="https://yaschet.com"');
	const robots = await request.get("/robots.txt");
	const sitemap = await request.get("/sitemap.xml");
	expect(robots.ok()).toBeTruthy();
	expect(sitemap.ok()).toBeTruthy();

	if (preview) {
		expect(home.headers()["x-robots-tag"]).toContain("noindex");
		expect(html).toContain('name="robots" content="noindex, nofollow"');
		expect(await robots.text()).toContain("Disallow: /");
		expect(await robots.text()).not.toContain("Sitemap:");
		expect(await sitemap.text()).not.toContain("<loc>");
		const asset = await request.get("/images/avatar.png");
		expect(asset.ok()).toBeTruthy();
		expect(asset.headers()["x-robots-tag"]).toContain("noindex");
	} else {
		expect(home.headers()["x-robots-tag"]).toBeUndefined();
		expect(html).toContain('name="robots" content="index, follow"');
		expect(await robots.text()).toContain("Sitemap: https://yaschet.com/sitemap.xml");
		expect(await sitemap.text()).toContain("<loc>https://yaschet.com");
	}
});
