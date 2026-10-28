import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"] as const) {
	test(`slow navigation keeps chrome usable and can be superseded in ${theme}`, async ({
		page,
	}, testInfo) => {
		await page.addInitScript((value) => localStorage.setItem("theme", value), theme);
		await page.emulateMedia({ colorScheme: theme, reducedMotion: "no-preference" });
		const errors: string[] = [];
		page.on("pageerror", (error) => errors.push(error.message));
		let release = () => {};
		const gate = new Promise<void>((resolve) => {
			release = resolve;
		});
		let requested = false;
		await page.route("**/*", async (route) => {
			const url = new URL(route.request().url());
			if (url.pathname !== "/contact" || !url.searchParams.has("_rsc"))
				return route.continue();
			if (route.request().headers()["next-router-prefetch"]) return route.abort();
			requested = true;
			await gate;
			await route.continue();
		});
		await page.goto("/");
		const nav = page.getByRole("navigation", { name: "Main navigation" });
		const header = page.locator("#header");
		const headerNode = await header.elementHandle();
		const dockNode = await nav.elementHandle();
		const marquee = header.getByRole("button", { name: /^Highlights:/ });
		await marquee.click();
		await expect(marquee).toHaveAttribute("aria-pressed", "true");
		const contact = nav.getByRole("link", { name: "Contact", exact: true });
		const feedback = contact.locator('[data-slot="link-feedback"]');
		const idleDock = await nav.boundingBox();
		const idleControl = await contact.boundingBox();
		try {
			await contact.click();
			await expect.poll(() => requested).toBe(true);
			await expect(feedback).toHaveAttribute("aria-busy", "true");
			await expect(feedback).toHaveAttribute("data-loading");
			await expect(feedback.locator('.t-icon[data-active="true"]')).toHaveCSS("opacity", "1");
			await expect(
				feedback.locator('.t-icon[data-active="true"] [data-slot="spinner"]'),
			).toHaveCSS("width", "16px");
			expect(await contact.boundingBox()).toEqual(idleControl);
			expect(await nav.boundingBox()).toEqual(idleDock);
			await expect(nav.locator("a[aria-current='page']")).toHaveAccessibleName("Home");
			await page.screenshot({ path: testInfo.outputPath(`pending-navigation-${theme}.png`) });
			await page.emulateMedia({ reducedMotion: "reduce" });
			await expect(feedback.locator('.t-icon[data-active="true"]')).toHaveCSS(
				"transition-duration",
				"0s",
			);
			await expect(feedback.locator('[data-slot="spinner"]')).toHaveCSS(
				"animation-name",
				"none",
			);
			await expect(header).toBeVisible();
			await expect(header).not.toHaveAttribute("inert");
			await expect(nav).toBeVisible();
			await expect(nav).toHaveCSS("opacity", "1");
			// A second destination must remain usable while Contact's response is held.
			await nav.getByRole("link", { name: "About", exact: true }).click();
			await expect(page).toHaveURL(/\/about$/);
		} finally {
			release();
		}
		await expect(page.locator("main:visible").getByRole("heading", { level: 1 })).toBeVisible();
		await expect(nav.getByRole("link", { name: "About", exact: true })).toHaveAttribute(
			"aria-current",
			"page",
		);
		await expect(marquee).toHaveAttribute("aria-pressed", "true");
		expect(
			await headerNode?.evaluate((node) => node === document.getElementById("header")),
		).toBe(true);
		expect(
			await dockNode?.evaluate(
				(node) => node === document.querySelector('[aria-label="Main navigation"]'),
			),
		).toBe(true);
		await expect(page.getByRole("status", { name: "Loading page" })).toHaveCount(0);
		await expect(feedback).not.toHaveAttribute("aria-busy");
		await expect(feedback).not.toHaveAttribute("data-loading");
		await page.goBack();
		await expect(page).toHaveURL(/\/$/);
		expect(errors).toEqual([]);
	});
}
