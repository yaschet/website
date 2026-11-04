"use client";

import { RiAddLine, RiDragMove2Line, RiFocus3Line, RiSubtractLine } from "@remixicon/react";
import { type CSSProperties, type ReactNode, useEffect, useId, useRef, useState } from "react";
import { Button } from "@/src/components/ui/button";
import styles from "./figure-viewport.module.css";

export interface FigureBounds {
	x: number;
	y: number;
	width: number;
	height: number;
}

export interface FigureView {
	width: number;
	height: number;
	focus: FigureBounds;
	drawing: ReactNode;
}

interface Camera {
	x: number;
	y: number;
	scale: number;
}

const MAX_ZOOM = 2;
const INSET = 16;

/** Read-only viewport. Page scrolling stays native until the reader enables drag mode. */
export function FigureViewport({
	label,
	stepId,
	wide,
	compact,
}: {
	label: string;
	stepId: string;
	wide: FigureView;
	compact: FigureView;
}) {
	const helpId = useId();
	const frame = useRef<HTMLDivElement>(null);
	const artboard = useRef<HTMLDivElement>(null);
	const zoomOutput = useRef<HTMLOutputElement>(null);
	const cameraRef = useRef<Camera>({ x: 0, y: 0, scale: 1 });
	const paintFrame = useRef<number | null>(null);
	const gestureOrigin = useRef({ left: 0, top: 0 });
	const pointers = useRef(new Map<number, { x: number; y: number }>());
	const [size, setSize] = useState({ width: 0, height: 0 });
	const [camera, setCamera] = useState<Camera>({ x: 0, y: 0, scale: 1 });
	const [drag, setDrag] = useState(false);
	const [direct, setDirect] = useState(false);
	// Direct manipulation paints one transform per display frame, without a React commit.
	const paintCamera = (next: Camera) => {
		const previous = cameraRef.current;
		if (previous.x === next.x && previous.y === next.y && previous.scale === next.scale) return;
		cameraRef.current = next;
		if (paintFrame.current !== null) return;
		paintFrame.current = requestAnimationFrame(() => {
			paintFrame.current = null;
			const current = cameraRef.current;
			if (artboard.current)
				artboard.current.style.transform = `translate(${current.x}px, ${current.y}px) scale(${current.scale})`;
			const percentage = `${Math.round(current.scale * 100)}%`;
			if (zoomOutput.current && zoomOutput.current.textContent !== percentage)
				zoomOutput.current.textContent = percentage;
		});
	};
	const commitCamera = (next: Camera) => {
		if (paintFrame.current !== null) cancelAnimationFrame(paintFrame.current);
		paintFrame.current = null;
		cameraRef.current = next;
		setCamera(next);
	};
	const endPointer = (pointerId: number) => {
		pointers.current.delete(pointerId);
		if (pointers.current.size === 0) {
			commitCamera(cameraRef.current);
			if (frame.current) frame.current.dataset.manipulating = "false";
		}
	};
	useEffect(
		() => () => {
			if (paintFrame.current !== null) cancelAnimationFrame(paintFrame.current);
		},
		[],
	);
	// Browser zoom can report a nominal 832px track as 831.99px.
	const narrow = size.width > 0 && size.width < wide.width + INSET * 2 - 1;
	const view = narrow ? compact : wide;
	const compactScale = Math.min(
		1,
		Math.max(compact.height >= 560 ? 0.9 : 0, (size.width - INSET * 2) / compact.focus.width),
	);
	const minZoom =
		size.width && size.height
			? Math.min(
					(size.width - INSET * 2) / view.focus.width,
					(size.height - INSET * 2) / view.focus.height,
					1,
				)
			: 1;

	useEffect(() => {
		const element = frame.current;
		if (!element) return;
		const observer = new ResizeObserver(([entry]) => {
			const { width, height } = entry.contentRect;
			setSize((previous) =>
				previous.width === width && previous.height === height
					? previous
					: { width, height },
			);
		});
		observer.observe(element);
		return () => observer.disconnect();
	}, []);

	const { x: focusX, y: focusY, width: focusWidth, height: focusHeight } = view.focus;
	useEffect(() => {
		if (!size.width || !size.height) return;
		// Mobile begins at a readable width. Fit remains an explicit whole-map overview.
		const scale = narrow
			? compactScale
			: Math.min(
					(size.width - INSET * 2) / focusWidth,
					(size.height - INSET * 2) / focusHeight,
					1,
				);
		setDirect(false);
		setDrag(false);
		const next = {
			scale,
			x: (size.width - focusWidth * scale) / 2 - focusX * scale,
			y: narrow
				? Math.max(INSET, (size.height - focusHeight * scale) / 2) - focusY * scale
				: (size.height - focusHeight * scale) / 2 - focusY * scale,
		};
		if (paintFrame.current !== null) cancelAnimationFrame(paintFrame.current);
		paintFrame.current = null;
		pointers.current.clear();
		if (frame.current) frame.current.dataset.manipulating = "false";
		cameraRef.current = next;
		setCamera(next);
	}, [size, narrow, compactScale, focusX, focusY, focusWidth, focusHeight]);

	const bound = (next: Camera): Camera => {
		const clampAxis = (position: number, extent: number, available: number) =>
			extent < available - INSET * 2
				? (available - extent) / 2
				: Math.min(INSET, Math.max(available - extent - INSET, position));
		return {
			...next,
			x:
				clampAxis(next.x + focusX * next.scale, focusWidth * next.scale, size.width) -
				focusX * next.scale,
			y:
				clampAxis(next.y + focusY * next.scale, focusHeight * next.scale, size.height) -
				focusY * next.scale,
		};
	};

	const canPan =
		focusWidth * camera.scale > size.width - INSET * 2 + 1 ||
		focusHeight * camera.scale > size.height - INSET * 2 + 1;
	const dragEnabled = drag && canPan;
	const zoom = (factor: number, immediate = false) => {
		setDirect(immediate);
		const previous = cameraRef.current;
		const scale = Math.max(minZoom, Math.min(MAX_ZOOM, previous.scale * factor));
		const ratio = scale / previous.scale;
		commitCamera(
			bound({
				scale,
				x: size.width / 2 - (size.width / 2 - previous.x) * ratio,
				y: size.height / 2 - (size.height / 2 - previous.y) * ratio,
			}),
		);
	};
	const fitView = (immediate = false) => {
		setDirect(immediate);
		setDrag(false);
		pointers.current.clear();
		if (frame.current) frame.current.dataset.manipulating = "false";
		commitCamera({
			scale: minZoom,
			x: (size.width - focusWidth * minZoom) / 2 - focusX * minZoom,
			y: (size.height - focusHeight * minZoom) / 2 - focusY * minZoom,
		});
	};
	const move = (x: number, y: number, gesture = false) => {
		const previous = cameraRef.current;
		const next = bound({ ...previous, x: previous.x + x, y: previous.y + y });
		if (gesture) paintCamera(next);
		else {
			setDirect(true);
			commitCamera(next);
		}
	};

	return (
		<div className={styles.root} data-architecture-viewport>
			<fieldset className={styles.toolbar}>
				<legend className="sr-only">Diagram view controls</legend>
				<div className={styles.zoomControls}>
					<Button
						variant="soft"
						color="secondary"
						size="icon"
						aria-label="Zoom out"
						disabled={camera.scale <= minZoom + 0.001}
						onClick={(event) => zoom(1 / 1.25, event.detail === 0)}
					>
						<RiSubtractLine />
					</Button>
					<output
						ref={zoomOutput}
						className={styles.percentage}
						aria-label="Diagram zoom"
						aria-live={dragEnabled ? "off" : "polite"}
					>
						{Math.round(camera.scale * 100)}%
					</output>
					<Button
						variant="soft"
						color="secondary"
						size="icon"
						aria-label="Zoom in"
						disabled={camera.scale >= MAX_ZOOM}
						onClick={(event) => zoom(1.25, event.detail === 0)}
					>
						<RiAddLine />
					</Button>
				</div>
				<div className={styles.actions}>
					<Button
						variant="soft"
						color="secondary"
						aria-label="Fit entire diagram"
						onClick={(event) => fitView(event.detail === 0)}
					>
						<RiFocus3Line />
						<span>Fit</span>
					</Button>
					<Button
						variant="soft"
						color="secondary"
						size="icon"
						aria-label="Drag canvas"
						aria-pressed={dragEnabled}
						disabled={!canPan}
						aria-describedby={helpId}
						onClick={() => {
							pointers.current.clear();
							setDrag(!drag);
						}}
					>
						<RiDragMove2Line />
					</Button>
				</div>
			</fieldset>
			<div
				ref={frame}
				className={styles.viewport}
				role="application"
				aria-label={label}
				aria-describedby={helpId}
				// biome-ignore lint/a11y/noNoninteractiveTabindex: Named canvas supports arrow, zoom and fit keyboard commands.
				tabIndex={0}
				data-canvas-viewport
				data-drag={dragEnabled}
				data-direct={direct}
				data-step={stepId}
				style={
					{
						"--canvas-ratio": (wide.width + INSET * 2) / (wide.height + INSET * 2),
						// Complete mobile stages receive equal clearance around their visible bounds.
						// The full map remains a bounded, reader-controlled camera.
						"--canvas-compact-height":
							compact.height < 560 && size.width
								? `${size.width + (compact.focus.height - compact.focus.width) * compactScale}px`
								: "560px",
					} as CSSProperties
				}
				onKeyDown={(event) => {
					const movement: Record<string, [number, number]> = {
						ArrowLeft: [64, 0],
						ArrowRight: [-64, 0],
						ArrowUp: [0, 64],
						ArrowDown: [0, -64],
					};
					if (movement[event.key]) {
						event.preventDefault();
						move(...movement[event.key]);
					} else if (event.key === "+" || event.key === "=") {
						event.preventDefault();
						zoom(1.25, true);
					} else if (event.key === "-") {
						event.preventDefault();
						zoom(1 / 1.25, true);
					} else if (event.key === "Home" || event.key === "0") {
						event.preventDefault();
						fitView(true);
					} else if (event.key === "Escape" && dragEnabled) {
						event.stopPropagation();
						pointers.current.clear();
						commitCamera(cameraRef.current);
						event.currentTarget.dataset.manipulating = "false";
						setDrag(false);
					}
				}}
				onPointerDown={(event) => {
					if (!dragEnabled || event.button !== 0) return;
					if (pointers.current.size === 0) {
						// Interrupt a running zoom at its visible position, not its target.
						const element = artboard.current;
						if (element) {
							const matrix = new DOMMatrixReadOnly(
								getComputedStyle(element).transform,
							);
							commitCamera({ x: matrix.m41, y: matrix.m42, scale: matrix.m11 });
						}
						const rect = event.currentTarget.getBoundingClientRect();
						gestureOrigin.current = { left: rect.left, top: rect.top };
					}
					event.currentTarget.dataset.manipulating = "true";
					event.currentTarget.setPointerCapture(event.pointerId);
					pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
					setDirect(true);
				}}
				onPointerMove={(event) => {
					const previous = pointers.current.get(event.pointerId);
					if (!dragEnabled || !previous) return;
					const others = [...pointers.current.entries()].filter(
						([id]) => id !== event.pointerId,
					);
					pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
					if (others.length === 1) {
						const other = others[0][1];
						const before = Math.hypot(previous.x - other.x, previous.y - other.y);
						const after = Math.hypot(event.clientX - other.x, event.clientY - other.y);
						if (before < 8) return;
						const rect = gestureOrigin.current;
						const origin = {
							x: (previous.x + other.x) / 2 - rect.left,
							y: (previous.y + other.y) / 2 - rect.top,
						};
						const current = cameraRef.current;
						const scale = Math.max(
							minZoom,
							Math.min(MAX_ZOOM, (current.scale * after) / before),
						);
						const ratio = scale / current.scale;
						paintCamera(
							bound({
								scale,
								x:
									origin.x -
									(origin.x - current.x) * ratio +
									(event.clientX - previous.x) / 2,
								y:
									origin.y -
									(origin.y - current.y) * ratio +
									(event.clientY - previous.y) / 2,
							}),
						);
					} else if (others.length === 0)
						move(event.clientX - previous.x, event.clientY - previous.y, true);
				}}
				onPointerUp={(event) => endPointer(event.pointerId)}
				onPointerCancel={(event) => endPointer(event.pointerId)}
				onLostPointerCapture={(event) => endPointer(event.pointerId)}
			>
				<div
					ref={artboard}
					className={styles.artboard}
					data-canvas-artboard
					style={{
						width: view.width,
						height: view.height,
						transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.scale})`,
						visibility: size.width ? "visible" : "hidden",
					}}
				>
					{view.drawing}
				</div>
			</div>
			<p className={styles.help} id={helpId}>
				{dragEnabled
					? "Drag to pan · Pinch to zoom · Escape exits"
					: canPan
						? "Choose a step to inspect · Enable drag to explore"
						: "Whole diagram in view · Zoom in to pan"}
				<span className="sr-only">
					{" "}
					Focus the canvas and use arrow keys to pan, plus or minus to zoom, and Home to
					fit. The full explanation follows the diagram.
				</span>
			</p>
		</div>
	);
}
