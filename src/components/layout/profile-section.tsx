"use client";

import { GithubLogoIcon, LinkedinLogoIcon, XLogoIcon } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import avatarImage from "@/public/images/avatar.jpeg";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { Reveal } from "@/src/components/ui/reveal";
import { SwissGridSection } from "@/src/components/ui/swiss-grid-canvas";

export function ProfileSection() {
	// Standard theme colors since we removed mesh gradient dependency
	const textPrimary = "text-surface-900 dark:text-surface-100";
	const textSecondary = "text-surface-500";
	const iconColor =
		"text-surface-500 hover:text-surface-900 dark:text-surface-400 dark:hover:text-surface-100";
	const avatarBorder = "border-surface-200 dark:border-surface-800";
	const avatarBg = "bg-surface-100 dark:bg-surface-900";

	return (
		<SwissGridSection id="profile" className="relative z-10 w-full shrink-0">
			<Reveal phase={1} className="w-full">
				<div className="w-full">
					<div className="mx-auto flex h-full max-w-3xl items-center justify-between px-6 py-12 sm:px-8">
						<div className="flex items-center gap-4">
							<Avatar
								className={cn(
									"relative size-14 overflow-hidden rounded-(--radius) border",
									avatarBorder,
									avatarBg,
								)}
							>
								<Image
									src={avatarImage}
									alt="Yassine Chettouch"
									className="object-cover"
									placeholder="blur"
									fill
									sizes="56px"
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
								<h1 className={cn("font-semibold text-body-lg", textPrimary)}>
									Yassine Chettouch
								</h1>
								<p className={cn("text-body-sm", textSecondary)}>
									Product Engineer
								</p>
							</div>
						</div>

						<div className="flex items-center gap-0.5">
							<Link
								href="https://linkedin.com/in/yaschet"
								target="_blank"
								aria-label="LinkedIn"
								className={cn(
									"inline-flex size-10 items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface-400 focus-visible:ring-offset-2",
									iconColor,
								)}
							>
								<LinkedinLogoIcon className="size-5" weight="regular" />
							</Link>
							<Link
								href="https://github.com/yaschet"
								target="_blank"
								aria-label="GitHub"
								className={cn(
									"inline-flex size-10 items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface-400 focus-visible:ring-offset-2",
									iconColor,
								)}
							>
								<GithubLogoIcon className="size-5" weight="regular" />
							</Link>
							<Link
								href="https://x.com/yaschet"
								target="_blank"
								aria-label="X"
								className={cn(
									"inline-flex size-10 items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface-400 focus-visible:ring-offset-2",
									iconColor,
								)}
							>
								<XLogoIcon className="size-5" weight="regular" />
							</Link>
						</div>
					</div>
				</div>
			</Reveal>
		</SwissGridSection>
	);
}
