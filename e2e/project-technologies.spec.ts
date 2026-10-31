import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"] as const) {
	test(`project technologies stay readable and stable in ${theme} mode`, async ({
		page,
		isMobile,
	}, testInfo) => {
		// Hold the first window while the development page hydrates and media loads.
		await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
		await page.addInitScript((value) => localStorage.setItem("theme", value), theme);
		await page.goto("/");
		await page.evaluate(() => document.fonts.ready);
		const erp = page.getByRole("article", { name: "Agency CRM & Billing", exact: true });
		await expect(erp.locator('[data-slot="project-copy"]')).toBeVisible();
		await expect(erp.locator('[data-slot="project-preview"]')).toHaveCount(0);
		await expect(erp.getByRole("region", { name: "No preview available" })).toHaveCount(0);
		const project = page.getByRole("article", {
			name: "University Program Matching",
			exact: true,
		});
		const rail = project.locator('[data-slot="project-technology-rail"]');
		const trigger = project.getByRole("button", { name: /^Stack: all \d+ technologies for / });
		await rail.scrollIntoViewIfNeeded();
		// Inspect the initial frame without racing the automatic exchange.
		await trigger.focus();
		await page.emulateMedia({ reducedMotion: "no-preference" });
		await expect(rail).toHaveAttribute("data-running", "false");
		await expect(rail).toHaveAttribute("data-motion-active", "true");
		await expect
			.poll(() =>
				rail.locator("img").evaluateAll((nodes) =>
					nodes.every((node) => {
						const image = node as HTMLImageElement;
						return image.complete && image.naturalWidth > 0;
					}),
				),
			)
			.toBe(true);

		const cells = rail.locator(".portfolio-technology-cell:visible");
		await expect(cells).toHaveCount(isMobile ? 3 : 6);
		await expect(rail.locator(".portfolio-technology-current")).toHaveCount(isMobile ? 3 : 6);
		const widths = await cells.evaluateAll((nodes) =>
			nodes.map((node) => node.getBoundingClientRect().width),
		);
		expect(Math.max(...widths) - Math.min(...widths)).toBeLessThan(0.5);
		const railGeometry = () =>
			rail.evaluate((node) => {
				const box = node.getBoundingClientRect();
				return {
					x: box.x + window.scrollX,
					y: box.y + window.scrollY,
					width: box.width,
					height: box.height,
				};
			});
		const before = await railGeometry();
		expect(before?.height).toBe(64);
		const currentTechnologies = () =>
			rail
				.locator(".portfolio-technology-current")
				.evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-technology")));
		const initialTechnologies = await currentTechnologies();
		const core = ["Laravel", "OpenAI", "MeiliSearch"];
		expect(initialTechnologies.slice(0, core.length)).toEqual(core);
		for (const [title, highlights] of [
			["Document Translation With Editable Tables", ["Next.js", "OpenAI", "Google Docs API"]],
			["Student Applications & Document Collection", ["Next.js", "Laravel", "AWS Textract"]],
			["Agency CRM & Billing", ["Laravel", "Cash Plus", "MySQL"]],
		] as const) {
			await expect
				.poll(() =>
					page
						.getByRole("article", { name: title, exact: true })
						.locator(".portfolio-technology-current")
						.evaluateAll((nodes) =>
							nodes.slice(0, 3).map((node) => node.getAttribute("data-technology")),
						),
				)
				.toEqual(highlights);
		}
		const verticalInsets = await rail
			.locator(".portfolio-technology-current .portfolio-technology-identity")
			.evaluateAll((nodes) =>
				nodes.map((node) => {
					const identity = node.getBoundingClientRect();
					const cell = node
						.closest(".portfolio-technology-cell")
						?.getBoundingClientRect();
					if (!cell) throw new Error("Missing technology cell");
					return [identity.top - cell.top, cell.bottom - identity.bottom];
				}),
			);
		for (const [top, bottom] of verticalInsets) {
			expect(top).toBeCloseTo(8, 2);
			expect(bottom).toBeCloseTo(8, 2);
		}
		const rotating = rail.locator('[data-rotation="rotating"]');
		await expect(rotating).toHaveCount(3);
		expect(
			await rotating.evaluateAll((nodes) =>
				nodes.map((node) => getComputedStyle(node).getPropertyValue("--technology-phase")),
			),
		).toEqual(["100ms", "50ms", "0ms"]);
		await page.keyboard.press("Tab");
		await page.mouse.move(0, 0);
		await expect(rail).toHaveAttribute("data-running", "true");
		const nextFrame = isMobile
			? ["PHP", "Livewire", "Alpine.js"]
			: [...core, "MySQL", "Redis", "PHP"];
		await expect.poll(currentTechnologies, { timeout: 4_000 }).toEqual(nextFrame);
		expect(new Set(await currentTechnologies()).size).toBe(isMobile ? 3 : 6);
		// Tab can scroll the next control into view; the rail's document geometry must stay fixed.
		expect(await railGeometry()).toEqual(before);
		const hoverBounds = await rail.boundingBox();
		if (!isMobile && hoverBounds) {
			await page.mouse.move(hoverBounds.x + 20, hoverBounds.y + 20);
			await expect(rail).toHaveAttribute("data-running", "false");
			await page.mouse.move(0, 0);
			await expect(rail).toHaveAttribute("data-running", "true");
		}

		const triggerBounds = await trigger.boundingBox();
		expect(triggerBounds?.width).toBeCloseTo(widths[0], 1);
		expect(triggerBounds?.height).toBeCloseTo(64, 2);
		await expect(trigger).toHaveText("Stack");
		const sharedBoundary = () =>
			rail.evaluate((node) => {
				const line = getComputedStyle(node, "::after");
				return {
					insets: [line.top, line.right, line.left],
					height: line.height,
					color: line.backgroundColor,
					aboveFill: Number(line.zIndex) > 0,
					pointerEvents: line.pointerEvents,
				};
			});
		const boundary = await sharedBoundary();
		expect(boundary.insets).toEqual(["0px", "0px", "0px"]);
		expect(Number.parseFloat(boundary.height)).toBeGreaterThan(0);
		expect(boundary.aboveFill).toBe(true);
		expect(boundary.pointerEvents).toBe("none");
		if (!isMobile) {
			await trigger.hover();
			expect(await sharedBoundary()).toEqual(boundary);
			expect(await trigger.boundingBox()).toEqual(triggerBounds);
			await page.mouse.down();
			expect(await sharedBoundary()).toEqual(boundary);
			expect(await trigger.boundingBox()).toEqual(triggerBounds);
			await page.mouse.up();
		} else {
			await trigger.click();
		}
		const dialog = page.getByRole("dialog", { name: /^Technology stack for / });
		await expect(dialog).toBeVisible();
		expect(await sharedBoundary()).toEqual(boundary);
		expect(await trigger.boundingBox()).toEqual(triggerBounds);
		await expect
			.poll(() =>
				dialog.evaluate((node) =>
					node
						.getAnimations({ subtree: true })
						.some((animation) => animation.playState === "running"),
				),
			)
			.toBe(false);
		const fullStack = dialog.getByRole("list", { name: "Full technology stack" });
		await expect(fullStack.getByRole("listitem")).toHaveCount(8);
		await expect(fullStack.locator(".portfolio-technology-label")).toHaveText([
			"Laravel",
			"OpenAI",
			"MeiliSearch",
			"PHP",
			"Livewire",
			"Alpine.js",
			"MySQL",
			"Redis",
		]);
		const dialogBounds = await dialog.boundingBox();
		const viewport = page.viewportSize();
		expect(dialogBounds).not.toBeNull();
		expect(viewport).not.toBeNull();
		if (!dialogBounds || !viewport) throw new Error("Missing stack popup geometry");
		expect(dialogBounds.x).toBeGreaterThanOrEqual(0);
		expect(dialogBounds.y).toBeGreaterThanOrEqual(0);
		expect(dialogBounds.x + dialogBounds.width).toBeLessThanOrEqual(viewport.width);
		expect(dialogBounds.y + dialogBounds.height).toBeLessThanOrEqual(viewport.height);
		if (!before) throw new Error("Missing technology rail geometry");
		expect(dialogBounds.width).toBeLessThanOrEqual(before.width + 1);
		expect(
			Math.abs(dialogBounds.x + dialogBounds.width - before.x - before.width),
		).toBeLessThan(1);
		for (const name of [
			"Laravel",
			"PHP",
			"Livewire",
			"Alpine.js",
			"MySQL",
			"Redis",
			"MeiliSearch",
			"OpenAI",
		]) {
			await expect(fullStack.getByText(name, { exact: true })).toBeVisible();
		}
		await expect(fullStack.locator('[data-mark="php-elephant"]')).toBeVisible();
		await expect(fullStack.locator('[data-mark="mysql-dolphin"]')).toBeVisible();
		const panelRegions = await dialog.evaluate((node) => {
			const heading = node.querySelector(".portfolio-technology-popover-heading");
			const grid = node.querySelector(".portfolio-technology-list");
			const viewport = node.querySelector(".portfolio-technology-popover-body");
			const footer = node.querySelector(".portfolio-technology-popover-footer");
			if (!heading || !grid || !viewport || !footer)
				throw new Error("Missing joined panel regions");
			const firstName = grid.querySelector(".portfolio-technology-label");
			const title = heading.querySelector(".portfolio-technology-popover-title");
			if (!firstName || !title) throw new Error("Missing panel text alignment");
			const head = heading.getBoundingClientRect();
			const body = viewport.getBoundingClientRect();
			const foot = footer.getBoundingClientRect();
			return {
				widths: [head.width, body.width, foot.width],
				edges: [head.x, body.x, foot.x],
				gaps: [body.top - head.bottom, foot.top - body.bottom],
				gridShadow: getComputedStyle(grid).boxShadow,
				nameAlignment:
					firstName.getBoundingClientRect().left - title.getBoundingClientRect().left,
			};
		});
		expect(new Set(panelRegions.widths).size).toBe(1);
		expect(new Set(panelRegions.edges).size).toBe(1);
		expect(panelRegions.gaps).toEqual([0, 0]);
		expect(panelRegions.gridShadow).toBe("none");
		expect(panelRegions.nameAlignment).toBeCloseTo(0, 2);
		const stackGeometry = await fullStack.getByRole("listitem").evaluateAll((items) =>
			items.map((item) => {
				const chamber = item.querySelector(".portfolio-technology-mark-chamber");
				const label = item.querySelector(".portfolio-technology-label");
				const reference = item.querySelector(".portfolio-technology-reference");
				if (!chamber || !label || !reference)
					throw new Error("Missing symbol, caption or reference");
				const box = item.getBoundingClientRect();
				const symbol = chamber.getBoundingClientRect();
				const text = label.getBoundingClientRect();
				const style = getComputedStyle(reference);
				const grid = item.closest(".portfolio-technology-list");
				if (!grid) throw new Error("Missing technology grid surface");
				const caption = getComputedStyle(label);
				return {
					width: box.width,
					height: box.height,
					chamberWidth: symbol.width,
					chamberHeight: symbol.height,
					centerOffset: Math.abs(symbol.y + symbol.height / 2 - text.y - text.height / 2),
					gap: text.x + Number.parseFloat(caption.paddingLeft) - symbol.x - symbol.width,
					distinctChamber:
						getComputedStyle(chamber).backgroundColor !==
						getComputedStyle(grid).backgroundColor,
					labelInsets: [
						caption.paddingTop,
						caption.paddingRight,
						caption.paddingBottom,
						caption.paddingLeft,
					],
					insets: [
						style.paddingTop,
						style.paddingRight,
						style.paddingBottom,
						style.paddingLeft,
					],
				};
			}),
		);
		for (const cell of stackGeometry) {
			expect(cell.width).toBeCloseTo(stackGeometry[0].width, 1);
			expect(cell.height).toBeCloseTo(64, 2);
			expect(cell.chamberWidth).toBeCloseTo(40, 2);
			expect(cell.chamberHeight).toBeCloseTo(40, 2);
			expect(cell.centerOffset).toBeLessThan(0.5);
			expect(cell.gap).toBeCloseTo(12, 2);
			expect(cell.insets).toEqual(["12px", "12px", "12px", "12px"]);
			expect(cell.labelInsets).toEqual(["0px", "0px", "0px", "0px"]);
			expect(cell.distinctChamber).toBe(true);
		}
		await dialog.getByRole("button", { name: "Pause logo rotation" }).click();
		await expect(dialog.getByRole("button", { name: "Resume logo rotation" })).toHaveAttribute(
			"aria-pressed",
			"true",
		);
		// A pause stops future exchanges, while an in-flight exchange finishes clearly.
		await expect
			.poll(() =>
				rail.locator(".portfolio-technology-current").evaluateAll((nodes) =>
					nodes.every((node) => {
						const style = getComputedStyle(node);
						return (
							style.opacity === "1" && ["none", "blur(0px)"].includes(style.filter)
						);
					}),
				),
			)
			.toBe(true);
		await dialog.screenshot({ path: testInfo.outputPath(`technology-stack-${theme}.png`) });
		await page.keyboard.press("Escape");
		await expect(trigger).toBeFocused();
		await expect(rail).toHaveAttribute("data-running", "false");
		await trigger.click();
		await expect(dialog.getByRole("button", { name: "Resume logo rotation" })).toBeVisible();
		await dialog.getByRole("button", { name: "Resume logo rotation" }).click();
		await dialog.getByRole("button", { name: "Close technology stack" }).click();
		await expect(trigger).toBeFocused();
		await expect(rail).toHaveAttribute("data-running", "false");
		await page.keyboard.press("Tab");
		await page.mouse.move(0, 0);
		await expect(rail).toHaveAttribute("data-running", "true");
		await page.getByRole("heading", { level: 1 }).scrollIntoViewIfNeeded();
		await expect(rail).toHaveAttribute("data-running", "false");
		await page.emulateMedia({ reducedMotion: "reduce" });
		await rail.scrollIntoViewIfNeeded();
		await expect(rail).toHaveAttribute("data-running", "false");
		await expect(rail).toHaveAttribute("data-motion-active", "false");
		await trigger.click();
		await expect(dialog.getByRole("button", { name: /logo rotation/ })).toHaveCount(0);
		await page.keyboard.press("Escape");

		// A platform and its database each get one mark and one readable name.
		await page
			.getByRole("article", {
				name: "Document Translation With Editable Tables",
				exact: true,
			})
			.getByRole("button", { name: /^Stack: all / })
			.click();
		const translationStack = page.getByRole("dialog", { name: /^Technology stack for / });
		await expect(translationStack.getByText("Supabase", { exact: true })).toBeVisible();
		await expect(translationStack.getByText("PostgreSQL", { exact: true })).toBeVisible();
		await expect(translationStack.getByText("Stripe", { exact: true })).toBeVisible();
		await expect(translationStack.getByRole("listitem")).toHaveCount(9);
		await expect(translationStack.locator('[data-layout="inline"]')).toHaveCount(9);
		await page.keyboard.press("Escape");
	});

	test(`technology references remain stable during interaction in ${theme} mode`, async ({
		page,
		isMobile,
	}) => {
		await page.emulateMedia({ colorScheme: theme, reducedMotion: "no-preference" });
		await page.addInitScript((value) => localStorage.setItem("theme", value), theme);
		await page.goto("/");
		const project = page.getByRole("article", {
			name: "Document Translation With Editable Tables",
			exact: true,
		});
		const rail = project.locator('[data-slot="project-technology-rail"]');
		await rail.scrollIntoViewIfNeeded();
		const openai = rail.getByRole("link", { name: /^OpenAI:/ });
		await openai.focus();
		await expect(openai).toHaveAttribute("href", "https://openai.com/api/");
		const rotatingLink = rail.locator('[data-rotation="rotating"]').last().getByRole("link");
		await rotatingLink.focus();
		const destination = await rotatingLink.getAttribute("href");
		const label = await rotatingLink.getAttribute("aria-label");
		if (!destination || !label) throw new Error("Missing technology reference");
		const before = await rotatingLink.boundingBox();
		await expect(rotatingLink).toHaveAttribute("target", "_blank");
		await expect(rotatingLink).toHaveAttribute("rel", "noopener noreferrer");
		await expect(rotatingLink).toHaveAccessibleName(/opens in a new tab/);
		await expect(rail).toHaveAttribute("data-running", "false");
		// Wait beyond a full exchange interval: the focused link must keep its destination.
		await page.waitForTimeout(2500);
		await expect(rotatingLink).toBeFocused();
		await expect(rotatingLink).toHaveAttribute("href", destination);
		await expect(rotatingLink).toHaveAttribute("aria-label", label);
		expect(await rotatingLink.boundingBox()).toEqual(before);
		if (!isMobile) {
			await rotatingLink.evaluate((node) => node.blur());
			await rotatingLink.hover();
			await expect(rail).toHaveAttribute("data-running", "false");
			const hoveredDestination = await rotatingLink.getAttribute("href");
			if (!hoveredDestination) throw new Error("Missing hovered reference");
			await page.waitForTimeout(2500);
			await expect(rotatingLink).toHaveAttribute("href", hoveredDestination);
			expect(await rotatingLink.boundingBox()).toEqual(before);
		}
		// Exercise a real native new-tab link without loading a third-party application.
		const linkDestination = await rotatingLink.getAttribute("href");
		if (!linkDestination) throw new Error("Missing link destination");
		await page.context().route(linkDestination, (route) =>
			route.fulfill({
				contentType: "text/html",
				body: "<title>Official reference</title>",
			}),
		);
		const [referenceTab] = await Promise.all([
			page.waitForEvent("popup"),
			rotatingLink.click(),
		]);
		await expect(referenceTab).toHaveURL(linkDestination);
		await referenceTab.close();
		await page.mouse.move(0, 0);
		await project.getByRole("button", { name: /^Stack: all / }).click();
		const stack = page.getByRole("dialog", { name: /^Technology stack for / });
		await expect(stack.getByRole("link", { name: /^OpenAI:/ })).toHaveAttribute(
			"href",
			"https://openai.com/api/",
		);
		await expect(stack.getByRole("link")).toHaveCount(9);
		await page.keyboard.press("Escape");
		await page.emulateMedia({ reducedMotion: "reduce" });
		await expect(rail).toHaveAttribute("data-motion-active", "false");
		const quietLink = rail.getByRole("link").first();
		await quietLink.focus();
		expect(await quietLink.evaluate((node) => getComputedStyle(node).transitionDuration)).toBe(
			"0s",
		);
	});
}

