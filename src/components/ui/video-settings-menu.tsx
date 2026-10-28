"use client";

import { RiArrowDownSLine, RiEqualizerLine, RiSpeedUpLine } from "@remixicon/react";
import { Button } from "./button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItemContent,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "./dropdown-menu";
import { StateSwap } from "./state-swap";

export interface VideoSettingOption {
	label: string;
	value: string;
	detailLabel?: string;
	chipLabel?: string;
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
				<DropdownMenuGroup>
					<DropdownMenuLabel>
						{kind === "quality" ? "Video quality" : "Playback speed"}
					</DropdownMenuLabel>
					<DropdownMenuRadioGroup value={value} onValueChange={onValueChange}>
						{options.map((option) => (
							<DropdownMenuRadioItem
								key={option.value}
								value={option.value}
								closeOnClick
							>
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
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
