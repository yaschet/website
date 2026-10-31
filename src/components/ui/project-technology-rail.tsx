"use client";

import { Popover } from "@base-ui/react/popover";
import { RiCloseLine, RiGridLine, RiPauseLine, RiPlayLine } from "@remixicon/react";
import type { CSSProperties, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/src/components/ui/button";
import { StateSwap } from "@/src/components/ui/state-swap";
import { TechnologyMark } from "@/src/components/ui/technology-mark";
import { getTechnologyReference } from "@/src/content/technology-references";

const ROTATION_INTERVAL_MS = 2200;

interface ProjectTechnologyRailProps {
	technologies: readonly string[];
	highlights?: readonly string[];
	projectTitle: string;
}

function TechnologyReference({ name, children }: { name: string; children: ReactNode }) {
	const reference = getTechnologyReference(name);
	return reference ? (
		<a
			className="portfolio-technology-reference"
			href={reference.href}
			target="_blank"
			rel="noopener noreferrer"
			aria-label={`${name}: ${reference.label} (opens in a new tab)`}
		>
			{children}
		</a>
	) : (
		<span className="portfolio-technology-reference">{children}</span>
	);
}

/**
 * Fixed-height reference cells with an immediately available complete stack.
 * Only a visible, unpaused rail runs a timer; CSS owns the short exchanges.
 */
export function ProjectTechnologyRail({
	technologies,
	highlights,
	projectTitle,
}: ProjectTechnologyRailProps) {
	// Older metadata names the platform and its database together. Give each mark
	// its own cell without changing the authored case-study content.
	const entries = useMemo(
		() =>
			Array.from(
				new Set(
					technologies.flatMap((name) =>
						name === "Supabase/PostgreSQL" ? ["Supabase", "PostgreSQL"] : [name],
					),
				),
			),
		[technologies],
	);
	const orderedEntries = useMemo(() => {
		const selected = highlights?.filter((name) => entries.includes(name)) ?? [];
		return Array.from(new Set([...selected, ...entries]));
	}, [entries, highlights]);
	const rootRef = useRef<HTMLDivElement>(null);
	const remainingMs = useRef(ROTATION_INTERVAL_MS);
	const interaction = useRef({ hovered: false, focused: false, pressed: false });
	const [columns, setColumns] = useState(6);
	const [cycle, setCycle] = useState(0);
	const [visible, setVisible] = useState(false);
	const [pageVisible, setPageVisible] = useState(false);
	const [reducedMotion, setReducedMotion] = useState(true);
	const [paused, setPaused] = useState(false);
	const [open, setOpen] = useState(false);
	const [hovered, setHovered] = useState(false);
	const [focused, setFocused] = useState(false);
	const [pressed, setPressed] = useState(false);
	const hasTechnologies = entries.length > 0;
	const cellCount = Math.min(columns, entries.length);
	const fixedCount = columns === 6 ? Math.min(3, cellCount) : 0;
	const rotatingCount = cellCount - fixedCount;
	const groups = useMemo(() => {
		const fixed = orderedEntries.slice(0, fixedCount).map((name) => [name]);
		const supporting = orderedEntries.slice(fixedCount);
		return [
			...fixed,
			...Array.from({ length: rotatingCount }, (_, slot) => [
				...supporting.slice(slot),
				...supporting.slice(0, slot),
			]),
		];
	}, [orderedEntries, fixedCount, rotatingCount]);
	const canRotate = orderedEntries.length > cellCount;
	const running =
		canRotate &&
		visible &&
		pageVisible &&
		!reducedMotion &&
		!paused &&
		!open &&
		!hovered &&
		!focused &&
		!pressed;

	useEffect(() => {
		if (!pressed) return;
		const release = () => {
			interaction.current.pressed = false;
			setPressed(false);
		};
		window.addEventListener("pointerup", release);
		window.addEventListener("pointercancel", release);
		return () => {
			window.removeEventListener("pointerup", release);
			window.removeEventListener("pointercancel", release);
		};
	}, [pressed]);

	useEffect(() => {
		const root = rootRef.current;
		if (!hasTechnologies || !root) return;
		const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
		const updateMotion = () => setReducedMotion(motion.matches);
		const updateVisibility = () => setPageVisible(!document.hidden);
		updateMotion();
		updateVisibility();
		motion.addEventListener("change", updateMotion);
		document.addEventListener("visibilitychange", updateVisibility);
		const visibility = new IntersectionObserver(([entry]) => {
			setVisible(entry?.isIntersecting ?? false);
		});
		const size = new ResizeObserver(([entry]) => {
			if (!entry) return;
			setColumns(entry.contentRect.width >= 640 ? 6 : 3);
		});
		visibility.observe(root);
		size.observe(root);
		return () => {
			visibility.disconnect();
			size.disconnect();
			motion.removeEventListener("change", updateMotion);
			document.removeEventListener("visibilitychange", updateVisibility);
		};
	}, [hasTechnologies]);

	useEffect(() => {
		if (!running) return;
		let delay = remainingMs.current;
		let started = performance.now();
		let timer: number;
		const advance = () => {
			// An input event can arrive before the pause effect clears this timer.
			// Never change a focused, hovered or pressed link's destination.
			if (Object.values(interaction.current).some(Boolean)) return;
			delay = ROTATION_INTERVAL_MS;
			started = performance.now();
			setCycle((value) => value + 1);
			timer = window.setTimeout(advance, delay);
		};
		timer = window.setTimeout(advance, delay);
		return () => {
			window.clearTimeout(timer);
			remainingMs.current = Math.max(0, delay - (performance.now() - started));
		};
	}, [running]);

	if (!hasTechnologies) return null;

	return (
		<div
			ref={rootRef}
			data-slot="project-technology-rail"
			data-running={running}
			data-motion-active={canRotate && visible && pageVisible && !reducedMotion}
			className="portfolio-technology-rail"
			style={{ "--technology-cell-count": cellCount } as CSSProperties}
			onPointerEnter={(event) => {
				if (event.pointerType === "mouse") {
					interaction.current.hovered = true;
					setHovered(true);
				}
			}}
			onPointerLeave={() => {
				interaction.current.hovered = false;
				setHovered(false);
			}}
			onPointerDownCapture={() => {
				interaction.current.pressed = true;
				setPressed(true);
			}}
			onFocusCapture={() => {
				interaction.current.focused = true;
				setFocused(true);
			}}
			onBlurCapture={(event) => {
				if (!event.currentTarget.contains(event.relatedTarget)) {
					interaction.current.focused = false;
					setFocused(false);
				}
			}}
		>
			<ul aria-label="Technologies" className="sr-only">
				{orderedEntries.map((name) => (
					<li key={name}>{name}</li>
				))}
			</ul>
			<div className="portfolio-technology-cells">
				{groups.map((group, slot) => {
					// Advance a complete, ordered window. Desktop keeps its three core
					// marks; compact rails exchange all three without duplicate cells.
					const step = slot < fixedCount ? 0 : rotatingCount;
					const current = group[(cycle * step) % group.length];
					const previous =
						cycle > 0 ? group[((cycle - 1) * step) % group.length] : undefined;
					const exchanging = current !== previous && cycle > 0;
					return (
						<div
							key={group[0]}
							data-rotation={step > 0 && canRotate ? "rotating" : "fixed"}
							className="portfolio-technology-cell"
							style={
								{
									"--technology-phase": `${step > 0 ? (cellCount - slot - 1) * 50 : 0}ms`,
								} as CSSProperties
							}
						>
							<TechnologyReference name={current}>
								<div
									aria-hidden="true"
									className="portfolio-technology-exchange"
									data-exchanging={exchanging}
								>
									{group.map((name) => (
										<span
											key={name}
											data-technology={name}
											className={
												name === current
													? "portfolio-technology-current"
													: exchanging && name === previous
														? "portfolio-technology-outgoing"
														: "portfolio-technology-idle"
											}
										>
											<TechnologyMark name={name} tone="interactive" />
										</span>
									))}
								</div>
							</TechnologyReference>
						</div>
					);
				})}
			</div>
			<Popover.Root open={open} onOpenChange={setOpen}>
				<Popover.Trigger
					type="button"
					aria-label={`Stack: all ${entries.length} technologies for ${projectTitle}`}
					className="portfolio-technology-disclosure"
				>
					<span aria-hidden="true" className="portfolio-technology-identity">
						<span className="portfolio-technology-mark-chamber">
							<RiGridLine className="size-6" />
						</span>
						<span className="portfolio-technology-label">Stack</span>
					</span>
				</Popover.Trigger>
				<Popover.Portal>
					<Popover.Positioner
						anchor={rootRef}
						align="end"
						side="top"
						sideOffset={12}
						collisionPadding={20}
						className="portfolio-technology-positioner"
					>
						<Popover.Popup className="portfolio-technology-popover">
							<div className="portfolio-technology-popover-heading">
								<span
									aria-hidden="true"
									className="portfolio-technology-popover-icon"
								>
									<RiGridLine className="size-4" />
								</span>
								<div className="portfolio-technology-popover-title">
									<Popover.Title>
										Technology stack
										<span className="sr-only"> for {projectTitle}</span>
									</Popover.Title>
									<Popover.Description>
										{entries.length} technologies
									</Popover.Description>
								</div>
								<Popover.Close
									render={
										<Button
											variant="plain"
											size="icon"
											className="portfolio-technology-close"
											data-press-motion="surface"
											aria-label="Close technology stack"
										/>
									}
								>
									<RiCloseLine aria-hidden="true" className="size-4" />
								</Popover.Close>
							</div>
							<div className="portfolio-technology-popover-body">
								<ul
									aria-label="Full technology stack"
									className="portfolio-technology-list"
								>
									{orderedEntries.map((name, index) => (
										<li
											key={name}
											style={
												{
													"--technology-row": Math.floor(index / 2),
												} as CSSProperties
											}
										>
											<TechnologyReference name={name}>
												<TechnologyMark
													name={name}
													layout="inline"
													tone="brand"
												/>
											</TechnologyReference>
										</li>
									))}
								</ul>
							</div>
							{canRotate && !reducedMotion && (
								<div className="portfolio-technology-popover-footer">
									<Button
										variant="plain"
										className="portfolio-technology-pause"
										data-press-motion="surface"
										aria-label={
											paused ? "Resume logo rotation" : "Pause logo rotation"
										}
										aria-pressed={paused}
										onClick={() => setPaused((value) => !value)}
									>
										<StateSwap
											value={paused ? "play" : "pause"}
											items={{
												play: <RiPlayLine className="size-4" />,
												pause: <RiPauseLine className="size-4" />,
											}}
										/>
										<StateSwap
											kind="text"
											value={paused ? "paused" : "running"}
											items={{
												paused: "Resume rotation",
												running: "Pause rotation",
											}}
										/>
									</Button>
								</div>
							)}
						</Popover.Popup>
					</Popover.Positioner>
				</Popover.Portal>
			</Popover.Root>
		</div>
	);
}
