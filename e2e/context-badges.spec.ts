import { expect, test } from "@playwright/test";

for (const [zone, city, time, difference] of [
	["America/New_York", "New York", "08:00 · UTC−4", "Rabat is 4 hours ahead"],
	["America/Los_Angeles", "Pacific time", "05:00 · UTC−7", "Rabat is 7 hours ahead"],
	["Europe/London", "London", "13:00 · UTC+1", "Rabat is 1 hour behind"],
	["Europe/Paris", "Paris", "14:00 · UTC+2", "Rabat is 2 hours behind"],
	["Asia/Dubai", "Dubai", "16:00 · UTC+4", "Rabat is 4 hours behind"],
	["Asia/Kuala_Lumpur", "Kuala Lumpur", "20:00 · UTC+8", "Rabat is 8 hours behind"],
]) {
	test.describe(`visitor in ${city}`, () => {
		test.use({ timezoneId: zone });
		test("compares the device zone at the same instant", async ({ page, isMobile }) => {
			test.skip(isMobile, "The market matrix runs on desktop; touch has its own checks");
			await page.clock.setFixedTime(new Date("2026-10-21T12:00:00Z"));
			await page.goto("/");
			await page.getByRole("button", { name: /Compare your time/ }).click();
			const panel = page.getByRole("dialog", { name: "Time difference" });
			await expect(panel.locator("dd").first()).toContainText("12:00 · UTC");
			await expect(panel.locator("dd").nth(1)).toContainText(time);
			await expect(panel.locator("dd").nth(1)).toContainText(city);
			await expect(panel.locator("dd").last()).toHaveText(difference);
		});
	});
}

