import { expect, test } from "@playwright/test";

// Verify layout and keyboard behavior without software-rendering the decorative shader.
test.use({
	launchOptions: async ({ browserName }, use) => {
		await use(browserName === "chromium" ? { args: ["--disable-webgl"] } : {});
	},
});

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
			const frames = [...document.querySelectorAll("main .portfolio-grid-frame")];
			const cards = [...section.querySelectorAll(".portfolio-project-card")];
			const card = section.querySelector('[data-slot="project-card"]');
			const preview = card?.querySelector('[data-slot="project-preview"]');
			if (!card || !preview) throw new Error("Missing first project preview");
			const rail = section.getBoundingClientRect();
			const outer = card.getBoundingClientRect();
			const media = preview.getBoundingClientRect();
			// Mobile frames and project cards share the full viewport rail.
			const mobileBleed = window.matchMedia("(width < 40rem)").matches;
			const frameLeft = mobileBleed ? 0 : rail.left;
			const frameRight = mobileBleed ? window.innerWidth : rail.right;
			return {
				mobileBleed,
				workInsets: [rail.left, window.innerWidth - rail.right],
				frameRailOffsets: frames.flatMap((surface) => {
					const box = surface.getBoundingClientRect();
					return [box.left - frameLeft, box.right - frameRight];
				}),
				cardRailOffsets: cards.flatMap((surface) => {
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
		for (const offset of [...workLayout.frameRailOffsets, ...workLayout.cardRailOffsets])
			expect(Math.abs(offset)).toBeLessThan(0.5);
		if (workLayout.mobileBleed)
			for (const inset of workLayout.workInsets) expect(Math.abs(inset)).toBeLessThan(0.5);
		expect(Math.max(...workLayout.previewInsets)).toBeLessThanOrEqual(1);
		expect(
			Math.max(...workLayout.previewInsets) - Math.min(...workLayout.previewInsets),
		).toBeLessThan(0.5);
		for (const gap of workLayout.gaps) expect(Math.abs(gap - 40)).toBeLessThanOrEqual(1 / 64);
		expect(workLayout.nestedFrame).toBe(false);
		const projects = page.getByRole("article");
		await expect(projects.getByRole("heading", { level: 3 })).toHaveText([
			"Verto — AI Translation Platform",
			"University Program Matching",
			"Student Applications & Document Collection",
			"Agency CRM & Billing",
		]);
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
				const description = copy?.querySelector('[data-slot="project-summary"]');
				const body = copy?.querySelector(".portfolio-project-body");
				if (!copy || !title || !action || !description || !body)
					throw new Error("Incomplete project card");
				const t = title.getBoundingClientRect(),
					a = action.getBoundingClientRect();
				const style = getComputedStyle(body);
				return {
					actionWidth: a.width,
					actionHeight: a.height,
					centerDifference: Math.abs(t.top + t.height / 2 - a.top - a.height / 2),
					bodyInsets: [
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
			expect(new Set(layout.bodyInsets).size).toBe(1);
			expect(Number.parseFloat(layout.bodyInsets[0] ?? "0")).toBeGreaterThanOrEqual(20);
			expect(layout.clamped).toBe("none");
			expect(Number.isInteger(layout.leading)).toBe(true);
			expect(layout.overflow).toBe(false);
		}
		const projectLink = projects.first().locator("a.portfolio-project-link");
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
			"Some client work stays private. I can discuss the problems, my contribution and the engineering approach without sharing confidential material. Ask about relevant work.",
		);
		const call = note.getByRole("link", { name: "Ask about relevant work" });
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
			const cardCopy = card?.querySelector(".portfolio-project-body");
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
				frame: getComputedStyle(node, "::after").boxShadow,
				projectFrame: getComputedStyle(card, "::after").boxShadow,
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
		expect(noteLayout.frame).toBe(noteLayout.projectFrame);
		expect(noteLayout.frame).not.toBe("none");
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

		const booking = page
			.locator("#hero")
			.getByRole("link", { name: "Book a call", exact: true });
		const selectedWork = page.getByRole("link", { name: "View my work", exact: true });
		await expect(selectedWork).toHaveAttribute("data-appearance", "outline");
		await expect(booking).toHaveAttribute("target", "_blank");
		if (!isMobile) {
			await booking.focus();
			await page.keyboard.press("Tab");
			await expect(selectedWork).toBeFocused();
			const focus = await selectedWork.evaluate((element) => {
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
			await selectedWork.tap();
		} else {
			await selectedWork.press("Enter");
		}
		await expect(page).toHaveURL(/\/#work$/);
		expect(await work.evaluate((node) => Math.round(node.getBoundingClientRect().top))).toBe(
			20,
		);
		await expect(projects.first().locator('[data-slot="project-preview"]')).toBeInViewport();
	});
}
