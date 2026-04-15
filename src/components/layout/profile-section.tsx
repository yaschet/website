"use client";

import { GithubLogoIcon, LinkedinLogoIcon, XLogoIcon } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import avatarImage from "@/public/images/avatar.jpeg";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { HoverTooltip } from "@/src/components/ui/hover-tooltip";
import { Reveal } from "@/src/components/ui/reveal";

export function ProfileSection() {
	const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);
	// Standard theme colors since we removed mesh gradient dependency
	const textSecondary = "text-surface-500";
	const iconColor =
		"text-surface-500 hover:text-surface-900 dark:text-surface-400 dark:hover:text-surface-100 bg-surface-100/50 hover:bg-surface-200/50 dark:bg-surface-800/50 dark:hover:bg-surface-700/50";
	const avatarBorder = "border-surface-200 dark:border-surface-800";
	const avatarBg = "bg-surface-100 dark:bg-surface-900";
	const socialLinks = [
		{
			label: "LinkedIn",
			href: "https://linkedin.com/in/yassinechettouch",
			Icon: LinkedinLogoIcon,
		},
		{ label: "GitHub", href: "https://github.com/yaschet", Icon: GithubLogoIcon },
		{ label: "X", href: "https://x.com/yaschett", Icon: XLogoIcon },
	];

	return (
		<section id="profile" className="relative z-10 w-full shrink-0">
			<Reveal phase={1} className="w-full">
				<div className="w-full">
					<div className="portfolio-box-pad grid grid-cols-[minmax(0,1fr)_auto] items-center gap-[var(--portfolio-space-1)] sm:gap-[var(--portfolio-space-2)]">
						<div className="flex min-w-0 items-center gap-[var(--portfolio-space-1)] sm:gap-[var(--portfolio-space-2)]">
							<Avatar
								className={cn(
									"group/avatar relative h-[var(--portfolio-space-5)] w-[var(--portfolio-space-5)] overflow-hidden rounded-(--radius) border before:pointer-events-none before:absolute before:inset-0 before:z-[1] before:bg-surface-950/8 before:opacity-100 before:transition-opacity before:duration-300 hover:before:opacity-0 dark:before:bg-surface-50/8",
									avatarBorder,
									avatarBg,
								)}
							>
								<Image
									src={avatarImage}
									alt="Yassine Chettouch"
									className="scale-[1.01] object-cover brightness-[0.94] contrast-[1.06] grayscale saturate-0 transition-[filter,transform] duration-300 group-hover/avatar:scale-100 group-hover/avatar:brightness-100 group-hover/avatar:contrast-100 group-hover/avatar:grayscale-0 group-hover/avatar:saturate-100"
									placeholder="blur"
									fill
									sizes="60px"
								/>
								<AvatarFallback
									className={cn(
										"flex h-full w-full items-center justify-center font-medium text-sm",
										avatarBg,
										textSecondary,
									)}
								>
									YC
								</AvatarFallback>
							</Avatar>
							<div className="min-w-0">
								<h1 className="truncate font-semibold text-[18px] text-surface-900 leading-[26px] sm:text-[20px] sm:leading-[30px] dark:text-surface-100">
									Yassine Chettouch
								</h1>
								<p className="portfolio-body-sm text-surface-500 dark:text-surface-400">
									Software Engineer
								</p>
							</div>
						</div>

						<div className="flex items-center gap-[var(--portfolio-space-1)] justify-self-end">
							{socialLinks.map(({ label, href, Icon }) => (
								<div key={label} className="relative">
									<Link
										href={href}
										target="_blank"
										aria-label={label}
										onMouseEnter={() => setHoveredIcon(label)}
										onMouseLeave={() => setHoveredIcon(null)}
										onFocus={() => setHoveredIcon(label)}
										onBlur={() => setHoveredIcon(null)}
										className={cn(
											"inline-flex h-[var(--portfolio-control-sm)] w-[var(--portfolio-control-sm)] items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface-400 focus-visible:ring-offset-2 sm:h-[var(--portfolio-icon-touch)] sm:w-[var(--portfolio-icon-touch)]",
											iconColor,
										)}
									>
										<Icon
											weight="regular"
											className="h-[var(--portfolio-icon-sm)] w-[var(--portfolio-icon-sm)]"
										/>
									</Link>
									<HoverTooltip visible={hoveredIcon === label}>
										{label}
									</HoverTooltip>
								</div>
							))}
						</div>
					</div>
				</div>
			</Reveal>
		</section>
	);
}
