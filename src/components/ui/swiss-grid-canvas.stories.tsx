import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type React from "react";
import { useEffect, useRef } from "react";
import { SwissGridProvider, useSwissGrid } from "./swiss-grid-canvas";

/**
 * Procedural canvas-based crosshair grid overlay for architectural layout precision.
 */
const meta: Meta<typeof SwissGridProvider> = {
	title: "Visuals/SwissGrid",
	component: SwissGridProvider,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component:
					"Mathematical grid system that calculates exact intersection points to avoid sub-pixel blurring. Features dynamic registration for boundary reinforcements.",
			},
		},
	},
};

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Internal helper for demonstration purposes.
 */
const GridSection = ({
	id,
	children,
	className,
}: {
	id: string;
	children: React.ReactNode;
	className?: string;
}) => {
	const { registerSection, unregisterSection } = useSwissGrid();
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (ref.current) {
			registerSection(id, ref.current);
		}
		return () => unregisterSection(id);
	}, [id, registerSection, unregisterSection]);

	return (
		<div ref={ref} className={className}>
			{children}
		</div>
	);
};

export const Default: Story = {
	render: () => (
		<SwissGridProvider>
			<div className="relative flex min-h-screen flex-col gap-20 bg-surface-50 p-10 dark:bg-surface-950">
				<GridSection
					id="hero"
					transparentb
					className="flex h-64 items-center justify-center border-b border-transparent"
				>
					font-bold
					<h1 className="text-4xl font-bold">Hero Section</h1>
				</GridSection>
				<GridSection
					id="content"
					transparentb
					className="flex h-96 items-center justify-center border-b border-transparent"
				>
					<p className="text-xl">Content Section with Grid Intersections</p>
				</GridSection>
				<GridSection id="footer" className="flex h-40 items-center justify-center">
					<p>Footer Section</p>
				</GridSection>
			</div>
		</SwissGridProvider>
	),
};
