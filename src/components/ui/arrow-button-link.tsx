import { ArrowDownIcon } from "@phosphor-icons/react/dist/ssr/ArrowDown";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr/ArrowLeft";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowUpRight";
import type { ComponentProps, CSSProperties } from "react";
import { cn } from "@/src/lib/index";
import { ButtonLink } from "./button-link";
import { type ReelDirection, ReelIcon } from "./reel";

type CharacterStyle = CSSProperties & { "--action-character-progress": number };

type ArrowButtonLinkProps = Omit<
	ComponentProps<typeof ButtonLink>,
	"children" | "icon" | "iconPosition" | "size"
> & {
	children: string;
	/** Matches the glyph and its travel to the navigation direction. */
	arrowDirection?: ReelDirection;
	/** Softens the moving arrow without blurring its resting state. */
	arrowBlur?: boolean;
};

/** Native navigation with a bounded character stagger and a centered directional reel. */
export function ArrowButtonLink({
	children,
	className,
	arrowDirection = "right",
	arrowBlur = true,
	...props
}: ArrowButtonLinkProps) {
	const characters = Array.from(children);
	const Arrow =
		arrowDirection === "up-right"
			? ArrowUpRightIcon
			: arrowDirection === "left"
				? ArrowLeftIcon
				: arrowDirection === "down"
					? ArrowDownIcon
					: ArrowRightIcon;

	return (
		<ButtonLink
			{...props}
			data-reel-trigger=""
			className={cn("portfolio-action-link", className)}
			icon={
				<ReelIcon
					direction={arrowDirection}
					blur={arrowBlur}
					className="portfolio-action-reel-icon"
				>
					<Arrow className="size-4" weight="bold" />
				</ReelIcon>
			}
		>
			<span className="portfolio-action-reel-label">
				<span className="sr-only">{children}</span>
				<span data-action-rest="" aria-hidden="true">
					{children}
				</span>
				{(["out", "in"] as const).map((layer) => (
					<span key={layer} data-action-reel={layer} aria-hidden="true">
						{characters.map((character, index) => {
							const style: CharacterStyle = {
								"--action-character-progress":
									index / Math.max(1, characters.length - 1),
							};
							return (
								<span
									// biome-ignore lint/suspicious/noArrayIndexKey: Character position preserves spaces and repeated letters across the two visual layers.
									key={index}
									data-action-character=""
									style={style}
								>
									{character}
								</span>
							);
						})}
					</span>
				))}
			</span>
		</ButtonLink>
	);
}