for (const theme of ["light", "dark"] as const) {
	test(`context panels: geometry, tap, dismissal and timezone in ${theme}`, async ({
		page,
		isMobile,
	}, testInfo) => {
		await page.emulateMedia({ colorScheme: theme });
		await page.addInitScript((value) => localStorage.setItem("theme", value), theme);
		await page.clock.setFixedTime(new Date("2026-10-21T00:30:00Z"));
		await page.goto("/");
		const location = page.getByRole("button", { name: "About my location: Rabat, Morocco" });
		const clock = page.getByRole("button", { name: /Compare your time/ });
		await expect(page.getByRole("timer")).toHaveAccessibleName(
			"Current time 00:30:00 in Rabat, Morocco",
		);
		const before = await location.boundingBox();
		const resting = await location.evaluate((node) => ({
			fill: getComputedStyle(node).backgroundColor,
			line: getComputedStyle(node, "::after").borderColor,
		}));
		if (!isMobile) {
			await location.hover();
			await expect
				.poll(() => location.evaluate((node) => getComputedStyle(node).backgroundColor))
				.not.toBe(resting.fill);
		}
		await location[isMobile ? "tap" : "click"]();
		const panel = page.getByRole("dialog", { name: "Working together" });
		await expect(panel).toBeVisible();
		await expect(panel).toHaveCSS("opacity", "1");
		expect(
			await location.evaluate((node) => getComputedStyle(node, "::after").borderColor),
		).toBe(resting.line);
		await expect(panel.getByText("Email & scheduled calls", { exact: true })).toBeVisible();
		await expect(panel.getByRole("link", { name: "Discuss a project" })).toHaveAttribute(
			"href",
			"/contact",
		);
		expect(await location.boundingBox()).toEqual(before);
		const geometry = await panel.evaluate((node) => {
			const rect = node.getBoundingClientRect();
			return {
				left: rect.left,
				right: rect.right,
				width: rect.width,
				viewport: innerWidth,
				padding: getComputedStyle(node).padding,
			};
		});
		expect(geometry.left).toBeGreaterThanOrEqual(16);
		expect(geometry.right).toBeLessThanOrEqual(geometry.viewport - 16);
		expect(geometry.padding).toBe("0px");
		expect(geometry.left).toBeCloseTo(before?.x ?? 0, 1);
		const flag = await location.locator("svg").boundingBox();
		const chamber = await location.locator(".portfolio-context-chamber").boundingBox();
		expect(chamber?.width).toBe(28);
		expect(chamber?.height).toBe(28);
		const frame = await location
			.locator(".portfolio-context-chamber")
			.evaluate((node) => Number.parseFloat(getComputedStyle(node).paddingLeft));
		expect(frame).toBeGreaterThan(0);
		expect(frame).toBeLessThanOrEqual(1);
		expect(flag?.width).toBe(28 - 2 * frame);
		expect(flag?.height).toBe(28 - 2 * frame);
		for (const inset of [
			(flag?.x ?? 0) - (chamber?.x ?? 0),
			(flag?.y ?? 0) - (chamber?.y ?? 0),
			(chamber?.x ?? 0) + 28 - (flag?.x ?? 0) - (flag?.width ?? 0),
			(chamber?.y ?? 0) + 28 - (flag?.y ?? 0) - (flag?.height ?? 0),
		])
			expect(inset).toBeCloseTo(frame, 4);
		const seam = await location.locator(".portfolio-context-chamber").evaluate((node) => ({
			width: getComputedStyle(node, "::after").width,
			border: getComputedStyle(node).borderWidth,
			fill: getComputedStyle(node).backgroundColor,
		}));
		expect(Number.parseFloat(seam.width)).toBeLessThanOrEqual(1);
		expect(seam.border).toBe("0px");
		expect(seam.fill).toBe("rgba(0, 0, 0, 0)");
		const structure = await panel.evaluate((node) => {
			const heading = node.querySelector(".portfolio-context-panel-heading");
			const footer = node.querySelector(".portfolio-context-panel-footer");
			if (!heading || !footer) throw new Error("Missing panel bands");
			const close = heading.querySelector("button");
			const arrow = footer.querySelector(".foundation-button-icon-space");
			if (!close || !arrow) throw new Error("Missing panel chambers");
			return {
				headingHeight: heading.getBoundingClientRect().height,
				closeHeight: close.getBoundingClientRect().height,
				arrowWidth: arrow.getBoundingClientRect().width,
				chamberAlignment:
					arrow.getBoundingClientRect().left - close.getBoundingClientRect().left,
				actionHeight: footer.querySelector("a")?.getBoundingClientRect().height,
				headingFill: getComputedStyle(heading).backgroundColor,
				footerFill: getComputedStyle(footer).backgroundColor,
				panelFill: getComputedStyle(node).backgroundColor,
				rows: Array.from(node.querySelectorAll(".portfolio-context-fact"), (row) => {
					const key = row.querySelector("dt");
					const value = row.querySelector("dd");
					if (!key || !value) throw new Error("Missing fact cells");
					return {
						keyWidth: key.getBoundingClientRect().width,
						keyHeight: key.getBoundingClientRect().height,
						valueHeight: value.getBoundingClientRect().height,
						gap: value.getBoundingClientRect().left - key.getBoundingClientRect().right,
						topLine: Number.parseFloat(getComputedStyle(row).borderTopWidth),
						bottomLine: getComputedStyle(row).borderBottomWidth,
						middleLine: Number.parseFloat(getComputedStyle(key).borderRightWidth),
						valueLine: getComputedStyle(value).borderLeftWidth,
						keyFill: getComputedStyle(key).backgroundColor,
						valueFill: getComputedStyle(value).backgroundColor,
					};
				}),
			};
		});
		expect(structure.headingHeight).toBe(44);
		expect(structure.closeHeight).toBe(44);
		expect(structure.arrowWidth).toBe(44);
		expect(structure.chamberAlignment).toBe(0);
		expect(structure.actionHeight).toBe(44);
		expect(structure.headingFill).toBe(structure.footerFill);
		expect(structure.headingFill).not.toBe(structure.panelFill);
		for (const row of structure.rows) {
			expect(row.keyWidth).toBe(96);
			expect(row.keyHeight).toBe(row.valueHeight);
			expect(row.gap).toBe(0);
			expect(row.topLine).toBeGreaterThan(0);
			expect(row.topLine).toBeLessThanOrEqual(1);
			expect(row.middleLine).toBe(0);
			expect(row.keyFill).toBe(row.valueFill);
			expect(row.bottomLine).toBe("0px");
			expect(row.valueLine).toBe("0px");
		}
		await page.screenshot({ path: testInfo.outputPath(`location-${theme}.png`) });
		await clock[isMobile ? "tap" : "click"]();
		await expect(panel).not.toBeVisible();
		const timePanel = page.getByRole("dialog", { name: "Time difference" });
		await expect(timePanel).toBeVisible();
		await expect(page.getByRole("dialog")).toHaveCount(1);
		await expect(timePanel.locator("dd").first()).toContainText("00:30 · UTC");
		await expect(timePanel).toHaveCSS("opacity", "1");
		const timeBounds = await timePanel.boundingBox();
		const clockBounds = await clock.boundingBox();
		// Floating positioning rounds to the nearest physical pixel, including fractional DPR.
		const alignmentTolerance = await page.evaluate(() => 0.5 / devicePixelRatio);
		expect(
			Math.abs(
				(timeBounds?.x ?? 0) +
					(timeBounds?.width ?? 0) -
					(clockBounds?.x ?? 0) -
					(clockBounds?.width ?? 0),
			),
		).toBeLessThanOrEqual(alignmentTolerance);
		if (isMobile) {
			await expect(timePanel).toHaveCSS("transition-duration", "0.15s");
			await expect(timePanel).toHaveCSS("transition-property", "opacity");
			await expect(timePanel).toHaveCSS("transform", "none");
		}
		await page.screenshot({ path: testInfo.outputPath(`time-${theme}.png`) });
		await timePanel
			.getByRole("button", { name: "Close details" })
			[isMobile ? "tap" : "click"]();
		await expect(timePanel).not.toBeVisible();
		await clock[isMobile ? "tap" : "click"]();
		await expect(timePanel).toBeVisible();
		await page.locator("main")[isMobile ? "tap" : "click"]({ position: { x: 10, y: 380 } });
		await expect(timePanel).not.toBeVisible();
		if (!isMobile) {
			for (const width of [320, 375, 414, 768]) {
				await page.setViewportSize({ width, height: 780 });
				await location.click();
				await expect(panel).toHaveCSS("opacity", "1");
				expect(
					await page.evaluate(() => document.documentElement.scrollWidth),
				).toBeLessThanOrEqual(width);
				const small = await panel.boundingBox();
				expect(small?.x).toBeGreaterThanOrEqual(16);
				expect((small?.x ?? 0) + (small?.width ?? 0)).toBeLessThanOrEqual(width - 16);
				await page.keyboard.press("Escape");
				await expect(panel).not.toBeVisible();
			}
		}
	});
}

