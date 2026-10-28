import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { usePathname } from "@storybook/nextjs-vite/navigation.mock";
import { expect, waitFor, within } from "storybook/test";
import { SinglePreviewDocsPage } from "../../../.storybook/workshop-docs";
import { FloatingNav } from "./floating-nav";

/**
 * Fixed-position navigation dock with animated active indicator.
 */
const meta: Meta<typeof FloatingNav> = {
	id: "layout-floatingnav",
	title: "Components/Navigation/Floating Navigation",
	component: FloatingNav,
	tags: ["autodocs"],
	beforeEach: () => {
		usePathname.mockReturnValue("/");
	},
	parameters: {
		layout: "fullscreen",
		docs: {
			page: SinglePreviewDocsPage,
			description: {
				component:
					"The runtime navigation dock, with active links, keyboard access, and the same theme control as the website.",
			},
		},
	},
	decorators: [
		(Story, context) => (
			<div
				className={`relative flex w-full items-end justify-center bg-[var(--portfolio-canvas)] ${context.viewMode === "docs" ? "workshop-viewport h-[280px]" : "h-screen"}`}
			>
				<Story />
			</div>
		),
	],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ContactActive: Story = {
	beforeEach: () => {
		usePathname.mockReturnValue("/contact");
	},
	play: async ({ canvas }) => {
		await expect(canvas.getByRole("link", { name: "Contact" })).toHaveAttribute(
			"aria-current",
			"page",
		);
	},
};

export const ThemeControl: Story = {
	play: async ({ canvas, canvasElement, globals, userEvent }) => {
		const initial = globals.theme;
		const other = initial === "dark" ? "light" : "dark";
		const root = canvasElement.ownerDocument.documentElement;
		await waitFor(() => expect(root).toHaveClass(initial));
		await userEvent.click(
			canvas.getByRole("button", { name: `Theme: Switch to ${other} mode` }),
		);
		await waitFor(() => expect(root).toHaveClass(other));
		await userEvent.click(
			canvas.getByRole("button", { name: `Theme: Switch to ${initial} mode` }),
		);
		await waitFor(() => expect(root).toHaveClass(initial));
		await expect(
			canvasElement.ownerDocument.querySelector('[role="tooltip"][data-state="open"]'),
		).toBeNull();
	},
};

/** A continuous hint surface follows the dock instead of mounting a bubble per link. */
export const SharedTooltip: Story = {
	play: async ({ canvas, canvasElement, userEvent }) => {
		const documentCanvas = within(canvasElement.ownerDocument.body);
		await userEvent.hover(canvas.getByRole("link", { name: "Home" }));
		const shell = await documentCanvas.findByRole("tooltip", { name: "Home" });
		const dock = canvas.getByRole("navigation", { name: "Main navigation" });
		await waitFor(() => {
			const tip = shell.getBoundingClientRect();
			const nav = dock.getBoundingClientRect();
			const inset = Number.parseFloat(getComputedStyle(dock).paddingTop);
			expect(Math.abs(tip.left - nav.left)).toBeLessThan(1);
			expect(Math.abs(nav.top - tip.bottom - inset)).toBeLessThan(1);
		});
		await userEvent.unhover(canvas.getByRole("link", { name: "Home" }));
		await userEvent.hover(canvas.getByRole("link", { name: "Contact" }));
		await waitFor(() =>
			expect(documentCanvas.getByRole("tooltip", { name: "Contact" })).toBe(shell),
		);
		await expect(documentCanvas.getAllByRole("tooltip")).toHaveLength(1);
		await waitFor(() => {
			// Audit the completed handoff, not a translucent crossfade frame.
			expect(shell).toHaveStyle({ opacity: "1" });
			expect(shell.querySelectorAll(".portfolio-tooltip-copy")).toHaveLength(1);
			expect(shell.querySelector(".portfolio-tooltip-copy")).toHaveStyle({
				opacity: "1",
				filter: "blur(0px)",
			});
		});
		await expect(canvas.getByRole("link", { name: "Home" })).toHaveAttribute(
			"aria-current",
			"page",
		);
		const theme = canvas.getByRole("button", { name: /^Theme:/ });
		await userEvent.unhover(canvas.getByRole("link", { name: "Contact" }));
		await userEvent.hover(theme);
		await waitFor(() =>
			expect(documentCanvas.getByRole("tooltip", { name: "Theme" })).toBe(shell),
		);
		await waitFor(() => {
			expect(shell.querySelectorAll(".portfolio-tooltip-copy")).toHaveLength(1);
			expect(shell.querySelector(".portfolio-tooltip-copy")).toHaveStyle({
				opacity: "1",
				filter: "blur(0px)",
			});
			expect(
				Math.abs(shell.getBoundingClientRect().right - dock.getBoundingClientRect().right),
			).toBeLessThan(1);
		});
		await expect(theme).toHaveAttribute("data-highlighted", "true");
		await expect(canvas.getByRole("link", { name: "Home" })).toHaveAttribute(
			"data-highlighted",
			"true",
		);
	},
};
