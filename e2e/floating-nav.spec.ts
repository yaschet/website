import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"] as const) {
	test(`Inverse dock and a single moving tooltip stay coherent in ${theme}`, async ({
		page,
	}, testInfo) => {
		await page.addInitScript((value) => localStorage.setItem("theme", value), theme);
		await page.emulateMedia({ colorScheme: theme, reducedMotion: "no-preference" });
		await page.goto("/");
		const nav = page.getByRole("navigation", { name: "Main navigation" });
		const home = nav.getByRole("link", { name: "Home", exact: true });
		await expect(home).toBeVisible();
		await expect(nav).toHaveCSS("opacity", "1");
		// The dock is server-rendered; wait for its client handlers before hovering.
		await expect(nav.getByRole("button", { name: /^Theme: Switch to/ })).toBeVisible();
		const colors = await nav.evaluate((node) => {
			const context = document.createElement("canvas").getContext("2d");
			if (!context) throw new Error("Missing color test context");
			const bytes = (color: string) => {
				context.fillStyle = color;
				context.fillRect(0, 0, 1, 1);
				return [...context.getImageData(0, 0, 1, 1).data].slice(0, 3);
			};
			const style = getComputedStyle(node);
			return { surface: bytes(style.backgroundColor), ink: bytes(style.color) };
		});
		if (theme === "dark") {
			expect(Math.min(...colors.surface)).toBeGreaterThan(235);
			expect(Math.max(...colors.ink)).toBeLessThan(30);
		} else {
			expect(Math.max(...colors.surface)).toBeLessThan(30);
			expect(Math.min(...colors.ink)).toBeGreaterThan(235);
		}
		await expect(nav.locator(".portfolio-nav-underlay")).toHaveCount(2);
		expect(
			await nav
				.locator(".portfolio-nav-underlay-clip")
				.evaluate((node) => getComputedStyle(node).overflow),
		).toBe("hidden");
		await home.hover();
		const tooltip = page.getByRole("tooltip");
		await expect(tooltip).toHaveAccessibleName("Home");
		const shell = await tooltip.elementHandle();
		const contact = nav.getByRole("link", { name: "Contact", exact: true });
		// Interrupt hover travel; both planes always stay below every glyph.
		for (const link of [contact, home, contact, home, contact]) {
			await link.hover();
			const geometry = await link.evaluate((node) => {
				const box = node.getBoundingClientRect();
				return {
					hit: node.contains(
						document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2),
					),
					layer: getComputedStyle(node).zIndex,
					plane: getComputedStyle(
						document.querySelector(".portfolio-nav-underlay-clip") as Element,
					).zIndex,
				};
			});
			expect(geometry.hit).toBe(true);
			expect(Number(geometry.layer)).toBeGreaterThan(Number(geometry.plane));
		}
		await expect(tooltip).toHaveAccessibleName("Contact");
		await expect(page.locator('[role="tooltip"]')).toHaveCount(1);
		expect(
			await shell?.evaluate((node) => node === document.querySelector('[role="tooltip"]')),
		).toBe(true);
		await expect(home).toHaveAttribute("aria-current", "page");
		await expect(contact).not.toHaveAttribute("aria-current");
		await expect(contact).toHaveAttribute(
			"aria-describedby",
			(await tooltip.getAttribute("id")) ?? "",
		);
		await expect(tooltip).toHaveCSS("height", "36px");
		await expect(tooltip).toHaveCSS("opacity", "1");
		const dockBox = await nav.boundingBox();
		const tipBox = await tooltip.boundingBox();
		const inset = await nav.evaluate((node) =>
			Number.parseFloat(getComputedStyle(node).paddingTop),
		);
		expect((dockBox?.y ?? 0) - (tipBox?.y ?? 0) - (tipBox?.height ?? 0)).toBeCloseTo(inset, 0);
		await expect(tooltip.locator(".portfolio-tooltip-copy")).toHaveCount(1);
		await expect(tooltip.locator(".portfolio-tooltip-copy")).toHaveCSS("padding", `${inset}px`);
		const targetBox = await contact.boundingBox();
		await expect
			.poll(async () => {
				const box = await tooltip.boundingBox();
				return Math.abs((box?.x ?? 0) + (box?.width ?? 0) / 2 - (targetBox?.x ?? 0) - 20);
			})
			.toBeLessThan(1);
		await page.screenshot({ path: testInfo.outputPath(`navigation-${theme}.png`) });
		await shell?.dispose();
	});

	test(`dock theme boundary, reopening and keyboard focus stay coherent in ${theme}`, async ({
		page,
	}, testInfo) => {
		await page.addInitScript((value) => localStorage.setItem("theme", value), theme);
		await page.emulateMedia({ colorScheme: theme, reducedMotion: "no-preference" });
		await page.goto("/");
		const nav = page.getByRole("navigation", { name: "Main navigation" });
		const home = nav.getByRole("link", { name: "Home", exact: true });
		const contact = nav.getByRole("link", { name: "Contact", exact: true });
		await expect(nav).toHaveCSS("opacity", "1");
		await expect(nav.getByRole("button", { name: /^Theme: Switch to/ })).toBeVisible();
		await home.hover();
		const tooltip = page.getByRole("tooltip");
		await expect(tooltip).toHaveAccessibleName("Home");
		const shell = await tooltip.elementHandle();
		await contact.hover();
		await expect(tooltip).toHaveAccessibleName("Contact");
		const dockBox = await nav.boundingBox();
		await tooltip.hover();
		// A pointer can cross the trigger gap and read the hint without losing it.
		await page.waitForTimeout(180);
		await expect(tooltip).toHaveAccessibleName("Contact");
		const themeControl = nav.getByRole("button", { name: /^Theme:/ });
		await themeControl.hover();
		await expect(tooltip).toHaveAccessibleName("Theme");
		await expect
			.poll(async () => {
				const box = await tooltip.boundingBox();
				return Math.abs(
					(box?.x ?? 0) + (box?.width ?? 0) - (dockBox?.x ?? 0) - (dockBox?.width ?? 0),
				);
			})
			.toBeLessThan(1);
		await expect(themeControl).toHaveAttribute("data-highlighted", "true");
		await expect(home).toHaveAttribute("data-highlighted", "true");
		await expect
			.poll(() =>
				nav
					.locator(".portfolio-nav-active")
					.evaluate((node) => new DOMMatrix(getComputedStyle(node).transform).m41),
			)
			.toBe(0);
		await expect(nav.locator(".portfolio-nav-hover")).toHaveCSS("opacity", "0");
		// The hover plane fades at Contact rather than traveling back to Home.
		expect(
			await nav
				.locator(".portfolio-nav-hover")
				.evaluate((node) => new DOMMatrix(getComputedStyle(node).transform).m41),
		).toBe(160);
		await expect(themeControl).toHaveCSS("mix-blend-mode", "normal");
		// Once fully hidden, the next hint opens at its new anchor, without cross-dock travel.
		await page.mouse.move(0, 0);
		await expect(tooltip).toHaveCount(0);
		await expect(page.locator('.portfolio-tooltip[data-state="closed"]')).toHaveCSS(
			"opacity",
			"0",
		);
		await home.hover();
		await expect(tooltip).toHaveAccessibleName("Home");
		const reopened = await tooltip.boundingBox();
		expect(reopened?.x).toBeCloseTo(dockBox?.x ?? 0, 0);
		await page.keyboard.press("Escape");
		await expect(tooltip).toHaveCount(0);
		await page.mouse.move(0, 0);
		await page.emulateMedia({ reducedMotion: "reduce" });
		await page.keyboard.press("Tab");
		await home.focus();
		await expect(tooltip).toHaveAccessibleName("Home");
		// WebKit follows macOS link navigation: Option-Tab includes links.
		await home.press(testInfo.project.name === "mobile-safari" ? "Alt+Tab" : "Tab");
		await expect(tooltip).toHaveAccessibleName("About");
		expect(
			await shell?.evaluate((node) => node === document.querySelector('[role="tooltip"]')),
		).toBe(true);
		await page.keyboard.press("Escape");
		await expect(tooltip).toHaveCount(0);
		await shell?.dispose();
		// The confidential note shares the section material rather than another gray well.
		const note = page.getByRole("heading", { name: "Confidential work" });
		await note.scrollIntoViewIfNeeded();
		await expect(note).toBeVisible();
		await page.screenshot({ path: testInfo.outputPath(`confidential-${theme}.png`) });
		expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
			true,
		);
	});
}
