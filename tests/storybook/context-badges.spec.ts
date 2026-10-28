import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"]) {
	for (const width of [390, 1280]) {
		test(`context Docs have equal padding and reachable panels at ${width} in ${theme}`, async ({
			page,
		}, testInfo) => {
			await page.setViewportSize({ width, height: 900 });
			await page.goto(
				`/iframe.html?id=components-contextbadges--docs&viewMode=docs&globals=theme:${theme}`,
			);
			const location = page
				.getByRole("button", { name: "About my location: Rabat, Morocco" })
				.first();
			const clock = page.getByRole("button", { name: /Compare your time/ }).first();
			await expect(location).toBeVisible();
			for (const badge of [location, clock]) {
				const framing = await badge.evaluate((node) => {
					const parent = node.parentElement;
					if (!parent) throw new Error("Missing story framing");
					const style = getComputedStyle(parent);
					const rect = node.getBoundingClientRect();
					const wrapper = parent.getBoundingClientRect();
					return {
						height: rect.height,
						width: rect.width,
						padding: style.padding,
						top: rect.top - wrapper.top,
						bottom: wrapper.bottom - rect.bottom,
					};
				});
				expect(framing).toEqual({
					height: 40,
					width: 180,
					padding: "20px",
					top: 20,
					bottom: 20,
				});
			}

			const composition = page.locator(
				"#story--components-contextbadges--above-hero .workshop-context-page",
			);
			await expect(composition).toBeVisible();
			const gutters = await composition.evaluate((node) => {
				const frame = node.getBoundingClientRect();
				const badge = node
					.querySelector(".portfolio-context-badge")
					?.getBoundingClientRect();
				const box = node.lastElementChild?.firstElementChild?.getBoundingClientRect();
				if (!badge || !box) throw new Error("Missing full composition");
				return {
					top: badge.top - frame.top,
					bottom: frame.bottom - box.bottom,
					left: box.left - frame.left,
					right: frame.right - box.right,
				};
			});
			expect(gutters).toEqual({ top: 20, bottom: 20, left: 20, right: 20 });
			await location.click();
			const panel = page.getByRole("dialog", { name: "Working together" });
			await expect(panel).toBeVisible();
			await expect(panel).toHaveCSS("opacity", "1");
			const bounds = await panel.boundingBox();
			expect(bounds?.x).toBeGreaterThanOrEqual(16);
			expect((bounds?.x ?? 0) + (bounds?.width ?? 0)).toBeLessThanOrEqual(width - 16);
			await page.screenshot({ path: testInfo.outputPath(`docs-${theme}-${width}.png`) });
			await panel.getByRole("button", { name: "Close details" }).click();
			await expect(panel).not.toBeVisible();
		});
	}
}
