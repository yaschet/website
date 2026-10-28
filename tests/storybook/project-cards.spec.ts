import { expect, test } from "@playwright/test";

test.use({ deviceScaleFactor: 2, reducedMotion: "reduce" });

for (const theme of ["light", "dark"]) {
	for (const width of [320, 390, 1280]) {
		test(`project metadata reflows at ${width}px in ${theme}`, async ({ page }) => {
			await page.setViewportSize({ width, height: 900 });
			await page.goto(
				`/iframe.html?id=components-projectcardgallery--long-metadata&viewMode=story&globals=theme:${theme}`,
			);
			const card = page.getByRole("article");
			await expect(card.getByRole("heading", { level: 3 })).toBeVisible();
			await page.evaluate(() => document.fonts.ready);
			const layout = await card.evaluate((node) => {
				const copy = node.querySelector('[data-slot="project-copy"]');
				const title = node.querySelector("h3");
				const action = node.querySelector("[data-project-action]");
				const description = copy?.querySelector(":scope > p");
				if (!copy || !title || !action || !description)
					throw new Error("Incomplete project card");
				const t = title.getBoundingClientRect(),
					a = action.getBoundingClientRect();
				const c = copy.getBoundingClientRect();
				return {
					width: a.width,
					height: a.height,
					centerDifference: Math.abs(t.top + t.height / 2 - a.top - a.height / 2),
					clamp: getComputedStyle(description).webkitLineClamp,
					overflow: document.documentElement.scrollWidth > innerWidth,
					chipsFit: [...node.querySelectorAll("li")].every((chip) => {
						const r = chip.getBoundingClientRect();
						return (
							r.left >= c.left &&
							r.right <= c.right &&
							chip.scrollWidth <= chip.clientWidth + 1
						);
					}),
				};
			});
			expect(layout.width).toBe(40);
			expect(layout.height).toBe(40);
			expect(layout.centerDifference).toBeLessThan(0.5);
			expect(layout.clamp).toBe("none");
			expect(layout.overflow).toBe(false);
			expect(layout.chipsFit).toBe(true);

			const preview = card.locator('[data-slot="project-preview"]');
			const before = await preview.boundingBox();
			await preview.hover();
			await expect(
				card.getByRole("region", {
					name: "A long case-study heading across narrow screens",
				}),
			).toBeVisible();
			const after = await preview.boundingBox();
			expect(after?.height).toBeCloseTo(before?.height ?? 0, 0);
			const link = card.getByRole("link", {
				name: "A long case-study heading across narrow screens",
			});
			await link.focus();
			await expect(link).toBeFocused();
			expect(await link.evaluate((el) => getComputedStyle(el).outlineStyle)).toBe("solid");
			await expect(link).toHaveAttribute("href", "/case-studies/verto");
		});
	}

	test(`poster action retains its geometry while pending in ${theme}`, async ({ page }) => {
		await page.goto(
			`/iframe.html?id=components-media-galleryplaybutton--default&viewMode=story&globals=theme:${theme}`,
		);
		const button = page.getByRole("button", { name: "Play 1:40 video" });
		await expect(button).toBeVisible();
		await page.evaluate(() => document.fonts.ready);
		const before = await button.boundingBox();
		await page.goto(
			`/iframe.html?id=components-media-galleryplaybutton--pending&viewMode=story&globals=theme:${theme}`,
		);
		const pending = page.getByRole("button", { name: "Play 1:40 video" });
		await expect(pending).toBeDisabled();
		await expect(pending).toHaveAttribute("aria-busy", "true");
		await page.evaluate(() => document.fonts.ready);
		const after = await pending.boundingBox();
		expect(after?.height).toBe(48);
		expect(after?.width).toBe(before?.width);
		expect((await pending.locator('[data-slot="spinner"]').boundingBox())?.width).toBe(16);
	});
}
