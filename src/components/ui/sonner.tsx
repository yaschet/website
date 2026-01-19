/**
 * Toast notification component.
 *
 * @remarks
 * Wraps the 'sonner' library.
 *
 * @example
 * ```tsx
 * <Toaster />
 * toast.success("Success");
 * ```
 *
 * @public
 */

"use client";

import {
	CheckIcon,
	ExclamationMarkIcon,
	InfoIcon,
	WarningDiamondIcon,
} from "@phosphor-icons/react";
import { useTheme } from "next-themes";
import type { ComponentProps } from "react";
import { Toaster as Sonner } from "sonner";
import Spinner from "@/src/components/ui/spinner";
import { cn } from "@/src/lib/index";

type ToasterProps = ComponentProps<typeof Sonner>;

// ═══════════════════════════════════════════════════════════════════════════
// SWISS ICON CONTAINER
// ═══════════════════════════════════════════════════════════════════════════
// Creates a distinct, architectural 32x32px cell for iconography.
// Aligns with the user's request for "Square", "Bold", and "Swiss Design".

const SwissIcon = ({ children, className }: { children: React.ReactNode; className?: string }) => {
	return (
		<div
			className={cn(
				"flex size-8 shrink-0 items-center justify-center border border-surface-200 bg-surface-50 transition-colors dark:border-surface-800 dark:bg-surface-900",
				// Optional: Semantic background hints if requested, but user asked for "same as background" or "white".
				// Keeping it Strict Swiss (Monochromatic structural) for now, relying on the Inner Icon for color.
				className,
			)}
		>
			{children}
		</div>
	);
};

function Toaster({ ...props }: ToasterProps) {
	const { theme = "system" } = useTheme();

	return (
		<Sonner
			className={cn("toaster group")}
			icons={{
				error: (
					<SwissIcon>
						<WarningDiamondIcon
							className="size-5 text-destructive"
							color="currentColor"
							weight="regular"
						/>
					</SwissIcon>
				),
				info: (
					<SwissIcon>
						<InfoIcon
							className="size-5 text-info"
							color="currentColor"
							weight="regular"
						/>
					</SwissIcon>
				),
				loading: (
					<SwissIcon>
						<Spinner
							className="size-5 shrink-0 text-surface-500" // shrink-0 is CRITICAL for flex/grid
							weight="regular"
							size="sm" // Base size closest to 20px (size-5) to minimize jumps
						/>
					</SwissIcon>
				),
				success: (
					<SwissIcon>
						<CheckIcon
							className="size-5 text-success"
							color="currentColor"
							weight="regular"
						/>
					</SwissIcon>
				),
				warning: (
					<SwissIcon>
						<ExclamationMarkIcon
							className="size-5 text-warning"
							color="currentColor"
							weight="regular"
						/>
					</SwissIcon>
				),
			}}
			theme={theme as ToasterProps["theme"]}
			position="bottom-right"
			toastOptions={{
				unstyled: true,
				classNames: {
					toast: cn(
						// GRID LAYOUT V2
						// - auto: Icon Column (SwissIcon is 32px)
						// - 1fr: Content Column (Title + Desc)
						// - auto: Action Column (Buttons)
						"group grid w-full grid-cols-[auto_1fr_auto] items-start gap-x-4 p-4",
						"bg-surface-0 dark:bg-surface-950",
						"border border-surface-200 dark:border-surface-800",
						"rounded-none shadow-none",

						// ELEMENT TARGETING
						// Force the inner icon wrapper to sit in Col 1
						"[&>[data-icon]]:col-start-1 [&>[data-icon]]:mt-0.5",

						// PROMISE FIX: Target the loading spinner specifically to force it into the icon slot
						// This ensures it behaves exactly like the other icons
						"[&>[data-loading-icon]]:col-start-1 [&>[data-loading-icon]]:mt-0.5 [&>[data-loading-icon]]:shrink-0",

						// Force the content wrapper (Title+Desc) to sit in Col 2 and Stack vertically
						"[&>[data-content]]:col-start-2 [&>[data-content]]:flex [&>[data-content]]:flex-col [&>[data-content]]:gap-1",
						// Align title with the architectural icon box
						"[&>[data-content]]:min-h-[2rem] [&>[data-content]]:justify-center", // min-h-8 matches icon size
						// Action buttons in Col 3
						"[&>[data-button]]:col-start-3 [&>[data-button]]:self-center",
						"[&>[data-cancel]]:col-start-3 [&>[data-cancel]]:self-center",
					),
					title: "text-surface-900 dark:text-surface-50 font-bold text-xs uppercase tracking-wider leading-none", // Tight leading for the header
					description:
						"text-surface-500 dark:text-surface-400 text-xs font-mono leading-normal",
					actionButton: cn(
						"shrink-0 rounded-none px-3 py-1.5 font-bold text-xs",
						"bg-surface-900 text-surface-50 dark:bg-surface-50 dark:text-surface-900",
						"transition-transform active:scale-95", // PHYSICS
					),
					cancelButton: cn(
						"shrink-0 rounded-none px-3 py-1.5 font-bold text-xs",
						"bg-surface-100 text-surface-900 dark:bg-surface-800 dark:text-surface-50",
						"transition-transform hover:bg-surface-200 active:scale-95 dark:hover:bg-surface-700", // PHYSICS
					),
					closeButton: cn(
						"absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 transform p-1 opacity-0 group-hover:opacity-100",
						"text-surface-400 hover:text-surface-900 dark:text-surface-500 dark:hover:text-surface-50",
						"border border-surface-200 bg-surface-0 dark:border-surface-800 dark:bg-surface-950",
						"rounded-none transition-all duration-200",
					),
					// Semantic borders
					success: "!border-l-success",
					error: "!border-l-destructive",
					warning: "!border-l-warning",
					info: "!border-l-info",
				},
				duration: 5000,
			}}
			{...props}
		/>
	);
}

export { Toaster };
