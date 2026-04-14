"use client";

import { GithubLogoIcon, LinkedinLogoIcon, XLogoIcon } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import avatarImage from "@/public/images/avatar.jpeg";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { Reveal } from "@/src/components/ui/reveal";

export function ProfileSection() {
	// Standard theme colors since we removed mesh gradient dependency
	const textSecondary = "text-surface-500";
	const iconColor =
		"text-surface-500 hover:text-surface-900 dark:text-surface-400 dark:hover:text-surface-100";
	const avatarBorder = "border-surface-200 dark:border-surface-800";
	const avatarBg = "bg-surface-100 dark:bg-surface-900";

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
							<Link
								href="https://linkedin.com/in/yassinechettouch"
								target="_blank"
								aria-label="LinkedIn"
								className={cn(
									"inline-flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface-400 focus-visible:ring-offset-2",
									iconColor,
								)}
								style={{
									width: "var(--portfolio-icon-touch)",
									height: "var(--portfolio-icon-touch)",
								}}
							>
								<LinkedinLogoIcon
									weight="regular"
									style={{
										width: "var(--portfolio-icon-sm)",
										height: "var(--portfolio-icon-sm)",
									}}
								/>
							</Link>
							<Link
								href="https://github.com/yaschet"
								target="_blank"
								aria-label="GitHub"
								className={cn(
									"inline-flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface-400 focus-visible:ring-offset-2",
									iconColor,
								)}
								style={{
									width: "var(--portfolio-icon-touch)",
									height: "var(--portfolio-icon-touch)",
								}}
							>
								<GithubLogoIcon
									weight="regular"
									style={{
										width: "var(--portfolio-icon-sm)",
										height: "var(--portfolio-icon-sm)",
									}}
								/>
							</Link>
							<Link
								href="https://x.com/yaschett"
								target="_blank"
								aria-label="X"
								className={cn(
									"inline-flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface-400 focus-visible:ring-offset-2",
									iconColor,
								)}
								style={{
									width: "var(--portfolio-icon-touch)",
									height: "var(--portfolio-icon-touch)",
								}}
							>
								<XLogoIcon
									weight="regular"
									style={{
										width: "var(--portfolio-icon-sm)",
										height: "var(--portfolio-icon-sm)",
									}}
								/>
							</Link>
						</div>
					</div>
				</div>
			</Reveal>
		</section>
	);
}
