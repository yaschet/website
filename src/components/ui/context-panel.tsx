"use client";

import { Popover } from "@base-ui/react/popover";
import { RiArrowRightLine, RiCloseLine } from "@remixicon/react";
import { usePathname } from "next/navigation";
import {
	createContext,
	type Dispatch,
	type ReactNode,
	type SetStateAction,
	useContext,
	useEffect,
	useId,
	useRef,
	useState,
} from "react";
import { Button } from "@/src/components/ui/button";
import { ButtonLink } from "@/src/components/ui/button-link";

const PanelGroup = createContext<{
	active: string | null;
	setActive: Dispatch<SetStateAction<string | null>>;
} | null>(null);

/** A rail owns its disclosures; independent Storybook examples stay independent. */
export function ContextPanelGroup({ children }: { children: ReactNode }) {
	const [active, setActive] = useState<string | null>(null);
	const pathname = usePathname();
	const previousPath = useRef(pathname);
	useEffect(() => {
		if (previousPath.current === pathname) return;
		previousPath.current = pathname;
		setActive(null);
	}, [pathname]);
	return <PanelGroup.Provider value={{ active, setActive }}>{children}</PanelGroup.Provider>;
}

export type ContextPanelRow = { label: string; value: ReactNode; detail?: string };

/** Hover previews remain reachable; activation pins the same non-modal dialog. */
export function ContextPanel({
	children,
	className,
	label,
	title,
	align = "start",
	rows,
	action,
}: {
	children: ReactNode;
	className: string;
	label: string;
	title: string;
	align?: "start" | "end";
	rows: ContextPanelRow[];
	action: string;
}) {
	const id = useId();
	const group = useContext(PanelGroup);
	const [localOpen, setLocalOpen] = useState(false);
	const open = group ? group.active === id : localOpen;
	const [keyboard, setKeyboard] = useState(false);
	const mode = useRef<"hover" | "focus" | "pinned">("hover");
	const suppressFocus = useRef(false);
	const popup = useRef<HTMLDivElement>(null);
	const setOpen = (next: boolean) => {
		if (group) group.setActive((current) => (next ? id : current === id ? null : current));
		else setLocalOpen(next);
	};

	useEffect(() => {
		if (!open) return;
		const close = () => {
			suppressFocus.current = true;
			if (group) group.setActive((current) => (current === id ? null : current));
			else setLocalOpen(false);
		};
		const onScroll = (event: Event) => {
			if (event.target instanceof Node && popup.current?.contains(event.target)) return;
			close();
		};
		const onVisibility = () => {
			if (document.hidden) close();
		};
		window.addEventListener("scroll", onScroll, true);
		// Dismiss on wheel intent even when the document is at a scroll boundary.
		window.addEventListener("wheel", onScroll, { capture: true, passive: true });
		window.addEventListener("resize", close);
		document.addEventListener("visibilitychange", onVisibility);
		return () => {
			window.removeEventListener("scroll", onScroll, true);
			window.removeEventListener("wheel", onScroll, true);
			window.removeEventListener("resize", close);
			document.removeEventListener("visibilitychange", onVisibility);
		};
	}, [open, group, id]);

	return (
		<Popover.Root
			open={open}
			triggerId={id}
			onOpenChange={(next, details) => {
				const fromKeyboard =
					details.reason === "focus-out" ||
					details.event.type.startsWith("key") ||
					(details.event.type === "click" &&
						"detail" in details.event &&
						details.event.detail === 0);
				setKeyboard(fromKeyboard);
				if (details.reason === "trigger-press") {
					if (open && mode.current !== "pinned") {
						mode.current = "pinned";
						details.cancel();
						return;
					}
					mode.current = "pinned";
				} else if (details.reason === "trigger-hover") {
					if (open && mode.current !== "hover") {
						details.cancel();
						return;
					}
					mode.current = "hover";
				}
				if (!next) suppressFocus.current = true;
				setOpen(next);
			}}
		>
			<Popover.Trigger
				id={id}
				className={className}
				aria-label={label}
				openOnHover
				delay={350}
				closeDelay={120}
				onPointerDown={() => {
					suppressFocus.current = false;
					setKeyboard(false);
				}}
				onBlur={() => {
					suppressFocus.current = false;
				}}
				onFocus={(event) => {
					if (suppressFocus.current || !event.currentTarget.matches(":focus-visible"))
						return;
					mode.current = "focus";
					setKeyboard(true);
					setOpen(true);
				}}
				data-motion-input={keyboard ? "keyboard" : "pointer"}
			>
				{children}
			</Popover.Trigger>
			<Popover.Portal>
				<Popover.Positioner
					side="bottom"
					align={align}
					sideOffset={8}
					collisionPadding={16}
					className="portfolio-context-positioner"
				>
					<Popover.Popup
						ref={popup}
						className="portfolio-context-panel"
						data-motion-input={keyboard ? "keyboard" : "pointer"}
						initialFocus={(input) => input === "touch"}
					>
						<div className="portfolio-context-panel-heading">
							<Popover.Title>{title}</Popover.Title>
							<Popover.Close
								render={
									<Button
										variant="plain"
										size="icon-lg"
										className="portfolio-context-panel-close"
										data-press-motion="surface"
										aria-label="Close details"
									/>
								}
							>
								<RiCloseLine aria-hidden="true" />
							</Popover.Close>
						</div>
						<dl className="portfolio-context-facts">
							{rows.map(({ label: rowLabel, value, detail }) => (
								<div className="portfolio-context-fact" key={rowLabel}>
									<dt>{rowLabel}</dt>
									<dd>
										{value}
										{detail && (
											<span className="portfolio-context-detail">
												{detail}
											</span>
										)}
									</dd>
								</div>
							))}
						</dl>
						<div className="portfolio-context-panel-footer">
							<ButtonLink
								href="/contact"
								variant="plain"
								className="portfolio-context-panel-action"
								icon={<RiArrowRightLine />}
								data-press-motion="surface"
								onClick={() => setOpen(false)}
							>
								{action}
							</ButtonLink>
						</div>
					</Popover.Popup>
				</Popover.Positioner>
			</Popover.Portal>
		</Popover.Root>
	);
}
