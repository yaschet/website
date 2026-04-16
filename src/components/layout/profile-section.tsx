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
									"group/avatar relative h-[var(--portfolio-avatar-size)] w-[var(--portfolio-avatar-size)] overflow-hidden rounded-(--radius) border shadow-[inset_0_0_0_1px_rgba(15,23,42,0.03)] dark:shadow-[inset_0_0_0_1px_rgba(248,250,252,0.03)]",
									avatarBorder,
									avatarBg,
								)}
							>
								<Image
									src={avatarImage}
									alt="Yassine Chettouch"
									className="object-cover transition-transform duration-200 group-hover/avatar:scale-[1.02]"
									placeholder="blur"
									fill
									sizes="(max-width: 640px) 60px, 60px"
								/>
								<AvatarFallback
									className={cn(
										"portfolio-chip-label flex h-full w-full items-center justify-center",
										avatarBg,
										textSecondary,
									)}
								>
									YC
								</AvatarFallback>
							</Avatar>
							<div className="portfolio-stack-tight min-w-0">
								<h1 className="portfolio-masthead-name truncate text-surface-900 dark:text-surface-100">
									Yassine Chettouch
								</h1>
								<p className="portfolio-masthead-role truncate text-surface-500 dark:text-surface-400">
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
