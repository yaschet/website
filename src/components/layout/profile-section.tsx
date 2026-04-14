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
					<div className="portfolio-box-pad flex h-full items-center justify-between">
						<div className="flex items-center gap-5">
							<Avatar
								className={cn(
									"relative overflow-hidden rounded-(--radius) border",
									avatarBorder,
									avatarBg,
								)}
								style={{
									width: "var(--portfolio-avatar-size)",
									height: "var(--portfolio-avatar-size)",
								}}
							>
								<Image
									src={avatarImage}
									alt="Yassine Chettouch"
									className="object-cover"
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
							<div>
								<h1 className="font-semibold text-[20px] text-surface-900 leading-[30px] dark:text-surface-100">
									Yassine Chettouch
								</h1>
								<p className="portfolio-body-sm text-surface-500 dark:text-surface-400">
									Software Engineer
								</p>
							</div>
						</div>

						<div className="flex items-center gap-2.5">
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
											"inline-flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface-400 focus-visible:ring-offset-2",
											iconColor,
										)}
										style={{
											width: "var(--portfolio-icon-touch)",
											height: "var(--portfolio-icon-touch)",
										}}
									>
										<Icon
											weight="regular"
											style={{
												width: "var(--portfolio-icon-sm)",
												height: "var(--portfolio-icon-sm)",
											}}
										/>
									</Link>
									<HoverTooltip visible={hoveredIcon === label}>{label}</HoverTooltip>
								</div>
							))}
						</div>
					</div>
				</div>
			</Reveal>
		</section>
	);
}