test("hover preview stays reachable, activation pins, and keyboard restores focus", async ({
	page,
	isMobile,
}) => {
	test.skip(isMobile, "Hover and hardware keyboard are exercised on desktop");
	await page.goto("/");
	// Hover events are not replayed if they arrive before the header hydrates.
	await expect(page.getByRole("timer")).toHaveAccessibleName(/^Current time/);
	await page.evaluate(() => document.fonts.ready);
	const location = page.getByRole("button", { name: "About my location: Rabat, Morocco" });
	const panel = page.getByRole("dialog", { name: "Working together" });
	await location.hover();
	await expect(panel).toBeVisible();
	await panel.getByRole("link").hover();
	await expect(panel).toBeVisible();
	await page.mouse.move(0, 600);
	await expect(panel).not.toBeVisible();
	await location.hover();
	await expect(panel).toBeVisible();
	await location[isMobile ? "tap" : "click"]();
	await page.mouse.move(0, 600);
	await expect(panel).toBeVisible();
	await page.keyboard.press("Escape");
	await expect(panel).not.toBeVisible();
	await location.blur();
	await page.keyboard.press("Tab");
	await location.focus();
	await expect(panel).toBeVisible();
	await expect(panel).toHaveCSS("transition-duration", "0s");
	await expect(location).toBeFocused();
	expect(await location.evaluate((node) => getComputedStyle(node, "::after").outlineWidth)).toBe(
		"2px",
	);
	await page.keyboard.press("Enter");
	await expect(panel).toBeVisible();
	await page.keyboard.press("Tab");
	await expect(panel.getByRole("button", { name: "Close details" })).toBeFocused();
	await page.keyboard.press("Tab");
	await expect(panel.getByRole("link")).toBeFocused();
	await page.keyboard.press("Escape");
	await expect(panel).not.toBeVisible();
	await expect(location).toBeFocused();
	await page.keyboard.press("Space");
	await expect(panel).toBeVisible();
	await page.keyboard.press("Escape");
	await page.emulateMedia({ reducedMotion: "reduce" });
	await location[isMobile ? "tap" : "click"]();
	await expect(panel).toBeVisible();
	await expect(panel).toHaveCSS("transition-duration", "0s");
	await expect(page.locator(".portfolio-clock-digit > span").first()).toHaveCSS(
		"animation-name",
		"none",
	);
	await page.mouse.wheel(0, 400);
	await expect(panel).not.toBeVisible();
});

for (const theme of ["light", "dark"] as const) {
	test(`clock carries advance one step without resizing in ${theme}`, async ({ page }) => {
		await page.emulateMedia({ colorScheme: theme, reducedMotion: "no-preference" });
		await page.addInitScript((value) => localStorage.setItem("theme", value), theme);
		await page.clock.setFixedTime(new Date("2026-10-28T08:59:59Z"));
		await page.goto("/");
		const timer = page.getByRole("timer");
		const reels = timer.locator(".portfolio-clock-digit > span");
		await expect(timer).toHaveAccessibleName(/:59:59 in Rabat/);
		await page.evaluate(() => document.fonts.ready);
		const before = await timer.boundingBox();
		await expect(reels.first()).toHaveCSS("animation-name", "none");

		await page.clock.setFixedTime(new Date("2026-10-28T09:00:00Z"));
		await expect(timer).toHaveAccessibleName(/:00:00 in Rabat/);
		const carry = await reels.evaluateAll((nodes) =>
			nodes.slice(-4).map((node) => ({
				digits: [...node.children].map((cell) => cell.getAttribute("data-digit")),
				animation: getComputedStyle(node).animationName,
				duration: getComputedStyle(node).animationDuration,
			})),
		);
		expect(carry.map((column) => column.digits)).toEqual([
			["5", "0"],
			["9", "0"],
			["5", "0"],
			["9", "0"],
		]);
		for (const column of carry) {
			expect(column.animation).toBe("portfolio-clock-step");
			expect(column.duration).toBe("0.18s");
		}
		expect(await timer.boundingBox()).toEqual(before);

		await page.emulateMedia({ reducedMotion: "reduce" });
		await page.clock.setFixedTime(new Date("2026-10-28T09:00:01Z"));
		await expect(timer).toHaveAccessibleName(/:00:01 in Rabat/);
		for (const reel of await reels.all()) {
			await expect(reel).toHaveCSS("animation-name", "none");
		}
	});
}
