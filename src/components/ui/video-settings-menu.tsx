"use client";

import {
	RiArrowDownSLine,
	RiArrowLeftSLine,
	RiArrowRightSLine,
	RiEqualizerLine,
	RiSettings3Line,
	RiSpeedUpLine,
} from "@remixicon/react";
import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Button } from "./button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuItemContent,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "./dropdown-menu";
import { GALLERY_CHROME_BUTTON_CLASS_NAME } from "./gallery-chrome";
import styles from "./portfolio-mux-video.module.css";
import { StateSwap } from "./state-swap";

export interface VideoSettingOption {
	label: string;
	value: string;
	detailLabel?: string;
	chipLabel?: string;
}

interface VideoSettingGroupProps {
	label: string;
	value: string;
	options: readonly VideoSettingOption[];
	onValueChange: (value: string) => void;
}

function VideoSettingGroup({
	label,
	value,
	options,
	onValueChange,
	hideLabel = false,
}: VideoSettingGroupProps & { hideLabel?: boolean }) {
	return (
		<DropdownMenuGroup>
			{!hideLabel && <DropdownMenuLabel>{label}</DropdownMenuLabel>}
			<DropdownMenuRadioGroup value={value} onValueChange={onValueChange} aria-label={label}>
				{options.map((option) => (
					<DropdownMenuRadioItem key={option.value} value={option.value} closeOnClick>
						<DropdownMenuItemContent>
							<span className="video-setting-option">
								<span>{option.label}</span>
								{(option.detailLabel || option.chipLabel) && (
									<span className="video-setting-meta">
										{[option.detailLabel, option.chipLabel]
											.filter(Boolean)
											.join(" · ")}
									</span>
								)}
							</span>
						</DropdownMenuItemContent>
					</DropdownMenuRadioItem>
				))}
			</DropdownMenuRadioGroup>
		</DropdownMenuGroup>
	);
}

