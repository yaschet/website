import { expect, test } from "@playwright/test";

for (const ratio of [1, 1.8, 2.625]) {
	test.describe(`hairlines at ${ratio} device pixels per CSS pixel`, () => {
		test.use({ deviceScaleFactor: ratio });

		for (const theme of ["light", "dark"] as const) {
			test(`shared frames, flag insets and flush media in ${theme}`, async ({
				page,
				browserName,
			}) => {
				await page.addInitScript((value) => localStorage.setItem("theme", value), theme);
				await page.goto("/");
				await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
				// Firefox can report the requested ratio on about:blank, then reset after navigation.
				const actualRatio = await page.evaluate(() => devicePixelRatio);
				test.skip(
					browserName === "firefox" &&
						ratio !== 1 &&
						Math.abs(actualRatio - ratio) > 0.00005,
					"This Firefox runner does not apply the fractional deviceScaleFactor override; DPR 1 remains covered, and fractional coverage runs in Chromium and WebKit.",
				);
				const geometry = await page.evaluate(() => {
					const get = (selector: string) => {
						const node = document.querySelector(selector);
						if (!node) throw new Error(`Missing hairline surface: ${selector}`);
						return node;
					};
					const frames = [
						".portfolio-context-badge",
						".portfolio-hero-frame",
						".portfolio-project-card",
					].map((selector) => ({
						selector,
						style: getComputedStyle(get(selector), "::after"),
					}));
					const seams = [
						[".portfolio-context-chamber", "width"],
						[".portfolio-grid-row", "height"],
						[".portfolio-project-preview", "height"],
						[".portfolio-technology-rail", "height"],
						[".portfolio-technology-cell", "width"],
					] as const;
					const chamber = get(".portfolio-location .portfolio-context-chamber");
					const flag = get(".portfolio-location svg").getBoundingClientRect();
					const chamberRect = chamber.getBoundingClientRect();
					const card = get(".portfolio-project-card");
					const cardRect = card.getBoundingClientRect();
					const media = get(".portfolio-project-preview img").getBoundingClientRect();
					const marquee = get(".portfolio-marquee-cycle");
					return {
						ratio: devicePixelRatio,
						frames: frames.map(({ selector, style: frame }) => {
							// Flush mobile hero/cards retain only their top and bottom hairlines.
							const horizontalOnly =
								matchMedia("(width < 40rem)").matches &&
								selector !== ".portfolio-context-badge";
							const shadows = frame.boxShadow.split(/,(?![^()]*\))/);
							if (shadows.length !== (horizontalOnly ? 2 : 1))
								throw new Error(`Unexpected frame edges: ${frame.boxShadow}`);
							const widths = shadows.map((shadow, index) => {
								const lengths = (shadow.match(/-?(?:\d*\.)?\d+px\b/g) ?? []).map(
									Number.parseFloat,
								);
								if (
									!shadow.includes("inset") ||
									lengths.length !== 4 ||
									lengths[0] !== 0 ||
									lengths[2] !== 0 ||
									(horizontalOnly
										? lengths[3] !== 0 ||
											(index === 0 ? lengths[1] <= 0 : lengths[1] >= 0)
										: lengths[1] !== 0)
								)
									throw new Error(`Expected sharp inset hairlines: ${shadow}`);
								return horizontalOnly ? Math.abs(lengths[1]) : lengths[3];
							});
							if (widths.some((width) => width !== widths[0]))
								throw new Error("Unequal frame hairlines");
							return {
								width: widths[0],
								color: shadows[0]
									.replace(/-?(?:\d*\.)?\d+px\b/g, "")
									.replace(/\binset\b/g, "")
									.trim(),
							};
						}),
						seams: seams.map(([selector, dimension]) =>
							Number.parseFloat(
								getComputedStyle(get(selector), "::after")[dimension],
							),
						),
						flagInsets: [
							flag.left - chamberRect.left,
							chamberRect.right - flag.right,
							flag.top - chamberRect.top,
							chamberRect.bottom - flag.bottom,
						],
						chamberFill: getComputedStyle(chamber).backgroundColor,
						mediaEdges: [media.left - cardRect.left, cardRect.right - media.right],
						layoutBorder: getComputedStyle(card).borderWidth,
						marqueeText: marquee.textContent,
						phraseGap: getComputedStyle(marquee).gap,
						cycleGap: getComputedStyle(marquee).paddingInlineEnd,
						contextGap: getComputedStyle(get(".portfolio-context-rail")).columnGap,
					};
				});
				expect(geometry.ratio).toBeCloseTo(ratio, 4);
				for (const frame of geometry.frames) expect(frame.width * ratio).toBeCloseTo(1, 2);
				expect(new Set(geometry.frames.map((frame) => frame.color)).size).toBe(1);
				for (const width of [...geometry.seams, ...geometry.flagInsets])
					expect(width * ratio).toBeCloseTo(1, 1);
				expect(geometry.chamberFill).not.toBe("rgba(0, 0, 0, 0)");
				for (const gap of geometry.mediaEdges) expect(Math.abs(gap)).toBeLessThan(0.02);
				expect(geometry.layoutBorder).toBe("0px");
				expect(geometry.marqueeText).not.toContain("·");
				expect(geometry.phraseGap).toBe(geometry.contextGap);
				expect(geometry.cycleGap).toBe(geometry.contextGap);
			});
		}
	});
}
