"use client";

import {
	RiArrowDownSLine,
	RiEqualizerLine,
	RiSettings3Line,
	RiSpeedUpLine,
} from "@remixicon/react";
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

function VideoSettingGroup({ label, value, options, onValueChange }: VideoSettingGroupProps) {
	return (
		<DropdownMenuGroup>
			<DropdownMenuLabel>{label}</DropdownMenuLabel>
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
	return (
		<DropdownMenu modal={false} open={open} onOpenChange={onOpenChange}>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					aria-label="Video settings"
					data-player-interactive
					className={`${GALLERY_CHROME_BUTTON_CLASS_NAME} ${styles.settingsTrigger} portfolio-media-material border-0`}
				>
					<RiSettings3Line size={16} aria-hidden="true" />
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
				{actions.length > 0 && (
					<DropdownMenuGroup>
						<DropdownMenuLabel>Playback controls</DropdownMenuLabel>
						{actions.map((action) => (
							<DropdownMenuItem key={action.label} onClick={action.onClick}>
								<DropdownMenuItemContent>{action.label}</DropdownMenuItemContent>
							</DropdownMenuItem>
						))}
					</DropdownMenuGroup>
				)}
				{groups.map((group) => (
					<VideoSettingGroup key={group.label} {...group} />
				))}
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
					size="md"
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
