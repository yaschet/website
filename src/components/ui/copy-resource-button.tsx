"use client";

import {
	RiCheckLine as Check,
	RiFileCopyLine as Copy,
	RiErrorWarningLine as WarningCircle,
} from "@remixicon/react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/src/components/ui/button";
import { StateSwap } from "@/src/components/ui/state-swap";
import { writeClipboardText } from "@/src/lib/clipboard";
import { cn } from "@/src/lib/index";

interface CopyResourceButtonProps {
	href: string;
	label: string;
	copiedLabel?: string;
	className?: string;
	variant?: "button" | "inline";
}

type CopyState = "idle" | "loading" | "copied" | "error";

/** Copies a text resource on intent, with cancellable fetching and continuous state feedback. */
export function CopyResourceButton({
	href,
	label,
	copiedLabel = "Copied",
	className,
	variant = "button",
}: CopyResourceButtonProps) {
	const [state, setState] = useState<CopyState>("idle");
	const request = useRef<AbortController | null>(null);
	const reset = useRef<ReturnType<typeof setTimeout> | null>(null);

	// biome-ignore lint/correctness/useExhaustiveDependencies: Resource identity changes must cancel pending work and reset feedback.
	useEffect(() => {
		setState("idle");
		return () => {
			request.current?.abort();
			request.current = null;
			if (reset.current) clearTimeout(reset.current);
		};
	}, [href]);

	const handleCopy = async () => {
		if (request.current) return;
		if (reset.current) clearTimeout(reset.current);
		const controller = new AbortController();
		request.current = controller;
		setState("loading");
		try {
			const response = await fetch(href, {
				headers: { Accept: "text/markdown,text/plain;q=0.9,*/*;q=0.1" },
				signal: controller.signal,
			});
			if (!response.ok) throw new Error("Resource unavailable");
			const text = await response.text();
			if (controller.signal.aborted) return;
			await writeClipboardText(text);
			if (!controller.signal.aborted) setState("copied");
		} catch {
			if (!controller.signal.aborted) setState("error");
		} finally {
			if (!controller.signal.aborted) {
				request.current = null;
				reset.current = setTimeout(() => setState("idle"), 2500);
			}
		}
	};

	const visibleLabel =
		state === "loading"
			? "Copying"
			: state === "copied"
				? copiedLabel
				: state === "error"
					? "Retry copying"
					: label;
	return (
		<>
			<Button
				type="button"
				variant={variant === "inline" ? "plain" : "outlined"}
				color="default"
				onClick={handleCopy}
				loading={state === "loading"}
				aria-label={visibleLabel}
				className={cn(className)}
				icon={
					<StateSwap
						value={state === "loading" ? "idle" : state}
						items={{
							idle: <Copy size={16} />,
							copied: <Check size={16} />,
							error: <WarningCircle size={16} />,
						}}
					/>
				}
			>
				<StateSwap
					kind="text"
					sizing="content"
					value={state}
					items={{
						idle: label,
						loading: "Copying",
						copied: copiedLabel,
						error: "Retry copying",
					}}
				/>
			</Button>
			<span role="status" className="sr-only">
				{state === "copied"
					? "Copied to clipboard."
					: state === "error"
						? "Could not copy. Please try again."
						: ""}
			</span>
		</>
	);
}
