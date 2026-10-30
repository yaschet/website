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
		const work = page.getByRole("region", { name: "Selected work", exact: true });
		await expect(work).toBeVisible();
		const workLayout = await work.evaluate((section) => {
			const surfaces = [
				...document.querySelectorAll("main .portfolio-grid-frame"),
				...section.querySelectorAll(".portfolio-project-card"),
			];
			const card = section.querySelector('[data-slot="project-card"]');
			const preview = card?.querySelector('[data-slot="project-preview"]');
			if (!card || !preview) throw new Error("Missing first project preview");
			const rail = section.getBoundingClientRect();
			const outer = card.getBoundingClientRect();
			const media = preview.getBoundingClientRect();
			const cards = [...section.querySelectorAll(".portfolio-project-card")];
			return {
				railOffsets: surfaces.flatMap((surface) => {
					const box = surface.getBoundingClientRect();
					return [box.left - rail.left, box.right - rail.right];
				}),
				previewInsets: [
					media.top - outer.top,
					media.left - outer.left,
					outer.right - media.right,
				],
				gaps: cards
					.slice(1)
					.map(
						(surface, i) =>
							surface.getBoundingClientRect().top -
							cards[i].getBoundingClientRect().bottom,
					),
				nestedFrame: !!section.querySelector(".portfolio-grid-frame"),
			};
		});
		for (const offset of workLayout.railOffsets) expect(Math.abs(offset)).toBeLessThan(0.5);
		expect(Math.max(...workLayout.previewInsets)).toBeLessThanOrEqual(1);
		expect(
			Math.max(...workLayout.previewInsets) - Math.min(...workLayout.previewInsets),
		).toBeLessThan(0.5);
		for (const gap of workLayout.gaps) expect(gap).toBe(40);
		expect(workLayout.nestedFrame).toBe(false);
		const projects = page.getByRole("article");
		expect(await projects.count()).toBeGreaterThan(0);
		for (const project of await projects.all()) {
			const heading = project.getByRole("heading", { level: 3 });
			await expect(heading).toBeVisible();
			const technologies = project.getByRole("list", { name: "Technologies" });
			await expect(technologies).toBeVisible();
			await expect(technologies.getByRole("button")).toHaveCount(0);
			const layout = await project.evaluate((node) => {
				const copy = node.querySelector('[data-slot="project-copy"]');
				const title = node.querySelector("h3");
				const action = node.querySelector("[data-project-action]");
				const description = copy?.querySelector(".portfolio-project-description");
				if (!copy || !title || !action || !description)
					throw new Error("Incomplete project card");
				const t = title.getBoundingClientRect(),
					a = action.getBoundingClientRect();
				const overview = copy.querySelector('[data-slot="project-overview"]');
				if (!overview) throw new Error("Missing project overview");
				const style = getComputedStyle(overview);
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
					leading: Number.parseFloat(getComputedStyle(description).lineHeight),
					overflow: node.scrollWidth > node.clientWidth + 1,
				};
			});
			expect(layout.actionWidth).toBe(40);
			expect(layout.actionHeight).toBe(40);
			expect(layout.centerDifference).toBeLessThan(0.5);
			expect(new Set(layout.insets).size).toBe(1);
			expect(layout.clamped).toBe("none");
			expect(Number.isInteger(layout.leading)).toBe(true);
			expect(layout.overflow).toBe(false);
		}
		const projectLink = projects.first().getByRole("link");
		if (!isMobile) {
			const card = projects.first();
			await projectLink.scrollIntoViewIfNeeded();
			const before = await card.boundingBox();
			await page.emulateMedia({ reducedMotion: "no-preference" });
			const restingAction = await projectLink
				.locator("[data-project-action]")
				.evaluate((node) => getComputedStyle(node).backgroundColor);
			await projectLink.hover();
			await expect
				.poll(() =>
					projectLink
						.locator("[data-project-action]")
						.evaluate((node) => getComputedStyle(node).backgroundColor),
				)
				.not.toBe(restingAction);
			expect(await card.evaluate((node) => getComputedStyle(node).boxShadow)).toBe("none");
			expect(
				await card.evaluate((node) => getComputedStyle(node, "::before").boxShadow),
			).toBe("none");
			expect(await card.boundingBox()).toEqual(before);
			await card.screenshot({ path: testInfo.outputPath(`project-hover-${theme}.png`) });
			await page.mouse.move(0, 0);
			await projectLink.focus();
			await expect(projectLink).toBeFocused();
			expect(
				await projectLink.evaluate((node) => getComputedStyle(node, "::after").boxShadow),
			).not.toBe("none");
			await page.emulateMedia({ reducedMotion: "reduce" });
			await projectLink.hover();
			expect(
				await projectLink
					.locator(".portfolio-reel-icon > [data-reel-out]")
					.evaluate((node) => getComputedStyle(node).transform),
			).toBe("none");
		}

		const note = work.locator(".portfolio-confidential-work");
		await expect(note.getByRole("heading", { name: "Confidential work" })).toBeVisible();
		await expect(note.locator("p")).toHaveText(
			"Other work spans legal translation, education, onboarding, operations, and reconciliation. Most of it is private. Happy to discuss it in a call.",
		);
		const call = note.getByRole("link", { name: "in a call" });
		await expect(call).toHaveAttribute("href", "/contact");
		await expect(note.getByRole("button")).toHaveCount(0);
		await call.focus();
		await expect(call).toBeFocused();
		if (!isMobile) await page.mouse.move(0, 0);
		// Compare the same resting material after the project caption loses focus/hover.
		await expect
			.poll(() => projects.first().evaluate((node) => getComputedStyle(node).borderTopColor))
			.toBe(await note.evaluate((node) => getComputedStyle(node).borderTopColor));
		const noteLayout = await note.evaluate((node) => {
			const inset = node.querySelector(".portfolio-confidential-note");
			const title = node.querySelector("h3");
			const description = node.querySelector("p");
			const card = node.closest("section")?.querySelector('[data-slot="project-card"]');
			const cardCopy = card?.querySelector('[data-slot="project-overview"]');
			if (!inset || !title || !description || !card || !cardCopy)
				throw new Error("Missing confidential-work composition");
			const style = getComputedStyle(inset);
			const material = getComputedStyle(node);
			const projectMaterial = getComputedStyle(card);
			const outer = node.getBoundingClientRect();
			const record = card.getBoundingClientRect();
			const label = title.getBoundingClientRect();
			const copy = description.getBoundingClientRect();
			return {
				insets: [
					style.paddingTop,
					style.paddingRight,
					style.paddingBottom,
					style.paddingLeft,
				],
				projectInset: getComputedStyle(cardCopy).paddingLeft,
				cardRails: [outer.left - record.left, outer.right - record.right],
				textRail: copy.left - label.left,
				stacked: copy.top >= label.bottom,
				gap: style.rowGap,
				textAlign: style.textAlign,
				background: material.backgroundColor,
				projectBackground: projectMaterial.backgroundColor,
				bodyBackground: getComputedStyle(document.body).backgroundColor,
				border: [material.borderTopWidth, material.borderTopStyle, material.borderTopColor],
				projectBorder: [
					projectMaterial.borderTopWidth,
					projectMaterial.borderTopStyle,
					projectMaterial.borderTopColor,
				],
				titleSize: Number.parseFloat(getComputedStyle(title).fontSize),
				copySize: Number.parseFloat(getComputedStyle(description).fontSize),
				overflow: node.scrollWidth > node.clientWidth,
			};
		});
		expect(new Set(noteLayout.insets).size).toBe(1);
		expect(noteLayout.insets[0]).toBe(noteLayout.projectInset);
		for (const offset of [...noteLayout.cardRails, noteLayout.textRail])
			expect(Math.abs(offset)).toBeLessThan(0.5);
		expect(noteLayout.stacked).toBe(true);
		expect(noteLayout.gap).toBe("20px");
		expect(noteLayout.textAlign).toBe("start");
		expect(noteLayout.background).toBe(noteLayout.projectBackground);
		expect(noteLayout.background).not.toBe("rgba(0, 0, 0, 0)");
		expect(noteLayout.background).not.toBe(noteLayout.bodyBackground);
		expect(noteLayout.border).toEqual(noteLayout.projectBorder);
		expect(noteLayout.border[1]).toBe("solid");
		expect(noteLayout.titleSize).toBeGreaterThan(noteLayout.copySize);
		expect(noteLayout.overflow).toBe(false);
		expect(await call.evaluate((node) => getComputedStyle(node).boxShadow)).not.toBe("none");
		await note.scrollIntoViewIfNeeded();
		await page.screenshot({ path: testInfo.outputPath(`confidential-work-${theme}.png`) });
		if (!isMobile) {
			const viewport = page.viewportSize();
			if (!viewport) throw new Error("Missing responsive review viewport");
			for (const width of [320, 375, 414, 768]) {
				await page.setViewportSize({ width, height: 900 });
				await expect(call).toBeVisible();
				expect(
					await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
				).toBe(true);
				await note.screenshot({
					path: testInfo.outputPath(`confidential-work-${theme}-${width}.png`),
				});
				await projects.first().screenshot({
					path: testInfo.outputPath(`project-card-${theme}-${width}.png`),
				});
			}
			await page.setViewportSize(viewport);
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
			await contact.press("Enter");
		}
		await expect(page).toHaveURL(/\/contact$/);
		await expect(page.getByRole("textbox", { name: "Email", exact: true })).toBeVisible();
	});

	test(`project caption keeps its loading glyph centered in ${theme}`, async ({ page }) => {
		await page.emulateMedia({ reducedMotion: "reduce" });
		await page.addInitScript((value) => localStorage.setItem("theme", value), theme);
		let releaseRequest = () => {};
		const heldRequest = new Promise<void>((resolve) => {
			releaseRequest = resolve;
		});
		await page.route(/\/case-studies\/clearway-phoenix(?:\?|$)/, async (route) => {
			await heldRequest;
			await route.continue();
		});
		try {
			await page.goto("/");
			const copy = page
				.getByRole("article", { name: "Program Matching Engine", exact: true })
				.locator('[data-slot="project-copy"]');
			const link = copy.getByRole("link", { name: "Program Matching Engine", exact: true });
			await link.scrollIntoViewIfNeeded();
			const before = await copy.boundingBox();
			await link.click();
			const feedback = link.locator('[data-slot="link-feedback"][data-loading]');
			await expect(feedback).toBeVisible();
			const chamber = await link.locator("[data-project-action]").boundingBox();
			const spinner = await feedback.locator('[data-slot="spinner"]').boundingBox();
			if (!chamber || !spinner) throw new Error("Missing project navigation feedback");
			expect(spinner.width).toBe(16);
			expect(spinner.height).toBe(16);
			expect(
				Math.abs(chamber.x + chamber.width / 2 - spinner.x - spinner.width / 2),
			).toBeLessThan(0.5);
			expect(
				Math.abs(chamber.y + chamber.height / 2 - spinner.y - spinner.height / 2),
			).toBeLessThan(0.5);
			expect(await copy.boundingBox()).toEqual(before);
			await expect(link).toHaveAccessibleName("Program Matching Engine");
		} finally {
			releaseRequest();
		}
		await expect(
			page.getByRole("heading", { level: 1, name: "Program Matching Engine" }),
		).toBeVisible();
	});
}
