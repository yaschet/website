import { expect, type Locator, test } from "@playwright/test";

async function expectBalancedContent(button: Locator) {
	const geometry = await button.evaluate((node) => {
		const frame = node.getBoundingClientRect();
		const content = node.querySelector(".foundation-button-pending");
		if (!content) throw new Error("Missing button content.");
		const inner = content.getBoundingClientRect();
		return { left: inner.left - frame.left, right: frame.right - inner.right };
	});
	expect(geometry.left).toBeCloseTo(geometry.right, 1);
	expect(geometry.left).toBeCloseTo(13, 1);
}

for (const theme of ["light", "dark"]) {
	for (const width of [390, 1280]) {
		test(`pending controls preserve focus and balanced insets at ${width}px in ${theme}`, async ({
			page,
		}) => {
			await page.setViewportSize({ width, height: 900 });
			await page.goto(
				`/iframe.html?id=primitives-button--pending-geometry&globals=theme:${theme}`,
			);
			const action = page.getByRole("button", { name: "Save changes", exact: true });
			const icon = page.getByRole("button", { name: "Add item", exact: true });
			const link = page.getByRole("link", { name: "View example", exact: true });
			const measure = () =>
				page.locator('[data-slot="button"]').evaluateAll((nodes) =>
					nodes.slice(0, 3).map((node) => ({
						width: (node as HTMLElement).offsetWidth,
						height: (node as HTMLElement).offsetHeight,
					})),
				);
			await expect(action).toBeVisible();
			await page.evaluate(() => document.fonts.ready);
			const before = await measure();
			await expectBalancedContent(action);
			await expectBalancedContent(link);
			await action.focus();
			await page.keyboard.press("Enter");
			const pending = page.getByRole("button", { name: "Saving changes", exact: true });
			await expect(pending).toHaveAttribute("aria-busy", "true");
			await expect(pending).toHaveAttribute("aria-disabled", "true");
			await expect(pending).toBeFocused();
			await expect(pending.locator(".t-state-label > span").first()).toHaveCSS(
				"transition-duration",
				"0s",
			);
			expect(await pending.evaluate((node) => node.hasAttribute("disabled"))).toBe(false);
			await expect(pending).toHaveCSS("opacity", "1");
			const pendingGeometry = await measure();
			expect(pendingGeometry.map((box) => box.height)).toEqual(
				before.map((box) => box.height),
			);
			expect(pendingGeometry[0].width).toBeGreaterThan(before[0].width);
			expect(pendingGeometry[1]).toEqual(before[1]);
			await expectBalancedContent(pending);
			await expectBalancedContent(link);
			const busySurface = await pending.evaluate(
				(node) => getComputedStyle(node).backgroundColor,
			);
			await pending.hover();
			await page.mouse.down();
			await expect(pending).toHaveCSS("background-color", busySurface);
			expect(
				await pending.evaluate(
					(node) => new DOMMatrixReadOnly(getComputedStyle(node).transform).isIdentity,
				),
			).toBe(true);
			await page.mouse.up();
			await expect(icon.locator('.foundation-button-icon > [data-active="true"]')).toHaveCSS(
				"opacity",
				"1",
			);
			await expect(icon.locator('.foundation-button-icon > [data-active="false"]')).toHaveCSS(
				"opacity",
				"0",
			);
			const url = page.url();
			await link.dispatchEvent("click");
			await link.focus();
			await page.keyboard.press("Enter");
			expect(page.url()).toBe(url);
			await page.getByRole("button", { name: "Complete example" }).click();
			const complete = page.getByRole("button", { name: "Changes saved", exact: true });
			await expect(complete).not.toHaveAttribute("aria-busy");
			await expect.poll(async () => (await measure())[1]).toEqual(before[1]);
			await expectBalancedContent(complete);
			await expect(icon.locator('.foundation-button-icon > [data-active="false"]')).toHaveCSS(
				"opacity",
				"0",
			);
			expect(
				await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
			).toBe(true);
		});

		test(`contact pending replaces its trailing icon at ${width}px in ${theme}`, async ({
			page,
		}, testInfo) => {
			await page.setViewportSize({ width, height: 900 });
			await page.goto(`/iframe.html?id=forms-contact--submitting&globals=theme:${theme}`);
			const button = page.getByRole("button", { name: "Sending message", exact: true });
			await expect(button).toHaveAttribute("aria-busy", "true");
			await expect(button).toBeFocused();
			await page.evaluate(() => document.fonts.ready);
			const chamber = button.locator(".foundation-button-icon-space");
			await expect(chamber).toHaveCount(1);
			await expect(chamber).toHaveCSS("margin-inline-start", "8px");
			await expect(chamber).toHaveCSS("margin-inline-end", "0px");
			await expect(button.locator('[data-slot="spinner"]')).toHaveCSS("width", "16px");
			await expect(
				button.locator('.foundation-button-icon > [data-active="false"]'),
			).toHaveCSS("opacity", "0");
			const geometry = await button.evaluate((node) => {
				const frame = node.getBoundingClientRect();
				const content = node.querySelector(".foundation-button-pending");
				const form = node.closest("form");
				if (!content || !form) throw new Error("Missing contact layout.");
				const inner = content.getBoundingClientRect();
				return {
					height: frame.height,
					width: frame.width,
					formWidth: form.getBoundingClientRect().width,
					left: inner.left - frame.left,
					right: frame.right - inner.right,
				};
			});
			expect(geometry.height).toBe(40);
			expect(geometry.left).toBeCloseTo(geometry.right, 1);
			if (width < 640) expect(geometry.width).toBe(geometry.formWidth);
			else expect(geometry.left).toBe(13);
			expect(
				await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
			).toBe(true);
			await page.screenshot({
				path: testInfo.outputPath(`contact-pending-${theme}-${width}.png`),
			});
		});
	}

	test(`pointer-driven width and copy transitions can reverse in ${theme}`, async ({ page }) => {
		await page.goto(
			`/iframe.html?id=primitives-button--pending-geometry&globals=theme:${theme}`,
		);
		await page.evaluate(() => document.fonts.ready);
		const button = page.locator('[data-slot="button"]').first();
		const before = await button.evaluate((node) => node.clientWidth);
		await button.click();
		const samples = await button.evaluate(async (node) => {
			const widths: number[] = [];
			for (let index = 0; index < 24; index++) {
				await new Promise(requestAnimationFrame);
				widths.push(node.clientWidth);
			}
			return widths;
		});
		const end = samples.at(-1) ?? before;
		expect(end).toBeGreaterThan(before);
		expect(samples.some((width) => width > before && width < end)).toBe(true);
		await expectBalancedContent(button);
		await expect(
			button.locator('.t-state-label[data-sizing="content"] > [data-active="true"]'),
		).toHaveCSS("opacity", "1");
		await page.getByRole("button", { name: "Reset example" }).click();
		await expect.poll(() => button.evaluate((node) => node.clientWidth)).toBe(before);
		await button.click();
		await page.getByRole("button", { name: "Reset example" }).click();
		await expect.poll(() => button.evaluate((node) => node.clientWidth)).toBe(before);
		await expectBalancedContent(button);
	});

	test(`press feedback can reverse without dimming the label in ${theme}`, async ({ page }) => {
		await page.goto(`/iframe.html?id=primitives-button--default&globals=theme:${theme}`);
		const button = page.getByRole("button", { name: "Button", exact: true });
		await button.hover();
		await page.mouse.down();
		await expect(button).toHaveCSS("opacity", "1");
		await expect(button).toHaveCSS("transform", "matrix(0.985, 0, 0, 0.985, 0, 0)");
		await page.mouse.up();
		await page.mouse.down();
		await expect(button).toHaveCSS("transform", "matrix(0.985, 0, 0, 0.985, 0, 0)");
		await page.mouse.up();
		await expect(button).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, 0)");
		await expect(button).toHaveCSS("border-radius", "0px");
	});

	test(`compact pending slots use their control's glyph and gap in ${theme}`, async ({
		page,
	}) => {
		for (const [size, height, glyph, gap] of [
			["xs", 28, 14, 4],
			["sm", 36, 14, 6],
			["md", 40, 16, 8],
		] as const) {
			await page.goto(
				`/iframe.html?id=primitives-button--loading&globals=theme:${theme}&args=size:${size}`,
			);
			const button = page.getByRole("button", { name: "Saving...", exact: true });
			await expect(button).toBeVisible();
			await expect(button).toHaveCSS("height", `${height}px`);
			await expect(button.locator('[data-slot="spinner"]')).toHaveCSS("width", `${glyph}px`);
			await expect(button.locator(".foundation-button-icon-space")).toHaveCSS(
				"margin-inline-end",
				`${gap}px`,
			);
		}
	});

	test(`reduced-motion press and state changes are immediate in ${theme}`, async ({ page }) => {
		await page.emulateMedia({ reducedMotion: "reduce" });
		await page.goto(`/iframe.html?id=primitives-button--default&globals=theme:${theme}`);
		const button = page.getByRole("button", { name: "Button", exact: true });
		await button.hover();
		await page.mouse.down();
		expect(
			await button.evaluate(
				(node) => new DOMMatrixReadOnly(getComputedStyle(node).transform).isIdentity,
			),
		).toBe(true);
		await expect(button).toHaveCSS("transition-duration", "0s");
		await page.mouse.up();
		await page.goto(`/iframe.html?id=primitives-button--loading&globals=theme:${theme}`);
		await expect(page.locator('[data-slot="spinner"]')).toHaveCSS("animation-name", "none");
		await expect(page.locator(".foundation-button-icon-space")).toHaveCSS(
			"transition-duration",
			"0s",
		);
	});
}

test.describe("touch input", () => {
	test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });
	for (const theme of ["light", "dark"]) {
		test(`a tap starts progress with balanced content in ${theme}`, async ({ page }) => {
			await page.goto(
				`/iframe.html?id=primitives-button--pending-geometry&globals=theme:${theme}`,
			);
			const button = page.getByRole("button", { name: "Save changes", exact: true });
			await expect(button).toBeVisible();
			await button.tap();
			const pending = page.getByRole("button", { name: "Saving changes", exact: true });
			await expect(pending).toHaveAttribute("aria-busy", "true");
			await expect(pending).toHaveCSS("opacity", "1");
			await expect(pending).toHaveCSS("height", "40px");
			await page.getByRole("button", { name: "Complete example" }).tap();
			await expect(
				page.getByRole("button", { name: "Changes saved", exact: true }),
			).toBeVisible();
			await expectBalancedContent(
				page.getByRole("button", { name: "Changes saved", exact: true }),
			);
		});
	}
});
