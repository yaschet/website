import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"]) {
	for (const width of [320, 390, 1280]) {
		test(`About and Contact compositions fit ${width}px in ${theme}`, async ({ page }) => {
			await page.setViewportSize({ width, height: 900 });
			for (const id of [
				"content-aboutprinciples--default",
				"content-contactmethods--default",
				"forms-contact--page-section",
				"layout-pageintro--contact",
			]) {
				await page.goto(`/iframe.html?id=${id}&viewMode=story&globals=theme:${theme}`);
				const root = page.locator("#storybook-root");
				await expect(root.getByRole("heading").first()).toBeVisible();
				await page.evaluate(() => document.fonts.ready);
				expect(
					await root.evaluate((node) => ({
						overflow: document.documentElement.scrollWidth > innerWidth + 1,
						clipped: [...node.querySelectorAll<HTMLElement>("p, h1, h2, h3")].some(
							(el) => el.scrollWidth > el.clientWidth + 1,
						),
					})),
				).toEqual({ overflow: false, clipped: false });
				if (id === "content-contactmethods--default") {
					const positions = await root
						.locator(".portfolio-contact-method > :last-child")
						.evaluateAll((nodes) =>
							nodes.map((node) => node.getBoundingClientRect().top),
						);
					if (width >= 1024)
						expect(Math.max(...positions) - Math.min(...positions)).toBeLessThan(1);
				}
				if (id === "forms-contact--page-section") {
					const message = root.getByRole("textbox", { name: "Message", exact: true });
					expect(
						await message.evaluate((node) => node.getBoundingClientRect().height),
					).toBeGreaterThanOrEqual(160);
					expect(
						await root
							.locator(".portfolio-form-field")
							.first()
							.evaluate((node) => getComputedStyle(node).gap),
					).toBe("8px");
					const button = root.getByRole("button", { name: "Send message" });
					const geometry = await button.evaluate((node) => ({
						width: node.getBoundingClientRect().width,
						height: node.getBoundingClientRect().height,
						containerWidth: node.closest("form")?.getBoundingClientRect().width,
					}));
					expect(geometry.height).toBe(40);
					if (width < 640) expect(geometry.width).toBe(geometry.containerWidth);
					else expect(geometry.width).toBeLessThan(250);
				}
				if (id === "layout-pageintro--contact") {
					expect(
						await root.getByRole("heading", { level: 1 }).evaluate((node) => {
							const style = getComputedStyle(node);
							return [style.fontSize, style.lineHeight];
						}),
					).toEqual(
						width < 360
							? ["32px", "40px"]
							: width < 640
								? ["36px", "44px"]
								: ["48px", "56px"],
					);
				}
			}
		});
	}
}
