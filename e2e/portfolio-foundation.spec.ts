import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"] as const) {
	test(`portfolio foundation remains usable in ${theme} mode`, async ({
		page,
		isMobile,
	}, testInfo) => {
		await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
		await page.addInitScript((value) => localStorage.setItem("theme", value), theme);
		const response = await page.goto("/");
		expect(response?.ok()).toBeTruthy();
		await expect(page.locator("html")).toHaveClass(new RegExp(`\\b${theme}\\b`));
		await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
		await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
		await expect(page.getByText("Yassine Chettouch", { exact: true }).first()).toBeVisible();
		await expect
			.poll(() =>
				page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
			)
			.toBe(true);
		await page.evaluate(() => document.fonts.ready);
		await expect(
			page.getByRole("region", { name: "Selected work", exact: true }),
		).toBeVisible();
		const projects = page.getByRole("article");
		expect(await projects.count()).toBeGreaterThan(0);
		for (const project of await projects.all()) {
			const heading = project.getByRole("heading", { level: 3 });
			await expect(heading).toBeVisible();
			await expect(project.getByRole("list", { name: "Technologies" })).toBeVisible();
			const layout = await project.evaluate((node) => {
				const copy = node.querySelector('[data-slot="project-copy"]');
				const title = node.querySelector("h3");
				const action = node.querySelector("[data-project-action]");
				const description = copy?.querySelector(":scope > p");
				if (!copy || !title || !action || !description)
					throw new Error("Incomplete project card");
				const t = title.getBoundingClientRect(),
					a = action.getBoundingClientRect();
				const style = getComputedStyle(copy);
				return {
					actionWidth: a.width,
					actionHeight: a.height,
					centerDifference: Math.abs(t.top + t.height / 2 - a.top - a.height / 2),
					insets: [
						style.paddingTop,
						style.paddingRight,
						style.paddingBottom,
						style.paddingLeft,
					],
					clamped: getComputedStyle(description).webkitLineClamp,
					overflow: node.scrollWidth > node.clientWidth + 1,
				};
			});
			expect(layout.actionWidth).toBe(40);
			expect(layout.actionHeight).toBe(40);
			expect(layout.centerDifference).toBeLessThan(0.5);
			expect(new Set(layout.insets).size).toBe(1);
			expect(layout.clamped).toBe("none");
			expect(layout.overflow).toBe(false);
		}

		const selectedWork = page.getByRole("link", { name: "Case studies", exact: true }).first();
		const contact = page.getByRole("link", { name: "Email", exact: true });
		await expect(contact).toHaveAttribute("data-appearance", "outline");
		if (!isMobile) {
			await selectedWork.focus();
			await page.keyboard.press("Tab");
			await expect(contact).toBeFocused();
			const focus = await contact.evaluate((element) => {
				const style = getComputedStyle(element);
				return { outline: style.outlineStyle, shadow: style.boxShadow };
			});
			expect(focus.outline !== "none" || focus.shadow !== "none").toBe(true);
		}
		await page.screenshot({ path: testInfo.outputPath(`portfolio-${theme}.png`) });
		await testInfo.attach(`portfolio-${theme}`, {
			path: testInfo.outputPath(`portfolio-${theme}.png`),
			contentType: "image/png",
		});
		await projects.first().scrollIntoViewIfNeeded();
		await page.screenshot({ path: testInfo.outputPath(`project-card-${theme}.png`) });
		if (isMobile) {
			await contact.tap();
		} else {
			await page.keyboard.press("Enter");
		}
		await expect(page).toHaveURL(/\/contact$/);
		await expect(page.getByRole("textbox", { name: "Email", exact: true })).toBeVisible();
	});
}
