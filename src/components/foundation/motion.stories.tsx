import { RiCheckLine, RiFileCopyLine } from "@remixicon/react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useId, useState } from "react";
import { expect, userEvent } from "storybook/test";
import { Button } from "../ui/button";
import { Input } from "../ui/form/input";
import { Label } from "../ui/form/label";
import { RollingTime } from "../ui/rolling-time";
import { StateSwap } from "../ui/state-swap";

function MotionSample() {
	const id = useId();
	const [loading, setLoading] = useState(false);
	return (
		<div className="portfolio-box-pad portfolio-stack-related max-w-xl">
			<h1 className="portfolio-heading-lg">Motion follows state.</h1>
			<p className="portfolio-body-md">
				Foundation owns press feedback, menu underlays, overlay transitions and icon swaps.
				Keyboard state changes are immediate. Reduced motion removes travel and blur.
			</p>
			<div className="grid max-w-sm gap-2">
				<Label htmlFor={id}>Reveal icon transition</Label>
				<Input id={id} type="password" defaultValue="Example only" />
			</div>
			<div className="flex flex-wrap items-center gap-3">
				<Button
					variant="soft"
					aria-pressed={loading}
					onClick={() => setLoading((value) => !value)}
				>
					Toggle pending example
				</Button>
				<Button loading={loading}>Save example</Button>
			</div>
			<p className="portfolio-body-sm text-muted-foreground">
				The same Remix loader used in Office appears alongside the action label. These
				examples do not send a request.
			</p>
		</div>
	);
}
const meta = {
	title: "Foundation/Motion",
	component: MotionSample,
	tags: ["autodocs"],
	parameters: { layout: "fullscreen" },
} satisfies Meta<typeof MotionSample>;
export default meta;
type Story = StoryObj<typeof meta>;
export const StateChange: Story = {};

function StateSwapSample() {
	const [copied, setCopied] = useState(false);
	return (
		<div className="portfolio-box-pad grid max-w-lg gap-5">
			<h2 className="portfolio-section-heading">Stable state changes</h2>
			<p className="text-muted-foreground text-sm/5">
				The icon and label stay mounted. Pointer changes use Foundation's scale/blur and
				text crossfade; keyboard and reduced motion are immediate.
			</p>
			<div className="flex flex-wrap items-center gap-5">
				<Button
					variant="soft"
					aria-label={copied ? "Copied example" : "Copy example"}
					onClick={() => setCopied((value) => !value)}
				>
					<StateSwap
						value={String(copied)}
						items={{
							false: <RiFileCopyLine className="size-4" />,
							true: <RiCheckLine className="size-4" />,
						}}
					/>
					<StateSwap
						kind="text"
						value={String(copied)}
						items={{ false: "Copy example", true: "Copied example" }}
					/>
				</Button>
				<span
					aria-label={copied ? "Example time 09:42:10" : "Example time 09:42:09"}
					role="img"
				>
					<RollingTime value={copied ? "09:42:10" : "09:42:09"} />
				</span>
			</div>
		</div>
	);
}
export const IconTextAndDigits: Story = {
	render: () => <StateSwapSample />,
	play: async ({ canvas }) => {
		await userEvent.click(canvas.getByRole("button", { name: "Copy example" }));
		await expect(canvas.getByRole("button", { name: "Copied example" })).toBeVisible();
		await expect(canvas.getByRole("img", { name: "Example time 09:42:10" })).toBeVisible();
	},
};
