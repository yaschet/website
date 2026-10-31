import { expect, type Page, test } from "@playwright/test";

const story = "/iframe.html?id=components-media-mediagallery--long-sequence&viewMode=story";
const surface = '.pswp__item[aria-hidden="false"] .pswp__img:not(.pswp__img--placeholder)';

async function open(page: Page) {
	await page.goto(story);
	await page
		.getByRole("button", { name: "Open slide 1 in expanded viewer", exact: true })
		.click();
	const dialog = page.getByRole("dialog");
	await expect(dialog).toHaveAttribute("data-gallery-state", "open");
	await expect
		.poll(() =>
			dialog
				.locator(surface)
				.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0),
		)
		.toBe(true);
	return dialog;
}

test("a delayed decode keeps the current artwork sharp, coalesces intent and lets a later choice win", async ({
	page,
}) => {
	await page.setViewportSize({ width: 1440, height: 1000 });
	await page.addInitScript(() => {
		const decode = HTMLImageElement.prototype.decode;
		HTMLImageElement.prototype.decode = function () {
			if (
				!this.classList.contains("pswp__img") ||
				!this.src.includes("p3-06-assigned-programs-workflow")
			)
				return decode.call(this);
			const root = document.documentElement;
			root.dataset.delayedDecodes = String(Number(root.dataset.delayedDecodes ?? 0) + 1);
			if (root.dataset.releaseDecode) return decode.call(this);
			const gate = new Promise<void>((resolve) =>
				document.addEventListener("release-gallery-decode", () => resolve(), {
					once: true,
				}),
			);
			return Promise.all([decode.call(this), gate]).then(() => {});
		};
	});
	const dialog = await open(page);
	const last = dialog.locator('[data-gallery-preview="11"]');
	await last.hover();
	await expect(page.locator("html")).toHaveAttribute("data-delayed-decodes", "1");
	await last.focus();
	await last.click();
	await expect(last).toHaveAttribute("aria-busy", "true");
	await expect(dialog).toHaveAccessibleName("Programs");
	await expect(dialog.getByRole("status")).toHaveText("Preparing slide 12");
	await expect(page.locator("html")).toHaveAttribute("data-delayed-decodes", "1");
	await expect(dialog.locator(surface)).toHaveCSS("filter", "none");
	await expect(dialog.locator('[data-gallery-preview="0"]')).toHaveAttribute(
		"aria-current",
		"true",
	);
	await dialog.locator('[data-gallery-preview="4"]').click();
	await expect(dialog).toHaveAccessibleName("Scholarship categories");
	await page.evaluate(() => {
		document.documentElement.dataset.releaseDecode = "true";
		document.dispatchEvent(new Event("release-gallery-decode"));
	});
	await expect(dialog).not.toHaveAttribute("data-gallery-jump");
	await expect(dialog).toHaveAccessibleName("Scholarship categories");
	await expect(last).toHaveAttribute("aria-busy", "false");
	await page.keyboard.press("Escape");
});

for (const reducedMotion of ["no-preference", "reduce"] as const) {
	test(`the filmstrip follows selection and preserves touch-sized, stable hit areas with ${reducedMotion}`, async ({
		page,
	}, testInfo) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await page.emulateMedia({ reducedMotion });
		const dialog = await open(page);
		const strip = dialog.getByRole("group", { name: "Gallery previews" });
		const next = dialog.getByRole("button", { name: "Next slide", exact: true });
		await dialog.locator('[data-gallery-preview="11"]').dispatchEvent("click", { detail: 1 });
		await expect(dialog).toHaveAccessibleName("Assigned programs");
		await expect(strip).not.toHaveAttribute("data-gallery-filmstrip-moving");
		await expect
			.poll(() => strip.evaluate((element) => element.scrollLeft))
			.toBeGreaterThan(500);
		const last = dialog.locator('[data-gallery-preview="11"]');
		const before = await last.boundingBox();
		if (!before) throw new Error("Expected the selected preview");
		expect(before.width).toBeGreaterThanOrEqual(48);
		expect(before.height).toBeGreaterThanOrEqual(48);
		await last.hover({ position: { x: 5, y: 5 } });
		const after = await last.boundingBox();
		expect(after).toEqual(before);
		await last.focus();
		await page.keyboard.press("Tab");
		await page.keyboard.press("Shift+Tab");
		await expect(last).toBeFocused();
		await expect(last).toHaveCSS("outline-style", "solid");
		await expect(last).toHaveCSS("outline-width", "2px");
		await expect(strip.locator("[data-gallery-track]")).toHaveCSS("filter", "none");
		await expect(next).toBeDisabled();
		const selected = strip.locator("[data-gallery-selection]");
		await expect
			.poll(async () =>
				Math.abs(
					((await selected.boundingBox())?.x ?? 0) - ((await last.boundingBox())?.x ?? 0),
				),
			)
			.toBeLessThan(1);
		if (reducedMotion === "reduce") {
			await expect(dialog.locator("[data-gallery-transition]")).toHaveCount(0);
			expect(
				await dialog.evaluate(
					(root) =>
						root
							.getAnimations({ subtree: true })
							.filter((animation) => animation.playState === "running").length,
				),
			).toBe(0);
		}
		await page.screenshot({ path: testInfo.outputPath(`filmstrip-${reducedMotion}.png`) });
		await page.keyboard.press("Escape");
	});
}

