import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useId } from "react";
import { Button } from "../ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Input } from "../ui/form/input";

function ControlSizes() {
	const id = useId();
	return (
		<div className="portfolio-box-pad portfolio-stack-group max-w-4xl">
			<h2 className="portfolio-heading-sm">One control scale</h2>
			<p className="portfolio-body-sm text-muted-foreground">
				Foundation uses 28 / 36 / 40 / 44 / 48px controls and independent 32px menu rows.
				Use default or larger controls for primary and touch actions.
			</p>
			{(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
				<div key={size} data-control-size={size} className="grid gap-3 sm:grid-cols-3">
					<Button size={size} variant="soft">
						{size} action
					</Button>
					<Input
						id={`${id}-${size}`}
						aria-label={`${size} input`}
						size={size}
						placeholder="Reading text"
					/>
					<DropdownMenu size={size} modal={false}>
						<DropdownMenuTrigger asChild>
							<Button size={size} variant="outlined">
								{size} menu
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent>
							<DropdownMenuItem>{size} menu option</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			))}
		</div>
	);
}
const meta = {
	id: "foundation-controls",
	title: "Components/Actions/Control Geometry",
	component: ControlSizes,
	tags: ["autodocs"],
	parameters: { layout: "fullscreen" },
} satisfies Meta<typeof ControlSizes>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Sizes: Story = {};
