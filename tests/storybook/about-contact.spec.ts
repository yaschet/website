import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"]) {
	for (const width of [320, 390, 1280]) {
		test(`About and Contact compositions fit ${width}px in ${theme}`, async ({ page }) => {
			await page.setViewportSize({ width, height: 900 });
			for (const id of [
				"content-aboutprinciples--default",
				"content-contactmethods--default",
				"forms-contact--page-section",
				"layout-pageintro--contact",
			]) {
				await page.goto(`/iframe.html?id=${id}&viewMode=story&globals=theme:${theme}`);
				const root = page.locator("#storybook-root");
				await expect(root.getByRole("heading").first()).toBeVisible();
				await page.evaluate(() => document.fonts.ready);
				expect(
					await root.evaluate((node) => ({
						overflow: document.documentElement.scrollWidth > innerWidth + 1,
						clipped: [...node.querySelectorAll<HTMLElement>("p, h1, h2, h3")].some(
							(el) => el.scrollWidth > el.clientWidth + 1,
						),
					})),
				).toEqual({ overflow: false, clipped: false });
				if (id === "content-contactmethods--default") {
					const positions = await root
						.locator(".portfolio-contact-method > :last-child")
						.evaluateAll((nodes) =>
							nodes.map((node) => node.getBoundingClientRect().top),
						);
					if (width >= 1024)
						expect(Math.max(...positions) - Math.min(...positions)).toBeLessThan(1);
				}
				if (id === "forms-contact--page-section") {
					const form = root.getByRole("form", { name: "Send a message" });
					for (const name of ["Name", "Email", "Subject"]) {
						const input = form.getByRole("textbox", { name, exact: true });
						await expect(input).toHaveAttribute("aria-required", "true");
						expect(
							await input.evaluate((el) => el.getBoundingClientRect().height),
						).toBe(width < 640 ? 44 : 40);
					}
					await expect(
						form.getByRole("textbox", { name: "Name", exact: true }),
					).toHaveAttribute("autocomplete", "name");
					const email = form.getByRole("textbox", { name: "Email", exact: true });
					await expect(email).toHaveAttribute("autocomplete", "email");
					await email.fill("invalid");
					await form.getByRole("textbox", { name: "Subject", exact: true }).focus();
					await expect(email).toHaveAttribute("aria-invalid", "true");
					const errorId = await email.getAttribute("aria-describedby");
					await expect(root.locator(`[id="${errorId}"]`)).toHaveText(
						"Please enter a valid email address",
					);
					await expect(form.getByRole("button", { name: "Send message" })).toBeDisabled();
					await email.fill("reviewer@example.test");
					await expect(email).not.toHaveAttribute("aria-invalid", "true");
					const message = root.getByRole("textbox", { name: "Message", exact: true });
					await expect(message).toBeEmpty();
					expect(
						await message.evaluate((node) => node.getBoundingClientRect().height),
					).toBeGreaterThanOrEqual(160);
					expect(
						await root
							.locator(".portfolio-form-field")
							.first()
							.evaluate((node) => getComputedStyle(node).gap),
					).toBe("8px");
					const button = root.getByRole("button", { name: "Send message" });
					const geometry = await button.evaluate((node) => ({
						width: node.getBoundingClientRect().width,
						height: node.getBoundingClientRect().height,
						containerWidth: node.closest("form")?.getBoundingClientRect().width,
					}));
					expect(geometry.height).toBe(width < 640 ? 44 : 40);
					if (width < 640) expect(geometry.width).toBe(geometry.containerWidth);
					else expect(geometry.width).toBeLessThan(250);
				}
				if (id === "layout-pageintro--contact") {
					expect(
						await root.getByRole("heading", { level: 1 }).evaluate((node) => {
							const style = getComputedStyle(node);
							return [style.fontSize, style.lineHeight];
						}),
					).toEqual(
						width < 360
							? ["32px", "40px"]
							: width < 640
								? ["36px", "44px"]
								: ["48px", "56px"],
					);
				}
			}
		});
	}
}
