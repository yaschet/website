/**
 * CodeBlockWrapper component.
 *
 * @remarks
 * Wrapper for code blocks with copy functionality.
 *
 * @example
 * ```tsx
 * <CodeBlockWrapper>
 *   <code>const x = 1;</code>
 * </CodeBlockWrapper>
 * ```
 *
 * @public
 */

"use client";

import { type ReactNode, useRef } from "react";
import { CopyButton } from "@/src/components/ui/copy-button";
import { cn } from "@/src/lib/index";

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
					"code-block-pre overflow-x-auto border border-border p-4",
					"bg-background text-foreground",
					"font-mono text-sm leading-relaxed",
					className,
				)}
				{...props}
			>
				{children}
			</pre>
			{/* Copy Button - reads text from pre ref */}
			<CopyButton
				text={typeof children === "string" ? children : ""}
				className="absolute top-2 right-2"
			/>
		</div>
	);
}
