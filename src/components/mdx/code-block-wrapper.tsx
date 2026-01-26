"use client";

import { useRef } from "react";
import { CopyButton } from "@/src/components/ui/copy-button";
import { cn } from "@/src/lib/index";

interface CodeBlockWrapperProps {
	highlightedHtml: string;
	rawCode: string;
	className?: string;
}

export function CodeBlockWrapper({
	highlightedHtml,
	rawCode,
	className,
	...props
}: CodeBlockWrapperProps) {
	const preRef = useRef<HTMLPreElement>(null);

	return (
		<div className="group relative mb-8">
			<pre
				ref={preRef}
				className={cn(
					"code-block-pre overflow-x-auto border border-border p-4",
					"font-mono text-sm leading-relaxed",
					"bg-surface-50 dark:bg-surface-950",
					className,
				)}
				{...props}
			>
				<code
					className="sh__content"
					// biome-ignore lint/security/noDangerouslySetInnerHtml: Output from sugar-high is trusted
					dangerouslySetInnerHTML={{ __html: highlightedHtml }}
				/>
			</pre>
			<CopyButton text={rawCode} className="absolute top-2 right-2" />
		</div>
	);
}