test("sharp glass has one complete edge and movement-linked exposure always settles", async ({
	page,
}, testInfo) => {
	await page.setViewportSize({ width: 1440, height: 1000 });
	const dialog = await open(page);
	for (const region of [dialog.locator("header"), dialog.locator("footer")]) {
		const material = await region.evaluate((element) => {
			const style = getComputedStyle(element);
			const edge = getComputedStyle(element, "::after");
			const before = getComputedStyle(element, "::before");
			return {
				filter: style.backdropFilter,
				background: style.backgroundImage,
				mask: style.maskImage,
				before: before.content,
				edges: [
					edge.borderTopWidth,
					edge.borderRightWidth,
					edge.borderBottomWidth,
					edge.borderLeftWidth,
				],
			};
		});
		expect(material.filter).toContain("blur(48px)");
		expect(material.background).toBe("none");
		expect(material.mask).toBe("none");
		expect(material.before).toBe("none");
		expect(material.edges).toEqual(["1px", "1px", "1px", "1px"]);
	}
	await dialog.evaluate((root) => {
		const report: {
			times: number[];
			exposure: number[];
			sourceWidths: number[];
			sources: string[];
		} = {
			times: [],
			exposure: [],
			sourceWidths: [],
			sources: [],
		};
		(root as HTMLElement & { motionReport?: typeof report }).motionReport = report;
		root.setAttribute("data-sample-motion", "true");
		let last = performance.now();
		const sample = () => {
			if (!root.hasAttribute("data-sample-motion")) return;
			const now = performance.now();
			report.times.push(now - last);
			last = now;
			report.exposure.push(
				Number(
					root
						.querySelector(":scope > svg feGaussianBlur")
						?.getAttribute("stdDeviation")
						?.split(" ")[0] ?? 0,
				),
			);
			for (const image of root.querySelectorAll<HTMLImageElement>(
				"img[data-gallery-frame]",
			)) {
				report.sourceWidths.push(image.naturalWidth);
				report.sources.push(image.currentSrc);
			}
			requestAnimationFrame(sample);
		};
		requestAnimationFrame(sample);
	});
	const originalSrc = await dialog
		.locator(surface)
		.evaluate((image: HTMLImageElement) => image.currentSrc);
	const originalWidth = await dialog
		.locator(surface)
		.evaluate((image: HTMLImageElement) => image.naturalWidth);
	await dialog.locator('[data-gallery-preview="4"]').dispatchEvent("click", { detail: 1 });
	await expect(dialog).toHaveAccessibleName("Scholarship categories");
	await expect(dialog).not.toHaveAttribute("data-gallery-jump");
	await expect(dialog.locator(".pswp__scroll-wrap")).toHaveCSS("filter", "none");
	const report = await dialog.evaluate((root) => {
		root.removeAttribute("data-sample-motion");
		return (
			root as HTMLElement & {
				motionReport?: {
					times: number[];
					exposure: number[];
					sourceWidths: number[];
					sources: string[];
				};
			}
		).motionReport;
	});
	if (!report) throw new Error("Expected motion measurements");
	expect(report.exposure.some((value) => value > 0)).toBe(true);
	expect(report.sources).toContain(originalSrc);
	expect(Math.min(...report.sourceWidths)).toBeGreaterThanOrEqual(originalWidth);
	expect(report.exposure.at(-1)).toBe(0);
	await testInfo.attach("local-frame-observations", {
		body: JSON.stringify(report),
		contentType: "application/json",
	});
	await page.screenshot({ path: testInfo.outputPath("sharp-glass.png") });
	await page.keyboard.press("Escape");
});
