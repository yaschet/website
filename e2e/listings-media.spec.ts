import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"] as const) {
	test(`listing actions and first video activation in ${theme}`, async ({ page }, testInfo) => {
		await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
		await page.addInitScript((value) => localStorage.setItem("theme", value), theme);
		// This test checks activation, not streaming. Live playback is reviewed separately.
		await page.route("https://stream.mux.com/**", (route) => route.abort());
		await page.goto("/blog");
		const heading = page.getByRole("heading", { name: "No posts published." });
		await expect(heading).toBeVisible();
		const chamber = heading.locator("../..").locator('[data-slot="icon-chamber"]');
		await expect(chamber).toBeVisible();
		await expect
			.poll(() =>
				chamber.evaluate((node) => {
					const frame = node.getBoundingClientRect();
					const glyph = node.querySelector("svg")?.getBoundingClientRect();
					return {
						frame: [frame.width, frame.height],
						glyph: [glyph?.width, glyph?.height],
						insets: glyph
							? [
									glyph.top - frame.top,
									frame.right - glyph.right,
									frame.bottom - glyph.bottom,
									glyph.left - frame.left,
								]
							: [],
					};
				}),
			)
			.toEqual({ frame: [40, 40], glyph: [20, 20], insets: [10, 10, 10, 10] });
		await page.locator('a[data-slot="button"][href="/case-studies"]').click();
		await expect(page).toHaveURL(/\/case-studies$/);
		await expect(page.locator('a[data-slot="button"][href="/about"]')).toBeVisible();
		const card = page.getByRole("article", {
			name: "University Program Matching",
			exact: true,
		});
		const play = card.getByRole("button", { name: "Play 1:40 video", exact: true });
		await expect(play).toBeEnabled();
		if (testInfo.project.use.hasTouch) await play.tap();
		else {
			// Keyboard activation must retain intent while the deferred gallery mounts.
			await play.focus();
			await page.keyboard.press("Enter");
		}
		await expect(card.locator("mux-video[data-playback-id]")).toHaveCount(1);
	});
}
