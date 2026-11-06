import { expect, test } from "@playwright/test";

test.use({ deviceScaleFactor: 2, reducedMotion: "reduce" });

for (const theme of ["light", "dark"]) {
	for (const width of [320, 375, 390, 414, 768, 1280]) {
		test(`project story reflows at ${width}px in ${theme}`, async ({ page }) => {
			await page.setViewportSize({ width, height: 900 });
			await page.goto(
				`/iframe.html?id=components-projectcardgallery--long-metadata&viewMode=story&globals=theme:${theme}`,
			);
			const card = page.getByRole("article");
			await expect(card.getByRole("heading", { level: 3 })).toBeVisible();
			await page.evaluate(() => document.fonts.ready);
			const summary = card.locator('[data-slot="project-summary"]');
			await expect(card.locator('[data-slot="project-context"]')).toHaveText("SaaS");
			await expect(card.locator('[data-slot="project-capability"]')).toHaveText(
				"Document AI",
			);
			await expect(card.locator('[data-slot="project-role"]')).toHaveText("Product Engineer");
			await expect(summary).toContainText(
				"I designed Verto in Figma and built the complete translation platform",
			);
			await expect(card.locator('[data-slot="project-timing"]')).toHaveText("2026");
			const layout = await card.evaluate((node) => {
				const copy = node.querySelector('[data-slot="project-copy"]');
				const rail = node.querySelector('[data-slot="project-facts-rail"]');
				const body = node.querySelector(".portfolio-project-body");
				const header = node.querySelector(".portfolio-project-heading");
				const action = node.querySelector("[data-project-action]");
				const challenge = node.querySelector(".portfolio-project-challenge");
				const response = node.querySelector(".portfolio-project-response");
				const footer = node.querySelector('[data-slot="project-technology-rail"]');
				if (
					!copy ||
					!rail ||
					!body ||
					!header ||
					!action ||
					!challenge ||
					!response ||
					!footer
				)
					throw new Error("Incomplete project story");
				const c = copy.getBoundingClientRect();
				const r = rail.getBoundingClientRect();
				const b = body.getBoundingClientRect();
				const h = header.getBoundingClientRect();
				const q = challenge.getBoundingClientRect();
				const p = response.getBoundingClientRect();
				const f = footer.getBoundingClientRect();
				const a = action.getBoundingClientRect();
				const style = getComputedStyle(body);
				const facts = [...rail.querySelectorAll(".portfolio-project-meta-value")];
				const badges = [...rail.querySelectorAll('[data-slot="badge"]')];
				const badgeBoxes = badges.map((badge) => badge.getBoundingClientRect());
				const context = rail.querySelector('[data-slot="project-context"]');
				const timing = rail.querySelector(
					'[data-slot="project-timing"] [data-slot="badge"]',
				);
				const footerLabel = footer.querySelector(".portfolio-technology-label");
				if (!context || !timing || !footerLabel)
					throw new Error("Missing project context or technology label");
				const timingStyle = getComputedStyle(timing);
				const actionStyle = getComputedStyle(action);
				const footerStyle = getComputedStyle(footer);
				const footerLabelStyle = getComputedStyle(footerLabel);
				return {
					action: [a.width, a.height],
					overflow: document.documentElement.scrollWidth > innerWidth,
					readingOrder:
						h.bottom <= r.top &&
						r.bottom <= q.top &&
						q.bottom <= p.top &&
						p.bottom <= b.bottom &&
						b.bottom <= f.top,
					bodyReadable: [...body.querySelectorAll(".portfolio-project-lead")].every(
						(paragraph) => {
							const textStyle = getComputedStyle(paragraph);
							return (
								Number.parseFloat(textStyle.fontSize) >= 16 &&
								textStyle.webkitLineClamp === "none" &&
								paragraph.scrollHeight <= paragraph.clientHeight + 1
							);
						},
					),
					bodyInsets: [
						style.paddingTop,
						style.paddingRight,
						style.paddingBottom,
						style.paddingLeft,
					],
					storyAligned:
						Math.abs(q.left - h.left) < 0.5 &&
						Math.abs(p.left - h.left) < 0.5 &&
						Math.abs(q.width - p.width) < 0.5,
					oneStorySurface:
						[challenge, response].every(
							(region) =>
								getComputedStyle(region).backgroundColor === "rgba(0, 0, 0, 0)",
						) &&
						getComputedStyle(copy).backgroundColor !==
							getComputedStyle(footer).backgroundColor,
					factsFit:
						facts.length === 4 &&
						facts.every((fact) => fact.scrollWidth <= fact.clientWidth + 1),
					balancedFacts:
						badges.length === 4 &&
						badges.every((badge) => {
							const box = badge.getBoundingClientRect();
							const badgeStyle = getComputedStyle(badge);
							return (
								box.height === 28 &&
								badgeStyle.paddingLeft === badgeStyle.paddingRight &&
								box.left >= h.left &&
								box.right <= h.right &&
								badge.scrollWidth <= badge.clientWidth + 1
							);
						}),
					consistentBadges: badges.every((badge) => {
						const badgeStyle = getComputedStyle(badge);
						return (
							badgeStyle.textTransform === "uppercase" &&
							badgeStyle.fontFamily === timingStyle.fontFamily &&
							badgeStyle.fontWeight === "400" &&
							badgeStyle.backgroundColor === footerStyle.backgroundColor &&
							badgeStyle.color === footerLabelStyle.color &&
							badgeStyle.boxShadow === actionStyle.boxShadow
						);
					}),
					actionSharesFooterMaterial:
						actionStyle.backgroundColor === footerStyle.backgroundColor &&
						actionStyle.color === footerStyle.color,
					categoryAligned: Math.abs(context.getBoundingClientRect().left - h.left) < 0.5,
					metadataGrouped:
						c.width >= 720
							? Math.abs(badgeBoxes[3].right - h.right) < 0.5 &&
								badgeBoxes.every((box) => Math.abs(box.top - r.top) < 0.5) &&
								Math.abs(badgeBoxes[1].left - badgeBoxes[0].right - 10) < 0.5 &&
								Math.abs(badgeBoxes[3].left - badgeBoxes[2].right - 10) < 0.5 &&
								badgeBoxes[2].left - badgeBoxes[1].right >= 10
							: badgeBoxes.every((box, index) => {
									const previous = badgeBoxes[index - 1];
									return !previous || box.top > previous.top
										? Math.abs(box.left - h.left) < 0.5
										: Math.abs(box.left - previous.right - 10) < 0.5;
								}),
					timingReadable:
						timingStyle.textTransform === "uppercase" &&
						timingStyle.fontVariantNumeric.includes("tabular-nums"),
					flushRegions: [b, f].every(
						(region) =>
							Math.abs(region.left - c.left) < 0.5 &&
							Math.abs(c.right - region.right) < 0.5,
					),
					factsInHeader:
						Math.abs(r.left - h.left) < 0.5 &&
						Math.abs(r.right - h.right) < 0.5 &&
						rail.parentElement?.classList.contains("portfolio-project-header"),
					technologiesFit: [
						...footer.querySelectorAll(".portfolio-technology-cell"),
					].every((cell) => {
						const box = cell.getBoundingClientRect();
						return (
							box.left >= c.left &&
							box.right <= c.right &&
							cell.scrollWidth <= cell.clientWidth + 1
						);
					}),
				};
			});
			expect(layout.action).toEqual([40, 40]);
			expect(layout.overflow).toBe(false);
			expect(layout.readingOrder).toBe(true);
			expect(layout.bodyReadable).toBe(true);
			expect(layout.storyAligned).toBe(true);
			expect(layout.oneStorySurface).toBe(true);
			expect(layout.factsFit).toBe(true);
			expect(layout.balancedFacts).toBe(true);
			expect(layout.consistentBadges).toBe(true);
			expect(layout.actionSharesFooterMaterial).toBe(true);
			expect(layout.categoryAligned).toBe(true);
			expect(layout.metadataGrouped).toBe(true);
			expect(layout.timingReadable).toBe(true);
			expect(layout.flushRegions).toBe(true);
			expect(layout.factsInHeader).toBe(true);
			expect(layout.technologiesFit).toBe(true);
			expect(new Set(layout.bodyInsets).size).toBe(1);
			expect(Number.parseFloat(layout.bodyInsets[0] ?? "0")).toBeGreaterThanOrEqual(20);
			const preview = card.locator('[data-slot="project-preview"]');
			const before = await preview.boundingBox();
			await preview.hover();
			await expect(
				card.getByRole("region", {
					name: "A long case-study heading across narrow screens",
				}),
			).toBeVisible();
			const after = await preview.boundingBox();
			expect(after?.height).toBeCloseTo(before?.height ?? 0, 0);
			const link = card.getByRole("link", {
				name: "A long case-study heading across narrow screens",
				exact: true,
			});
			await link.focus();
			await expect(link).toBeFocused();
			expect(await link.evaluate((el) => getComputedStyle(el, "::after").boxShadow)).not.toBe(
				"none",
			);
			await expect(link).toHaveAttribute("href", "/case-studies/verto");
		});
	}

	test(`poster action keeps its chambers aligned while pending in ${theme}`, async ({ page }) => {
		await page.goto(
			`/iframe.html?id=components-media-galleryplaybutton--default&viewMode=story&globals=theme:${theme}`,
		);
		const button = page.getByRole("button", { name: "Play 1:40 video" });
		await expect(button).toBeVisible();
		await page.evaluate(() => document.fonts.ready);
		const before = await button.boundingBox();
		expect(before?.width).toBeGreaterThan(48);
		expect(before?.height).toBe(48);
		await button.hover();
		await button.focus();
		await page.keyboard.down("Space");
		const pressed = await button.boundingBox();
		expect(pressed?.width).toBe(before?.width);
		expect(pressed?.height).toBe(before?.height);
		await page.keyboard.up("Space");
		await page.goto(
			`/iframe.html?id=components-media-galleryplaybutton--pending&viewMode=story&globals=theme:${theme}`,
		);
		const pending = page.getByRole("button", { name: "Loading video" });
		await expect(pending).toHaveAttribute("aria-disabled", "true");
		await expect(pending).toHaveAttribute("aria-busy", "true");
		await page.evaluate(() => document.fonts.ready);
		const after = await pending.boundingBox();
		expect(after?.height).toBe(48);
		expect(after?.width).toBeGreaterThan(48);
		expect((await pending.locator(".foundation-button-icon-space").boundingBox())?.width).toBe(
			48,
		);
		await expect(pending.locator('[data-slot="spinner"]')).toBeVisible();
		await page.goto(
			`/iframe.html?id=components-media-galleryplaybutton--without-duration&viewMode=story&globals=theme:${theme}`,
		);
		const withoutDuration = page.getByRole("button", { name: "Play video", exact: true });
		await expect(withoutDuration).toBeVisible();
		expect((await withoutDuration.boundingBox())?.width).toBeGreaterThan(48);
		for (const action of [withoutDuration]) {
			const label = await action.locator(".portfolio-gallery-play-label").boundingBox();
			const frame = await action.boundingBox();
			expect(label?.x).toBeCloseTo((frame?.x ?? 0) + 48, 0);
			expect((label?.x ?? 0) + (label?.width ?? 0)).toBeCloseTo(
				(frame?.x ?? 0) + (frame?.width ?? 0),
				0,
			);
		}
		expect((await withoutDuration.boundingBox())?.height).toBe(before?.height);
	});
}
