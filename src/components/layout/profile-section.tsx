"use client";

import { GithubLogoIcon, LinkedinLogoIcon, XLogoIcon } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import avatarImage from "@/public/images/avatar.jpeg";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { HoverTooltip } from "@/src/components/ui/hover-tooltip";
import { Reveal } from "@/src/components/ui/reveal";

export function ProfileSection() {
	const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);
	const [isAvatarDitherFlashing, setIsAvatarDitherFlashing] = useState(false);
	const avatarDitherTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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

	const triggerAvatarDitherFlash = useCallback(() => {
		if (avatarDitherTimeoutRef.current) {
			clearTimeout(avatarDitherTimeoutRef.current);
		}

		setIsAvatarDitherFlashing(true);
		avatarDitherTimeoutRef.current = setTimeout(() => {
			setIsAvatarDitherFlashing(false);
			avatarDitherTimeoutRef.current = null;
		}, 150);
	}, []);

	useEffect(() => {
		return () => {
			if (avatarDitherTimeoutRef.current) {
				clearTimeout(avatarDitherTimeoutRef.current);
			}
		};
	}, []);

	return (
		<section id="profile" className="relative z-10 w-full shrink-0">
			<Reveal phase={1} className="w-full">
				<div className="w-full">
					<div className="portfolio-box-pad grid grid-cols-[minmax(0,1fr)_auto] items-center gap-[var(--portfolio-space-1)] sm:gap-[var(--portfolio-space-2)]">
						<div className="flex min-w-0 items-center gap-[var(--portfolio-space-1)] sm:gap-[var(--portfolio-space-2)]">
							<Avatar
								className={cn(
									"group/avatar relative h-[var(--portfolio-space-5)] w-[var(--portfolio-space-5)] overflow-hidden rounded-(--radius) border shadow-[inset_0_0_0_1px_rgba(15,23,42,0.03)] before:pointer-events-none before:absolute before:inset-0 before:z-[1] before:bg-[linear-gradient(180deg,rgba(15,23,42,0.04)_0%,rgba(15,23,42,0.14)_100%)] before:opacity-100 before:transition-opacity before:duration-300 after:pointer-events-none after:absolute after:inset-0 after:z-[1] after:opacity-[0.08] after:mix-blend-multiply after:transition-opacity after:duration-300 hover:after:opacity-[0.02] hover:before:opacity-0 dark:shadow-[inset_0_0_0_1px_rgba(248,250,252,0.03)] dark:after:opacity-[0.06] dark:after:mix-blend-screen dark:hover:after:opacity-[0.02] dark:before:bg-[linear-gradient(180deg,rgba(248,250,252,0.02)_0%,rgba(248,250,252,0.12)_100%)] after:[background-image:radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.16)_1px,transparent_0)] after:[background-size:5px_5px] dark:after:[background-image:radial-gradient(circle_at_1px_1px,rgba(248,250,252,0.14)_1px,transparent_0)]",
									avatarBorder,
									avatarBg,
								)}
								onMouseEnter={triggerAvatarDitherFlash}
								onMouseLeave={triggerAvatarDitherFlash}
								onFocus={triggerAvatarDitherFlash}
								onBlur={triggerAvatarDitherFlash}
							>
								<Image
									src={avatarImage}
									alt="Yassine Chettouch"
									className="scale-[1.01] object-cover transition-[filter,transform] duration-300 [filter:grayscale(1)_contrast(1.14)_brightness(.9)_sepia(.03)] group-hover/avatar:scale-100 group-hover/avatar:[filter:grayscale(0)_contrast(1)_brightness(1)_sepia(0)]"
									placeholder="blur"
									fill
									sizes="60px"
								/>
								<div
									className={cn(
										"pointer-events-none absolute inset-0 z-[2] transition-opacity duration-150 ease-out",
										"mix-blend-multiply [background-image:radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.26)_1px,transparent_0),repeating-linear-gradient(90deg,rgba(15,23,42,0.12)_0_1px,transparent_1px_4px)] [background-size:4px_4px,100%_100%] dark:mix-blend-screen dark:[background-image:radial-gradient(circle_at_1px_1px,rgba(248,250,252,0.22)_1px,transparent_0),repeating-linear-gradient(90deg,rgba(248,250,252,0.1)_0_1px,transparent_1px_4px)]",
										isAvatarDitherFlashing ? "opacity-100" : "opacity-0",
									)}
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
