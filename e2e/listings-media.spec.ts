import { expect, test } from "@playwright/test";
import { installMuxMediaFixture } from "../tests/storybook/helpers/mux-media-fixture";

for (const theme of ["light", "dark"] as const) {
	test(`listing actions and first video activation in ${theme}`, async ({ page }, testInfo) => {
		await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
		await page.addInitScript((value) => localStorage.setItem("theme", value), theme);
		// Keep the activation/error UI contract independent of native HLS retries.
		// Live delivery and decoding are reviewed separately.
		await installMuxMediaFixture(page, "error");
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
		await expect(
			page.getByRole("link", { name: "Discuss a project", exact: true }),
		).toHaveAttribute("href", "/contact");
		const card = page.getByRole("article", {
			name: "University Program Matching",
			exact: true,
		});
		const play = card.getByRole("button", { name: "Play 1:40 video", exact: true });
		await expect(play).toBeEnabled();
		await play.scrollIntoViewIfNeeded();
		if (testInfo.project.use.hasTouch) await play.tap();
		else {
			// Keyboard activation must retain intent while the deferred gallery mounts.
			await play.focus();
			await page.keyboard.press("Enter");
		}
		// The deferred player must receive the original activation and expose a usable
		// failure state when its public transport boundary explicitly rejects play.
		await expect(card.locator("[data-playback-error]")).toBeVisible();
		await expect(card.getByRole("button", { name: "Try again", exact: true })).toBeVisible();
		await expect(
			card.getByRole("button", { name: "Return to poster", exact: true }),
		).toBeVisible();
		await expect(play).toBeHidden();
	});
}
