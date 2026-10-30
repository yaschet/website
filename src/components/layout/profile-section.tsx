import { GithubLogoIcon } from "@phosphor-icons/react/dist/ssr/GithubLogo";
import { LinkedinLogoIcon } from "@phosphor-icons/react/dist/ssr/LinkedinLogo";
import { XLogoIcon } from "@phosphor-icons/react/dist/ssr/XLogo";
import Image from "next/image";
import avatarImage from "@/public/images/avatar.png";
import { ButtonLink } from "@/src/components/ui/button-link";
import { SITE_ROLE } from "@/src/constants/site";

export function ProfileSection() {
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
			<div className="w-full">
				<div className="portfolio-box-pad grid grid-cols-[minmax(0,1fr)_auto] items-center gap-[var(--portfolio-space-1)] sm:gap-[var(--portfolio-space-2)]">
					<div className="flex min-w-0 items-center gap-[var(--portfolio-space-1)] sm:gap-[var(--portfolio-space-2)]">
						<div className="relative h-[var(--portfolio-avatar-size)] w-[var(--portfolio-avatar-size)] shrink-0 overflow-hidden rounded-(--radius) border border-border bg-muted sm:h-[var(--portfolio-masthead-avatar-size)] sm:w-[var(--portfolio-masthead-avatar-size)]">
							<Image
								src={avatarImage}
								alt="Yassine Chettouch"
								className="object-cover"
								placeholder="blur"
								fill
								sizes="(max-width: 640px) 60px, 70px"
							/>
						</div>
						<div className="flex min-w-0 flex-col justify-center gap-[calc(var(--portfolio-space-tight)/2)]">
							<p className="portfolio-masthead-name text-balance text-surface-900 dark:text-surface-100">
								Yassine Chettouch
							</p>
							<p className="portfolio-masthead-role text-surface-600 dark:text-surface-400">
								{SITE_ROLE}
							</p>
						</div>
					</div>

					<div className="hidden items-center gap-[var(--portfolio-space-1)] justify-self-end sm:flex">
						{socialLinks.map(({ label, href, Icon }) => (
							<ButtonLink
								key={label}
								href={href}
								target="_blank"
								rel="noreferrer"
								aria-label={label}
								title={label}
								variant="outline"
								size="icon-xl"
							>
								<Icon
									weight="regular"
									className="h-[var(--portfolio-icon-sm)] w-[var(--portfolio-icon-sm)]"
								/>
							</ButtonLink>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
