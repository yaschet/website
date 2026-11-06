import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useEffect, useId, useRef, useState } from "react";
import { SiteHero } from "@/src/components/layout/site-hero";
import { Button } from "./button";

const meta = {
	title: "Lab/Heading Reveal",
	parameters: {
		layout: "fullscreen",
		controls: { disable: true },
		docs: {
			description: {
				component:
					"Rendering isolation for the original masked blur sweep. Uses the production hero, word timings and masks. Replay slowly or hold a frame on the affected physical device; a desktop viewport alone cannot verify an iPhone rendering defect. These controls do not alter the public page.",
			},
		},
	},
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

function RenderingIsolation() {
	const sample = useRef<HTMLDivElement>(null);
	const animations = useRef<Animation[]>([]);
	const [layer, setLayer] = useState("combined");
	const [field, setField] = useState(true);
	const [frame, setFrame] = useState(850);
	const id = useId();
	useEffect(
		() => () => {
			for (const animation of animations.current) animation.cancel();
		},
		[],
	);

	function prepare() {
		const heading = sample.current?.querySelector("h1");
		if (!heading) return [];
		for (const animation of animations.current) animation.cancel();
		delete heading.dataset.resolveSettled;
		const layers = heading.querySelectorAll<HTMLElement>(
			"[data-resolve-sharp], [data-resolve-front]",
		);
		animations.current = Array.from(layers, (element) => {
			// Disable the initial CSS transition before taking manual control.
			element.style.transition = "none";
			for (const animation of element.getAnimations()) animation.cancel();
			const style = getComputedStyle(element.closest("[data-heading-word]") ?? element);
			const animation = element.animate(
				[{ maskPosition: "100% 0%" }, { maskPosition: "0% 0%" }],
				{
					duration: Number.parseFloat(style.getPropertyValue("--resolve-duration")),
					delay: Number.parseFloat(style.getPropertyValue("--resolve-delay")),
					easing: "linear",
					fill: "both",
				},
			);
			animation.pause();
			return animation;
		});
		return animations.current;
	}

	function replay(rate: number) {
		if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
		for (const animation of prepare()) {
			animation.playbackRate = rate;
			animation.play();
		}
	}

	function hold(time: number) {
		setFrame(time);
		for (const animation of prepare()) animation.currentTime = time;
	}

	return (
		<div className="portfolio-stack-section">
			<style>{`
				[data-reveal-probe="masks"] [data-resolve-fog] { filter: none; }
				[data-reveal-probe="blur"] [data-resolve-sharp] { visibility: hidden; }
				[data-reveal-probe="blur"] [data-resolve-front] { mask-image: none; }
				[data-reveal-field="false"] [data-instrument-host] > :first-child { visibility: hidden; }
			`}</style>
			<div className="portfolio-box-pad portfolio-stack-related">
				<h2 className="portfolio-section-heading">Heading rendering isolation</h2>
				<p className="portfolio-body max-w-[60ch]">
					Keep the same frame while comparing layers. Masks only removes the blur; blur
					only removes the moving masks. Neither is a replacement animation.
				</p>
				<div className="portfolio-control-row">
					<Button onClick={() => replay(1)}>Replay original</Button>
					<Button onClick={() => replay(0.2)}>Replay at 20%</Button>
					<Button onClick={() => hold(frame)}>Hold frame</Button>
				</div>
				<label
					className="portfolio-body flex flex-wrap items-center gap-3"
					htmlFor={`${id}-layer`}
				>
					Rendering
					<select
						id={`${id}-layer`}
						value={layer}
						onChange={(event) => setLayer(event.target.value)}
					>
						<option value="combined">Original combined layers</option>
						<option value="masks">Masks only</option>
						<option value="blur">Blur only</option>
					</select>
				</label>
				<label className="portfolio-body flex items-center gap-3">
					<input
						type="checkbox"
						checked={field}
						onChange={(event) => setField(event.target.checked)}
					/>
					Topographic background
				</label>
				<label
					className="portfolio-body flex flex-wrap items-center gap-3"
					htmlFor={`${id}-frame`}
				>
					Hold at {frame} ms
					<input
						id={`${id}-frame`}
						type="range"
						min="0"
						max="1900"
						step="10"
						value={frame}
						onChange={(event) => hold(Number(event.target.value))}
					/>
				</label>
			</div>
			<div ref={sample} data-reveal-probe={layer} data-reveal-field={field}>
				<SiteHero />
			</div>
		</div>
	);
}

export const Rendering: Story = { render: () => <RenderingIsolation /> };
