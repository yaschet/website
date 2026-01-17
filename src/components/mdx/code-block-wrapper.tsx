"use client";

/**
 * CodeBlockWrapper - Client component for code blocks with copy functionality
 *
 * Wraps the pre element with a copy button. Separated from mdx-components
 * to allow client-side hooks while keeping mdx-components as a server component.
 */

import { type ReactNode, useRef } from "react";
import { cn } from "@/src/lib/utils";
import { CopyButton } from "@/src/components/ui/copy-button";

interface CodeBlockWrapperProps {
	children: ReactNode;
	className?: string;
}

export function CodeBlockWrapper({ children, className, ...props }: CodeBlockWrapperProps) {
	const preRef = useRef<HTMLPreElement>(null);

	return (
		<div className="group relative mb-8">
			<pre
				ref={preRef}
				className={cn(
					"overflow-x-auto border border-border p-4",
					"bg-background text-foreground",
					"font-mono text-sm leading-relaxed",
					"[&>code]:border-none [&>code]:bg-transparent [&>code]:p-0 [&>code]:text-inherit",
					className,
				)}
				{...props}
			>
				{children}
			</pre>
			{/* Copy Button - reads text from pre ref */}
			<CopyButton
				text={typeof children === "string" ? children : ""}
				className="absolute right-2 top-2"
			/>
		</div>
	);
}