/** One narrow-player trigger; both sets of choices use the existing menu keyboard model. */
export function CompactVideoSettingsMenu({
	groups,
	actions = [],
	open,
	onOpenChange,
	container,
}: {
	groups: readonly VideoSettingGroupProps[];
	actions?: readonly { label: string; onClick: () => void }[];
	open: boolean;
	onOpenChange: (open: boolean) => void;
	container?: HTMLElement | null;
}) {
	const [view, setView] = useState<string | null>(null);
	const [viewHeight, setViewHeight] = useState<number | undefined>();
	const viewRef = useRef<HTMLDivElement>(null);
	const reducedMotion = useReducedMotion();
	const measureView = useCallback((element: HTMLDivElement | null) => {
		viewRef.current = element;
		if (element) setViewHeight(element.offsetHeight);
	}, []);
	// biome-ignore lint/correctness/useExhaustiveDependencies: keyed views replace the measured element.
	useLayoutEffect(() => {
		const element = viewRef.current;
		if (!open || !element) return;
		const measure = () => setViewHeight(element.offsetHeight);
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(element);
		return () => observer.disconnect();
	}, [open, view]);
	const selectedGroup = groups.find((group) => group.label === view);
	const orderedGroups = [...groups].sort(
		(a, b) => Number(b.label === "Video quality") - Number(a.label === "Video quality"),
	);
	useEffect(() => {
		if (!open) {
			setView(null);
			setViewHeight(undefined);
		}
	}, [open]);
	// biome-ignore lint/correctness/useExhaustiveDependencies: each view replaces the focused menu item.
	useEffect(() => {
		if (!open) return;
		const frame = requestAnimationFrame(() => {
			viewRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
		});
		return () => cancelAnimationFrame(frame);
	}, [view, open]);
	return (
		<DropdownMenu modal={false} open={open} onOpenChange={onOpenChange}>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					aria-label="Video settings"
					data-player-interactive
					className={`${GALLERY_CHROME_BUTTON_CLASS_NAME} ${styles.settingsTrigger} portfolio-media-material border-0`}
				>
					<motion.span
						animate={{ rotate: open ? 30 : 0 }}
						transition={{ duration: reducedMotion ? 0 : 0.18 }}
					>
						<RiSettings3Line size={16} aria-hidden="true" />
					</motion.span>
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				container={container}
				align="end"
				side="top"
				sideOffset={8}
				collisionPadding={12}
				aria-label="Video settings"
				data-player-interactive
				data-video-settings="compact"
				className={`${styles.compactSettings} portfolio-media-material z-[90] max-h-[min(20rem,var(--available-height))]`}
			>
				<motion.div
					initial={false}
					animate={{ height: viewHeight ?? "auto" }}
					transition={{ duration: reducedMotion ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}
					className={styles.settingsViewport}
				>
					<motion.div
						key={view ?? "settings"}
						ref={measureView}
						initial={reducedMotion ? false : { x: view ? 16 : -16, opacity: 0 }}
						animate={{ x: 0, opacity: 1 }}
						transition={{
							duration: reducedMotion ? 0 : 0.18,
							ease: [0.22, 1, 0.36, 1],
						}}
						onKeyDown={(event) => {
							if (event.key === "ArrowLeft" && view) {
								event.preventDefault();
								setView(null);
							}
						}}
					>
						{selectedGroup ? (
							<>
								<DropdownMenuItem
									closeOnClick={false}
									aria-label="Back to settings"
									className={styles.settingsHeader}
									onClick={() => setView(null)}
								>
									<RiArrowLeftSLine aria-hidden="true" />
									<DropdownMenuItemContent>
										{selectedGroup.label === "Video quality"
											? "Quality"
											: "Playback speed"}
									</DropdownMenuItemContent>
								</DropdownMenuItem>
								<VideoSettingGroup {...selectedGroup} hideLabel />
							</>
						) : (
							<>
								{orderedGroups.map((group) => {
									const option = group.options.find(
										(item) => item.value === group.value,
									);
									return (
										<DropdownMenuItem
											key={group.label}
											closeOnClick={false}
											onClick={() => setView(group.label)}
										>
											<DropdownMenuItemContent>
												{group.label === "Video quality"
													? "Quality"
													: "Playback speed"}
											</DropdownMenuItemContent>
											<span className={styles.settingsValue}>
												{option?.label ?? group.value}
											</span>
											<RiArrowRightSLine aria-hidden="true" />
										</DropdownMenuItem>
									);
								})}
								{actions.map((action) => (
									<DropdownMenuItem key={action.label} onClick={action.onClick}>
										<DropdownMenuItemContent>
											{action.label}
										</DropdownMenuItemContent>
									</DropdownMenuItem>
								))}
							</>
						)}
					</motion.div>
				</motion.div>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

interface VideoSettingsMenuProps {
	kind: "quality" | "speed";
	label: string;
	triggerLabel: string;
	value: string;
	options: readonly VideoSettingOption[];
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onValueChange: (value: string) => void;
	/** Keep the popup in the active fullscreen subtree when the player owns it. */
	container?: HTMLElement | null;
}

/** The actual player menu, also rendered independently of networked media in the workshop. */
export function VideoSettingsMenu({
	kind,
	label,
	triggerLabel,
	value,
	options,
	open,
	onOpenChange,
	onValueChange,
	container,
}: VideoSettingsMenuProps) {
	return (
		<DropdownMenu size="md" modal={false} open={open} onOpenChange={onOpenChange}>
			<DropdownMenuTrigger asChild>
				<Button
					type="button"
					aria-label={`${label}: ${triggerLabel}`}
					data-player-interactive
					variant="soft"
					size="xl"
					className="portfolio-media-material video-setting-trigger tabular-nums"
				>
					{kind === "quality" ? (
						<RiEqualizerLine aria-hidden="true" />
					) : (
						<RiSpeedUpLine aria-hidden="true" />
					)}
					<StateSwap
						kind="text"
						sizing="content"
						value={value}
						items={Object.fromEntries(
							options.map((option) => [
								option.value,
								option.value === value ? triggerLabel : option.label,
							]),
						)}
					/>
					<RiArrowDownSLine aria-hidden="true" className="video-setting-chevron" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				container={container}
				align="end"
				side="top"
				sideOffset={8}
				collisionPadding={12}
				aria-label={label}
				data-player-interactive
				data-video-settings=""
				className="portfolio-media-material z-[90] min-w-52"
			>
				<VideoSettingGroup
					label={kind === "quality" ? "Video quality" : "Playback speed"}
					value={value}
					options={options}
					onValueChange={onValueChange}
				/>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
