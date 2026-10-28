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

interface CopyButtonProps {
	text: string;
	className?: string;
}

/** A visible, fixed-size code utility; pending feedback follows the real clipboard operation. */
export function CopyButton({ text, className }: CopyButtonProps) {
	const [state, setState] = useState<"idle" | "loading" | "copied" | "error">("idle");
	const pending = useRef(false);
	const mounted = useRef(true);
	const reset = useRef<ReturnType<typeof setTimeout> | null>(null);
	useEffect(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
			if (reset.current) clearTimeout(reset.current);
		};
	}, []);
	const handleCopy = async () => {
		if (pending.current) return;
		pending.current = true;
		if (reset.current) clearTimeout(reset.current);
		setState("loading");
		try {
			await writeClipboardText(text);
			if (mounted.current) setState("copied");
		} catch {
			if (mounted.current) setState("error");
		} finally {
			pending.current = false;
			if (mounted.current) reset.current = setTimeout(() => setState("idle"), 2500);
		}
	};
	return (
		<>
			<Button
				variant="soft"
				size="icon"
				color="secondary"
				onClick={handleCopy}
				loading={state === "loading"}
				className={className}
				aria-label={
					state === "loading"
						? "Copying code"
						: state === "copied"
							? "Code copied"
							: state === "error"
								? "Retry copying code"
								: "Copy code"
				}
			>
				<StateSwap
					value={state === "loading" ? "idle" : state}
					items={{
						idle: <Copy size={16} />,
						copied: <Check size={16} />,
						error: <WarningCircle size={16} />,
					}}
				/>
			</Button>
			<span role="status" className="sr-only">
				{state === "copied"
					? "Code copied to clipboard."
					: state === "error"
						? "Could not copy code. Please try again."
						: ""}
			</span>
		</>
	);
}
