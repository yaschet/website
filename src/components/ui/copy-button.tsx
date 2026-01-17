"use client";

/**
 * CopyButton - Client-side copy-to-clipboard button
 *
 * Separate client component to avoid SSR issues in MDX components.
 */

import { useState, useCallback } from "react";
import { Check, Copy } from "@phosphor-icons/react";
import { cn } from "@/src/lib/utils";

interface CopyButtonProps {
	text: string;
	className?: string;
}

export function CopyButton({ text, className }: CopyButtonProps) {
	const [copied, setCopied] = useState(false);

	const handleCopy = useCallback(async () => {
		await navigator.clipboard.writeText(text);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}, [text]);

	return (
		<button
			type="button"
			onClick={handleCopy}
			className={cn(
				"flex size-8 items-center justify-center",
				"border border-surface-200 bg-surface-50 dark:border-surface-700 dark:bg-surface-800",
				"opacity-0 transition-all duration-200 group-hover:opacity-100",
				"hover:border-surface-300 hover:bg-surface-100 dark:hover:border-surface-600 dark:hover:bg-surface-700",
				"focus:outline-none focus:ring-2 focus:ring-surface-400",
				className,
			)}
			aria-label={copied ? "Copied!" : "Copy code"}
		>
			{copied ? (
				<Check size={14} weight="bold" className="text-success-500" />
			) : (
				<Copy size={14} weight="bold" className="text-surface-500 dark:text-surface-400" />
			)}
		</button>
	);
}