test.describe("stack frames on fractional-density displays", () => {
	// Native 1px borders rounded to 0.56px here while the drawn seams stayed 1px.
	test.use({ deviceScaleFactor: 1.8 });
	for (const theme of ["light", "dark"] as const) {
		test(`stack edges stay fixed through motion and interaction in ${theme} mode`, async ({
			page,
			isMobile,
		}) => {
			await page.emulateMedia({ colorScheme: theme, reducedMotion: "no-preference" });
			await page.addInitScript((value) => localStorage.setItem("theme", value), theme);
			await page.goto("/");
			const trigger = page
				.getByRole("article", {
					name: "Document Translation With Editable Tables",
					exact: true,
				})
				.getByRole("button", { name: /^Stack: all / });
			await trigger.click();
			const dialog = page.getByRole("dialog", { name: /^Technology stack for / });
			const close = dialog.getByRole("button", { name: "Close technology stack" });
			const first = dialog.getByRole("link").first();
			const paint = () =>
				dialog.evaluate((node) => {
					const frameSelectors = [
						".portfolio-technology-popover-icon",
						".portfolio-technology-close",
						".portfolio-technology-mark-chamber",
					];
					const frames = [node, ...node.querySelectorAll(frameSelectors.join(","))];
					const seams = [
						[".portfolio-technology-popover-heading", "::after", "height"],
						[".portfolio-technology-popover-footer", "::before", "height"],
						["li:nth-child(2)", "::before", "width"],
						["li:nth-child(3)", "::after", "height"],
					] as const;
					const bounds = node.getBoundingClientRect();
					return {
						hairline: Number.parseFloat(
							getComputedStyle(node).getPropertyValue("--foundation-hairline"),
						),
						bounds: [bounds.x, bounds.y, bounds.width, bounds.height],
						frames: frames.map((element) => {
							const frame = getComputedStyle(element, "::before");
							const inset = / 0px 0px 0px ([\d.]+)px inset$/;
							return {
								thickness: Number(frame.boxShadow.match(inset)?.[1]),
								color: frame.boxShadow.replace(inset, ""),
								pointerEvents: frame.pointerEvents,
							};
						}),
						seams: seams.map(([selector, pseudo, dimension]) => {
							const element = node.querySelector(selector);
							if (!element) throw new Error(`Missing stack seam: ${selector}`);
							const seam = getComputedStyle(element, pseudo);
							return {
								thickness: Number.parseFloat(seam[dimension]),
								color: seam.backgroundColor,
								pointerEvents: seam.pointerEvents,
							};
						}),
					};
				});
			// Inspect during entry, not just after the panel has settled.
			expect(
				await dialog.evaluate((node) => {
					const style = getComputedStyle(node);
					return [style.transform, style.scale, style.translate, style.filter];
				}),
			).toEqual(["none", "none", "none", "none"]);
			const resting = await paint();
			for (const edge of [...resting.frames, ...resting.seams]) {
				expect(edge.thickness).toBeCloseTo(resting.hairline, 2);
				expect(edge.color).toBe(resting.seams[0].color);
				expect(edge.pointerEvents).toBe("none");
			}
			if (!isMobile) {
				await first.hover();
				expect(await paint()).toEqual(resting);
				await page.mouse.down();
				expect(await paint()).toEqual(resting);
				await page.mouse.move(0, 0);
				await page.mouse.up();
			}
			await close.focus();
			await page.keyboard.press("Tab");
			await expect(first).toBeFocused();
			expect(await first.evaluate((node) => node.matches(":focus-visible"))).toBe(true);
			expect(await paint()).toEqual(resting);
			expect(await first.evaluate((node) => getComputedStyle(node).boxShadow)).toBe("none");
			await page.keyboard.press("Escape");
			await expect(trigger).toBeFocused();
			// Reverse an unfinished open/close sequence; it must not retain blurred content.
			await trigger.click();
			await trigger.click();
			await trigger.click();
			await expect(dialog).toBeVisible();
			await expect
				.poll(() =>
					dialog.evaluate((node) =>
						node
							.getAnimations({ subtree: true })
							.some((animation) => animation.playState === "running"),
					),
				)
				.toBe(false);
			expect(await paint()).toEqual(resting);
			await page.keyboard.press("Escape");
			const viewport = page.viewportSize();
			if (!viewport) throw new Error("Missing viewport");
			await page.setViewportSize({ width: viewport.width, height: 360 });
			await trigger.click();
			await dialog.getByRole("link").last().scrollIntoViewIfNeeded();
			await expect(close).toBeInViewport();
			await expect(
				dialog.getByRole("button", { name: "Pause logo rotation" }),
			).toBeInViewport();
			const shortView = await paint();
			expect(shortView.bounds[1]).toBeGreaterThanOrEqual(0);
			expect(shortView.bounds[1] + shortView.bounds[3]).toBeLessThanOrEqual(360);
			expect(shortView.frames).toEqual(resting.frames);
			await page.keyboard.press("Escape");
			await page.emulateMedia({ reducedMotion: "reduce" });
			await trigger.click();
			await expect
				.poll(() =>
					dialog.evaluate((node) =>
						[node, ...node.querySelectorAll("*")]
							.filter(
								(element) => getComputedStyle(element).transitionDuration !== "0s",
							)
							.map((element) => ({
								className: element.getAttribute("class"),
								duration: getComputedStyle(element).transitionDuration,
							})),
					),
				)
				.toEqual([]);
			await page.keyboard.press("Escape");
			await expect(trigger).toBeFocused();
		});
	}
});
