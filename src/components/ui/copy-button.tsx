"use client";

import { Check, Copy } from "@phosphor-icons/react";
import { useCallback, useState } from "react";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/index";

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
		<Button
			variant="plain"
			size="icon-sm"
			color="default"
			onClick={handleCopy}
			className={cn(
				"absolute top-2 right-2 z-10",
				"opacity-0 transition-opacity duration-200 group-hover:opacity-100",
				"bg-surface-50/80 backdrop-blur dark:bg-surface-800/80",
				className,
			)}
			aria-label={copied ? "Copied!" : "Copy code"}
		>
			{copied ? (
				<Check size={14} weight="bold" className="text-success-500" />
			) : (
				<Copy size={14} weight="bold" className="text-muted-foreground" />
			)}
		</Button>
	);
}
