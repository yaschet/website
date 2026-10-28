import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { PageContainer } from "@/src/components/layout/containers";
import { ProfileSection } from "@/src/components/layout/profile-section";
import { SiteHeader } from "@/src/components/layout/site-header";
import { SiteHero } from "@/src/components/layout/site-hero";
import { SwissGridBox, SwissGridRow } from "@/src/components/ui/swiss-grid";
import { formatTimeZoneLabel } from "@/src/lib/time-zone";
import { LocationBadge, TimeBadge } from "./context-badges";

const meta = {
	id: "components-contextbadges",
	title: "Components/Navigation/Context Rail",
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component:
					"A 40px rail with 20px gaps, one quiet frame and one chamber seam. The flag fills its square inside an even hairline frame. Hover changes the joined surface; focus previews context, and tap or click pins it. Panels have contrasting 44px header and action bands, continuous record surfaces, and single horizontal separators. Touch uses a 150ms fade; keyboard and reduced motion remain immediate. Phones use two equal badges above sentence-case highlights. Escape, outside press or scrolling dismisses a panel.",
			},
		},
	},
} satisfies Meta;
export default meta;
type Story = StoryObj<{ viewerTimeZone?: string; market?: keyof typeof markets }>;

const markets = {
	"New York": "America/New_York",
	"Pacific time": "America/Los_Angeles",
	Chicago: "America/Chicago",
	London: "Europe/London",
	Paris: "Europe/Paris",
	Dubai: "Asia/Dubai",
	Riyadh: "Asia/Riyadh",
	Singapore: "Asia/Singapore",
	"Kuala Lumpur": "Asia/Kuala_Lumpur",
} as const;

/** The header owns the top and side gutters; the story adds the matching bottom. */
function HeaderAboveHero({ viewerTimeZone }: { viewerTimeZone?: string }) {
	return (
		<div className="workshop-context-page">
			<SiteHeader
				viewerTimeZone={viewerTimeZone}
				viewerTimeZoneSource={viewerTimeZone ? "override" : null}
			/>
			<PageContainer>
				<SwissGridBox>
					<SwissGridRow>
						<ProfileSection />
					</SwissGridRow>
					<SwissGridRow>
						<SiteHero />
					</SwissGridRow>
				</SwissGridBox>
			</PageContainer>
		</div>
	);
}

export const Location: Story = {
	render: () => (
		<div className="p-5">
			<LocationBadge className="w-[180px]" />
		</div>
	),
};
export const Time: Story = {
	render: () => (
		<div className="p-5">
			<TimeBadge className="w-[180px]" />
		</div>
	),
};

export const LocationDetails: Story = {
	name: "Location details",
	render: () => (
		<div className="p-5">
			<LocationBadge className="w-[180px]" />
		</div>
	),
	play: async ({ canvas, canvasElement, viewMode }) => {
		const page = within(canvasElement.ownerDocument.body);
		const trigger = canvas.getByRole("button", { name: "About my location: Rabat, Morocco" });
		await userEvent.click(trigger);
		const panel = page.getByRole("dialog", { name: "Working together" });
		await waitFor(() =>
			expect(within(panel).getByText("Email & scheduled calls")).toBeVisible(),
		);
		await expect(within(panel).getByRole("link")).toHaveAttribute("href", "/contact");
		await userEvent.click(within(panel).getByRole("button", { name: "Close details" }));
		await expect(trigger).toHaveAttribute("aria-expanded", "false");
		await waitFor(() => expect(page.queryByRole("dialog")).not.toBeInTheDocument());
		if (viewMode === "story") {
			await userEvent.click(trigger);
			await waitFor(() =>
				expect(page.getByRole("dialog", { name: "Working together" })).toBeVisible(),
			);
		}
	},
};

export const TimeComparison: Story = {
	name: "Time comparison",
	args: { viewerTimeZone: "America/New_York" },
	argTypes: {
		viewerTimeZone: {
			control: "select",
			options: [
				"America/New_York",
				"Europe/London",
				"Europe/Paris",
				"Asia/Dubai",
				"Asia/Kuala_Lumpur",
			],
		},
	},
	render: ({ viewerTimeZone = "America/New_York" }) => (
		<div className="p-5">
			<TimeBadge
				className="w-[180px]"
				viewerTimeZone={viewerTimeZone}
				viewerTimeZoneSource="override"
			/>
		</div>
	),
	play: async ({ canvas, canvasElement, viewMode, args }) => {
		const page = within(canvasElement.ownerDocument.body);
		const trigger = canvas.getByRole("button", {
			name: /Compare your time/,
		});
		await userEvent.click(trigger);
		const panel = page.getByRole("dialog", { name: "Time difference" });
		const city = formatTimeZoneLabel(args.viewerTimeZone ?? "America/New_York");
		await waitFor(() => expect(within(panel).getByText(new RegExp(city ?? ""))).toBeVisible());
		await userEvent.keyboard("{Escape}");
		await expect(trigger).toHaveAttribute("aria-expanded", "false");
		await waitFor(() => expect(page.queryByRole("dialog")).not.toBeInTheDocument());
		if (viewMode === "story") {
			await userEvent.click(trigger);
			await waitFor(() =>
				expect(page.getByRole("dialog", { name: "Time difference" })).toBeVisible(),
			);
		}
	},
};
export const Group: Story = {
	name: "Header rail",
	render: () => <SiteHeader />,
	play: async ({ canvas }) => {
		await expect(canvas.getByRole("timer")).toBeVisible();
		const highlights = canvas.getByRole("button", { name: /^Highlights:/ });
		await expect(highlights).toHaveAttribute("aria-pressed", "false");
		await userEvent.click(highlights);
		await expect(highlights).toHaveAttribute("aria-pressed", "true");
	},
};

export const AboveHero: Story = {
	name: "Above the hero",
	render: () => <HeaderAboveHero />,
};

const mobileMarket: Story = {
	globals: { viewport: { value: "390-844", isRotated: false } },
	args: { market: "New York" },
	argTypes: { market: { control: "select", options: Object.keys(markets) } },
	render: ({ market = "New York" }) => <HeaderAboveHero viewerTimeZone={markets[market]} />,
	play: async ({ canvas, canvasElement, args, viewMode }) => {
		// Inline Docs examples must not open overlapping portal dialogs automatically.
		if (viewMode !== "story") return;
		const page = within(canvasElement.ownerDocument.body);
		await userEvent.click(canvas.getByRole("button", { name: /Compare your time/ }));
		const panel = await page.findByRole("dialog", { name: "Time difference" });
		const zoneLabel = formatTimeZoneLabel(markets[args.market ?? "New York"]);
		await waitFor(() => expect(within(panel).getByText(new RegExp(zoneLabel))).toBeVisible());
	},
};

export const NewYork: Story = { ...mobileMarket, name: "Mobile · New York" };
export const Dubai: Story = { ...mobileMarket, name: "Mobile · Dubai", args: { market: "Dubai" } };
export const Pacific: Story = {
	...mobileMarket,
	name: "Mobile · Pacific time",
	args: { market: "Pacific time" },
};

export const KeyboardHighlights: Story = {
	name: "Keyboard highlights",
	render: () => <SiteHeader />,
	play: async ({ canvas }) => {
		const highlights = canvas.getByRole("button", { name: /^Highlights:/ });
		highlights.focus();
		await expect(highlights).toHaveFocus();
		await userEvent.keyboard("{ArrowRight}");
		await expect(highlights).toHaveAttribute("aria-pressed", "true");
		await expect(highlights).toHaveAttribute("data-paused", "true");
	},
};
