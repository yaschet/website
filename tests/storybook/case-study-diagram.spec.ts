import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"]) {
	test(`Docs shows only the four quiet examples in ${theme}`, async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 900 });
		await page.goto(
			`/iframe.html?id=case-study-diagram--docs&viewMode=docs&globals=theme:${theme}`,
		);
		await expect(page.locator("html")).toHaveClass(new RegExp(`\\b${theme}\\b`));
		await expect(page.getByRole("button", { name: "Expand diagram" })).toHaveCount(4);
		await expect(page.getByRole("dialog")).toHaveCount(0);
		const docs = page.locator(".sbdocs-content");
		await expect(docs.locator("iframe")).toHaveCount(0);
		expect(
			await docs.evaluate((root) =>
				[...root.querySelectorAll<HTMLElement>("*")].some(
					(element) =>
						/auto|scroll/.test(getComputedStyle(element).overflowY) &&
						element.clientHeight > 0 &&
						element.scrollHeight > element.clientHeight + 1,
				),
			),
		).toBe(false);
		await expect(
			page.getByRole("button", { name: "Map", exact: true }).first(),
		).toHaveAttribute("aria-pressed", "true");
	});

	for (const width of [320, 390, 1280]) {
		for (const story of ["validation-loop", "one-to-many", "program-matching"]) {
			test(`${story} stays readable and preserves its step at ${width}px in ${theme}`, async ({
				page,
			}) => {
				await page.setViewportSize({ width, height: 900 });
				await page.goto(
					`/iframe.html?id=case-study-diagram--${story}&viewMode=story&globals=theme:${theme}`,
				);
				await expect(page.locator("html")).toHaveClass(new RegExp(`\\b${theme}\\b`));
				await expect(page.getByRole("button", { name: "Map", exact: true })).toBeVisible();
				await page.evaluate(() => document.fonts.ready);
				const diagram = page.locator('svg[role="img"]:visible');
				await expect(diagram).toHaveCount(1);
				const geometry = await diagram.evaluate((svg) => {
					const frame = svg.getBoundingClientRect();
					return [...svg.querySelectorAll<HTMLElement>("[data-figure-node]")].flatMap(
						(node) => {
							const box = node.getBoundingClientRect();
							const chamber = node
								.querySelector('[data-slot="icon-chamber"]')
								?.getBoundingClientRect();
							if (!chamber) throw new Error("Node chamber is missing");
							const scale = box.width / 224;
							if (scale > 1.001)
								throw new Error("A compact diagram must never upscale its nodes");
							for (const inset of [
								chamber.left - box.left,
								chamber.top - box.top,
								box.bottom - chamber.bottom,
							]) {
								if (Math.abs(inset / scale - 16) > 0.1)
									throw new Error("Unequal node insets");
							}
							return [...node.querySelectorAll("strong, strong + span")].map(
								(text) => {
									const label = text.getBoundingClientRect();
									return {
										text: text.textContent,
										insideNode:
											label.left >= box.left &&
											label.right <= box.right - 15 * scale &&
											label.top >= box.top &&
											label.bottom <= box.bottom,
										insideCanvas:
											box.left >= frame.left &&
											box.right <= frame.right + 0.1,
										renderedSize:
											Number.parseFloat(getComputedStyle(text).fontSize) *
											scale,
									};
								},
							);
						},
					);
				});
				expect(geometry.length).toBeGreaterThan(0);
				for (const label of geometry) {
					expect(label.insideNode, `${label.text} fits its node`).toBe(true);
					expect(label.insideCanvas).toBe(true);
					expect(
						label.renderedSize,
						`${label.text} remains readable`,
					).toBeGreaterThanOrEqual(12);
				}
				const materials = await page.locator("[data-figure]").evaluate((figure) => {
					const canvas = figure.querySelector<HTMLElement>("[data-figure-canvas]");
					const reading = figure.querySelector<HTMLElement>("[data-figure-reading]");
					if (!canvas || !reading) throw new Error("Figure regions are missing");
					const drawing = getComputedStyle(canvas);
					return {
						canvas: drawing.backgroundColor,
						reading: getComputedStyle(reading).backgroundColor,
						insets: [
							drawing.paddingTop,
							drawing.paddingRight,
							drawing.paddingBottom,
							drawing.paddingLeft,
						],
					};
				});
				expect(materials.canvas).not.toBe(materials.reading);
				expect(materials.insets).toEqual(["16px", "16px", "16px", "16px"]);
				const controls = await page
					.locator("[data-figure-step-track]")
					.evaluate((track) => {
						const style = getComputedStyle(track);
						return {
							gap: style.gap,
							insets: [
								style.paddingTop,
								style.paddingRight,
								style.paddingBottom,
								style.paddingLeft,
							],
							items: [...track.querySelectorAll("button")].map((button) => {
								const chamber = button.querySelector('[data-slot="icon-chamber"]');
								const glyph = chamber?.querySelector("svg");
								if (!chamber || !glyph) throw new Error("Step chamber is missing");
								const control = button.getBoundingClientRect();
								const icon = chamber.getBoundingClientRect();
								const ink = glyph.getBoundingClientRect();
								return {
									height: control.height,
									chamber: [icon.width, icon.height],
									glyph: [ink.width, ink.height],
									insets: [
										icon.top - control.top,
										control.bottom - icon.bottom,
										icon.left - control.left,
									],
								};
							}),
						};
					});
				expect(controls.insets).toEqual(["4px", "4px", "4px", "4px"]);
				expect(controls.gap).toBe("4px");
				for (const control of controls.items) {
					expect(control).toEqual({
						height: 40,
						chamber: [32, 32],
						glyph: [16, 16],
						insets: [4, 4, 4],
					});
				}
				const label = {
					"validation-loop": "Return",
					"one-to-many": "Outputs",
					"program-matching": "Resume",
				}[story];
				await page.getByRole("button", { name: label, exact: true }).click();
				await expect(
					page.getByRole("button", { name: label, exact: true }),
				).toHaveAttribute("aria-pressed", "true");
				await expect
					.poll(async () =>
						page.locator("[data-figure-step-track]").evaluate((track) => {
							const selected = track
								.querySelector('[aria-pressed="true"]')
								?.getBoundingClientRect();
							const underlay = track
								.querySelector("[data-figure-selection]")
								?.getBoundingClientRect();
							if (!selected || !underlay) return false;
							return [
								selected.x - underlay.x,
								selected.y - underlay.y,
								selected.width - underlay.width,
								selected.height - underlay.height,
							].every((difference) => Math.abs(difference) < 0.1);
						}),
					)
					.toBe(true);
				const readingGeometry = await page
					.locator("[data-figure-reading]")
					.evaluate((reading) => {
						const caption = reading.querySelector<HTMLElement>('[data-active="true"]');
						const icon = reading.querySelector('[data-slot="icon-chamber"][data-tone]');
						if (!caption || !icon) throw new Error("Caption geometry is missing");
						const text = caption.getBoundingClientRect();
						const chamber = icon.getBoundingClientRect();
						return Math.abs(
							text.top + text.height / 2 - chamber.top - chamber.height / 2,
						);
					});
				expect(readingGeometry).toBeLessThan(0.1);
				const opener = page.getByRole("button", { name: "Expand diagram" });
				await opener.click();
				const dialog = page.getByRole("dialog");
				await expect(dialog).toBeVisible();
				const expandedSizes = await dialog
					.locator('svg[role="img"]:visible')
					.evaluate((svg) => {
						const scale =
							svg.getBoundingClientRect().width /
							(svg as SVGSVGElement).viewBox.baseVal.width;
						return [
							...svg.querySelectorAll(
								"[data-figure-node] strong, [data-figure-node] strong + span",
							),
						].map((text) => Number.parseFloat(getComputedStyle(text).fontSize) * scale);
					});
				for (const size of expandedSizes) expect(size).toBeGreaterThanOrEqual(12);
				await expect(
					dialog.getByRole("button", { name: label, exact: true }),
				).toHaveAttribute("aria-pressed", "true");
				await dialog.getByRole("button", { name: "Map", exact: true }).click();
				await page.keyboard.press("Escape");
				await expect(dialog).toHaveCount(0);
				await expect(opener).toBeFocused();
				await expect(
					page.getByRole("button", { name: "Map", exact: true }),
				).toHaveAttribute("aria-pressed", "true");
				expect(
					await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
				).toBe(true);
			});
		}
	}

	test(`reduced motion leaves no path animation in ${theme}`, async ({ page }) => {
		await page.emulateMedia({ reducedMotion: "reduce" });
		await page.goto(
			`/iframe.html?id=case-study-diagram--validation-loop&viewMode=story&globals=theme:${theme}`,
		);
		await expect(page.locator("html")).toHaveClass(new RegExp(`\\b${theme}\\b`));
		await expect(page.getByRole("button", { name: "Map", exact: true })).toBeVisible();
		await page.getByRole("button", { name: "Return", exact: true }).click();
		expect(
			await page
				.locator('svg[role="img"]:visible')
				.evaluate((svg) => svg.getAnimations({ subtree: true }).length),
		).toBe(0);
	});

	test(`figure contrast and disclosure remain usable in ${theme}`, async ({ page }) => {
		await page.goto(
			`/iframe.html?id=case-study-diagram--validation-loop&viewMode=story&globals=theme:${theme}`,
		);
		await expect(page.locator("html")).toHaveClass(new RegExp(`\\b${theme}\\b`));
		const disclosure = page.getByRole("button", { name: "Full explanation" });
		await expect(disclosure).toHaveAttribute("aria-expanded", "false");
		await disclosure.focus();
		await page.keyboard.press("Enter");
		await expect(disclosure).toHaveAttribute("aria-expanded", "true");
		await expect(page.getByRole("list")).toBeVisible();
		const transcriptType = await page
			.getByRole("list")
			.locator("p")
			.first()
			.evaluate((paragraph) => {
				const style = getComputedStyle(paragraph);
				return { size: style.fontSize, leading: style.lineHeight };
			});
		expect(transcriptType).toEqual({ size: "14px", leading: "20px" });
		const hierarchy = await page
			.getByRole("list")
			.locator("strong")
			.evaluateAll((titles) =>
				titles.map((title) => {
					const style = getComputedStyle(title);
					return {
						size: style.fontSize,
						leading: style.lineHeight,
						weight: style.fontWeight,
					};
				}),
			);
		for (const title of hierarchy)
			expect(title).toEqual({ size: "16px", leading: "24px", weight: "600" });
		await expect(disclosure).toHaveCSS("font-size", "16px");
		const perimeter = await page.locator("[data-figure]").evaluate((figure) => {
			const style = getComputedStyle(figure, "::after");
			return {
				content: style.content,
				frame: style.boxShadow,
				level: style.zIndex,
				events: style.pointerEvents,
			};
		});
		expect(perimeter.content).toBe('""');
		expect(perimeter.frame).not.toBe("none");
		expect(perimeter.level).toBe("2");
		expect(perimeter.events).toBe("none");
		const chambers = await disclosure
			.locator('[data-slot="icon-chamber"]')
			.evaluateAll((elements) =>
				elements.map((element) => {
					const box = element.getBoundingClientRect();
					return {
						width: box.width,
						height: box.height,
						center: box.top + box.height / 2,
					};
				}),
			);
		expect(chambers).toHaveLength(2);
		for (const box of chambers) {
			expect(box.width).toBe(40);
			expect(box.height).toBe(40);
		}
		expect(chambers[0].center).toBe(chambers[1].center);
		await page.keyboard.press("Enter");
		await expect(disclosure).toHaveAttribute("aria-expanded", "false");
		await expect(page.getByRole("list")).toHaveCount(0);
		await expect(disclosure).toBeFocused();

		for (const step of ["Map", "Return", "Write"]) {
			const button = page.getByRole("button", { name: step, exact: true });
			await button.focus();
			await page.keyboard.press("Enter");
			const alignment = await page.locator("[data-figure-step-track]").evaluate((track) => {
				const selected = track
					.querySelector('[aria-pressed="true"]')
					?.getBoundingClientRect();
				const underlay = track
					.querySelector("[data-figure-selection]")
					?.getBoundingClientRect();
				if (!selected || !underlay) throw new Error("Selection geometry is missing");
				return [
					selected.x - underlay.x,
					selected.y - underlay.y,
					selected.width - underlay.width,
					selected.height - underlay.height,
				];
			});
			for (const difference of alignment) expect(Math.abs(difference)).toBeLessThan(0.1);
			const contrast = await page.locator("[data-figure-canvas]").evaluate((canvas) => {
				const swatch = document.createElement("canvas");
				swatch.width = swatch.height = 1;
				const context = swatch.getContext("2d");
				if (!context) throw new Error("Color measurement is unavailable");
				const luminance = (color: string) => {
					context.clearRect(0, 0, 1, 1);
					context.fillStyle = color;
					context.fillRect(0, 0, 1, 1);
					const [r, g, b] = [...context.getImageData(0, 0, 1, 1).data]
						.slice(0, 3)
						.map((channel) => {
							const value = channel / 255;
							return value <= 0.04045
								? value / 12.92
								: ((value + 0.055) / 1.055) ** 2.4;
						});
					return r * 0.2126 + g * 0.7152 + b * 0.0722;
				};
				const ratio = (a: string, b: string) => {
					const values = [luminance(a), luminance(b)].sort((x, y) => y - x);
					return (values[0] + 0.05) / (values[1] + 0.05);
				};
				const svg = [...canvas.querySelectorAll("svg")].find(
					(element) => element.getBoundingClientRect().width > 0,
				);
				if (!svg) throw new Error("Visible diagram is missing");
				const nodeText = [
					...svg.querySelectorAll(
						"[data-figure-node] strong, [data-figure-node] strong + span",
					),
				].map((text) => {
					const node = text.closest("[data-figure-node]");
					if (!node) throw new Error("Node material is missing");
					return {
						label: text.textContent,
						ratio: ratio(
							getComputedStyle(text).color,
							getComputedStyle(node).backgroundColor,
						),
					};
				});
				const backgrounds = [
					getComputedStyle(canvas).backgroundColor,
					getComputedStyle(svg.querySelector("rect") ?? canvas).fill,
				];
				const paths = [...svg.querySelectorAll("g[data-active] > path")].flatMap((path) =>
					backgrounds.map((background) =>
						ratio(getComputedStyle(path).stroke, background),
					),
				);
				return { nodeText, paths, animations: svg.getAnimations({ subtree: true }).length };
			});
			for (const text of contrast.nodeText)
				expect(text.ratio, `${step}: ${text.label}`).toBeGreaterThanOrEqual(4.5);
			for (const path of contrast.paths)
				expect(path, `${step}: connector`).toBeGreaterThanOrEqual(3);
			expect(contrast.animations).toBe(0);
		}
	});
}
