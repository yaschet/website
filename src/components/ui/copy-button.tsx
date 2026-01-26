"use client";

import { Check, Copy } from "@phosphor-icons/react";
import { useCallback, useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Spinner } from "@/src/components/ui/spinner";
import { cn } from "@/src/lib/index";

interface CopyButtonProps {
	text: string;
	className?: string;
}

export function CopyButton({ text, className }: CopyButtonProps) {
	const [copied, setCopied] = useState(false);
	const [loading, setLoading] = useState(false);

	const handleCopy = useCallback(async () => {
		if (loading || copied) return;

		setLoading(true);

		// Artificial delay to provide "Interaction Engineered" feedback
		// Making the action feel weighted and confirmed.
		await new Promise((resolve) => setTimeout(resolve, 300));

		try {
			await navigator.clipboard.writeText(text);
			setCopied(true);
			setTimeout(() => {
				setCopied(false);
			}, 2000);
		} catch (_error) {
			// Silent fail on clipboard errors for production
		} finally {
			setLoading(false);
		}
	}, [text, loading, copied]);

	return (
		<Button
			variant="plain"
			size="icon-sm"
			color="default"
			onClick={handleCopy}
			disabled={loading}
			className={cn(
				"absolute top-2 right-2 z-10",
				"opacity-0 transition-opacity duration-200 group-hover:opacity-100",
				"bg-surface-50/80 backdrop-blur dark:bg-surface-800/80",
				loading && "opacity-100",
				className,
			)}
			aria-label={loading ? "Copying..." : copied ? "Copied!" : "Copy code"}
		>
			{loading ? (
				<Spinner size="xs" color="default" className="opacity-70" />
			) : copied ? (
				<Check size={14} weight="bold" className="text-success-500" />
			) : (
				<Copy size={14} weight="bold" className="text-muted-foreground" />
			)}
		</Button>
	);
}
