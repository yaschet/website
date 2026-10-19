"use client";

import { Check, Copy, WarningCircle } from "@phosphor-icons/react";
import { useCallback, useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Spinner } from "@/src/components/ui/spinner";
import { cn } from "@/src/lib/index";

interface CopyResourceButtonProps {
	href: string;
	label: string;
	copiedLabel?: string;
	className?: string;
	variant?: "button" | "badge";
}

type CopyState = "idle" | "loading" | "copied" | "error";

async function writeTextToClipboard(text: string) {
	try {
		await navigator.clipboard.writeText(text);
		return;
	} catch (_error) {
		const textarea = document.createElement("textarea");
		textarea.value = text;
		textarea.setAttribute("readonly", "");
		textarea.style.position = "fixed";
		textarea.style.top = "0";
		textarea.style.left = "-9999px";
		document.body.appendChild(textarea);
		textarea.select();

		try {
			const copied = document.execCommand("copy");
			if (!copied) {
				throw new Error("Clipboard fallback failed.");
			}
		} finally {
			document.body.removeChild(textarea);
		}
	}
}

/**
 * Copies a fetched text resource to the clipboard without shipping the resource in client JS.
 *
 * @param props - Resource URL and button labels.
 * @returns A button with loading, copied, and error states.
 */
export function CopyResourceButton({
	href,
	label,
	copiedLabel = "Copied",
	className,
	variant = "button",
}: CopyResourceButtonProps) {
	const [state, setState] = useState<CopyState>("idle");

	const handleCopy = useCallback(async () => {
		if (state === "loading") return;

		setState("loading");

		try {
			const response = await fetch(href, {
				headers: {
					Accept: "text/markdown,text/plain;q=0.9,*/*;q=0.1",
				},
			});

			if (!response.ok) {
				throw new Error(`Failed to fetch ${href}`);
			}

			const markdown = await response.text();
			await writeTextToClipboard(markdown);
			setState("copied");
			window.setTimeout(() => setState("idle"), 2000);
		} catch (_error) {
			setState("error");
			window.setTimeout(() => setState("idle"), 2500);
		}
	}, [href, state]);

	const isLoading = state === "loading";
	const isCopied = state === "copied";
	const isError = state === "error";
	const visibleLabel = isLoading ? "Copying" : isCopied ? copiedLabel : isError ? "Retry" : label;
	const isBadge = variant === "badge";

	return (
		<Button
			type="button"
			size={isBadge ? "xs" : "sm"}
			variant="outlined"
			color="default"
			onClick={handleCopy}
			disabled={isLoading}
			aria-live="polite"
			className={cn(
				isBadge
					? "h-[var(--portfolio-badge-height)] border-surface-200/80 bg-white/95 px-[var(--portfolio-badge-inset)] shadow-lg shadow-surface-900/5 dark:border-surface-800/80 dark:bg-surface-950/95 dark:shadow-surface-950/50"
					: "min-w-[8.5rem]",
				className,
			)}
		>
			{isLoading ? (
				<Spinner size="xs" color="default" />
			) : isCopied ? (
				<Check size={14} weight="bold" />
			) : isError ? (
				<WarningCircle size={14} weight="bold" />
			) : (
				<Copy size={14} weight="bold" />
			)}
			<span className={cn(isBadge && "inline-block min-w-[13ch] text-left")}>
				{visibleLabel}
			</span>
		</Button>
	);
}
