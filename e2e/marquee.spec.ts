import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"] as const) {
	test(`Highlights keep equal spacing, direct drag and continuous travel in ${theme}`, async ({
		page,
		context,
		browserName,
	}, testInfo) => {
		await page.addInitScript((value) => localStorage.setItem("theme", value), theme);
		await page.emulateMedia({ colorScheme: theme, reducedMotion: "no-preference" });
		await page.goto("/");
		const button = page.getByRole("button", { name: /^Highlights:/ });
		const track = button.locator(".portfolio-marquee-track");
		await expect(button).toBeVisible();
		await page.evaluate(() => document.fonts.ready);
		await expect
			.poll(() => track.evaluate((node) => node.getAnimations()[0]?.playState))
			.toBe("running");
		const gaps = await track.evaluate((node) => {
			const items = [...node.querySelectorAll(".portfolio-marquee-item")];
			return items.slice(0, -1).flatMap((item, index) => {
				const text = item.children[0].getBoundingClientRect();
				const dot = item.children[1].getBoundingClientRect();
				const next = items[index + 1].getBoundingClientRect();
				return [dot.left - text.right, next.left - dot.right];
			});
		});
		for (const gap of gaps) expect(gap).toBeCloseTo(16, 1);
		const bounds = await button.boundingBox();
		if (!bounds) throw new Error("Missing highlights bounds");
		const x = bounds.x + bounds.width / 2;
		const y = bounds.y + bounds.height / 2;
		const position = () =>
			track.evaluate((node) => new DOMMatrix(getComputedStyle(node).transform).m41);
		await page.mouse.move(x, y);
		await page.mouse.down();
		const start = await position();
		await page.mouse.move(x - 60, y, { steps: 6 });
		expect((await position()) - start).toBeCloseTo(-60, 0);
		await expect(button).toHaveAttribute("data-dragging", "true");
		await page.mouse.up();
		await expect(button).toHaveAttribute("data-dragging", "false");
		await expect(button).toHaveAttribute("aria-pressed", "false");
		await expect
			.poll(() => track.evaluate((node) => node.getAnimations()[0]?.playState))
			.toBe("running");
		const firstTime = await track.evaluate((node) =>
			Number(node.getAnimations()[0].currentTime),
		);
		await expect
			.poll(() => track.evaluate((node) => Number(node.getAnimations()[0].currentTime)))
			.toBeGreaterThan(firstTime + 100);
		await button.click();
		await expect(button).toHaveAttribute("aria-pressed", "true");
		await expect
			.poll(() => track.evaluate((node) => node.getAnimations()[0]?.playState))
			.toBe("paused");
		await page.emulateMedia({ reducedMotion: "reduce" });
		await expect.poll(() => track.evaluate((node) => node.getAnimations().length)).toBe(0);
		await button.focus();
		await button.press("Space");
		await expect(button).toHaveAttribute("aria-pressed", "false");
		const beforeStep = await position();
		await button.press("ArrowRight");
		const width = await button
			.locator(".portfolio-marquee-cycle")
			.first()
			.evaluate((node) => node.getBoundingClientRect().width);
		const expected = -(((-(beforeStep - 80) % width) + width) % width);
		expect(await position()).toBeCloseTo(expected, 1);
		const frozen = await position();
		// A settled reduced-motion track must not drift after a manual step.
		await page.waitForTimeout(160);
		expect(await position()).toBe(frozen);
		if (testInfo.project.name === "mobile-chrome" && browserName === "chromium") {
			// Dispatch real browser touch input, exercising pan-y arbitration and pointer capture.
			const touch = await context.newCDPSession(page);
			await touch.send("Input.dispatchTouchEvent", {
				type: "touchStart",
				touchPoints: [{ x, y }],
			});
			const touchStart = await position();
			for (const distance of [15, 30, 45, 60]) {
				await touch.send("Input.dispatchTouchEvent", {
					type: "touchMove",
					touchPoints: [{ x: x - distance, y }],
				});
			}
			await touch.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
			const touchExpected = -(((-(touchStart - 60) % width) + width) % width);
			expect(await position()).toBeCloseTo(touchExpected, 0);
			await expect(button).toHaveAttribute("aria-pressed", "true");
			await touch.send("Input.dispatchTouchEvent", {
				type: "touchStart",
				touchPoints: [{ x, y }],
			});
			for (const distance of [15, 30, 45, 60]) {
				await touch.send("Input.dispatchTouchEvent", {
					type: "touchMove",
					touchPoints: [{ x, y: y - distance }],
				});
			}
			await touch.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
			await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);
			await touch.detach();
		}
	});
}
