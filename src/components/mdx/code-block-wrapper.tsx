"use client";

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
	return (
		<div
			data-breakout="true"
			className={cn(
				"media-breakout mb-(--portfolio-space-group) overflow-hidden border border-border bg-[var(--portfolio-code-surface)]",
				className,
			)}
		>
			<div className="flex items-center justify-between gap-4 border-border border-b p-3">
				<span className="font-medium text-[13px]/5 text-muted-foreground">Code</span>
				<CopyButton text={rawCode} />
			</div>
			<pre
				className={cn(
					"code-block-pre m-0 overflow-x-auto p-4",
					"font-mono text-[13px]/5",
					"bg-[var(--portfolio-code-surface)]",
				)}
				{...props}
			>
				<code
					className="sh__content"
					// biome-ignore lint/security/noDangerouslySetInnerHtml: Output from sugar-high is trusted
					dangerouslySetInnerHTML={{ __html: highlightedHtml }}
				/>
			</pre>
		</div>
	);
}
