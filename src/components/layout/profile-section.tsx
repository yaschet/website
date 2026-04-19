import { GithubLogoIcon, LinkedinLogoIcon, XLogoIcon } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";
import avatarImage from "@/public/images/avatar.png";

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
						<div className="group/avatar relative h-[var(--portfolio-avatar-size)] w-[var(--portfolio-avatar-size)] overflow-hidden rounded-(--radius) border border-surface-200 bg-surface-100 shadow-[inset_0_0_0_1px_rgba(15,23,42,0.03)] sm:h-[var(--portfolio-masthead-avatar-size)] sm:w-[var(--portfolio-masthead-avatar-size)] dark:border-surface-800 dark:bg-surface-900 dark:shadow-[inset_0_0_0_1px_rgba(248,250,252,0.03)]">
							<Image
								src={avatarImage}
								alt="Yassine Chettouch"
								className="object-cover transition-transform duration-300 group-hover/avatar:scale-[1.05]"
								placeholder="blur"
								fill
								sizes="(max-width: 640px) 60px, 70px"
							/>
						</div>
						<div className="flex min-w-0 flex-col justify-center gap-[calc(var(--portfolio-space-tight)/2)]">
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
							<Link
								key={label}
								href={href}
								target="_blank"
								rel="noreferrer"
								aria-label={label}
								title={label}
								className="inline-flex h-[var(--portfolio-control-sm)] w-[var(--portfolio-control-sm)] items-center justify-center bg-surface-100/50 text-surface-500 transition-colors hover:bg-surface-200/50 hover:text-surface-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface-400 focus-visible:ring-offset-2 sm:h-[var(--portfolio-icon-touch)] sm:w-[var(--portfolio-icon-touch)] dark:bg-surface-800/50 dark:text-surface-400 dark:hover:bg-surface-700/50 dark:hover:text-surface-100"
							>
								<Icon
									weight="regular"
									className="h-[var(--portfolio-icon-sm)] w-[var(--portfolio-icon-sm)]"
								/>
							</Link>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
