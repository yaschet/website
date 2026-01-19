/**
 * Smoothly animated collapsible information panel.
 *
 * @remarks
 * Built on Headless UI's Disclosure and Framer Motion for transitions.
 * Features an architecturally precise layout with integrated Phosphor icons
 * for state indication. Used for optional details and auxiliary content.
 *
 * @example
 * ```tsx
 * <AnimatedDisclosure title="Structural Details">
 *   <p>Procedural documentation for the monolith architecture.</p>
 * </AnimatedDisclosure>
 * ```
 *
 * @public
 */

"use client";

import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
import { ArrowsInIcon, ArrowsOutIcon } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { Fragment } from "react";

type DisclosurePanelProps = {
	title: ReactNode;
	extraTitleContent?: ReactNode;
	children: ReactNode;
};

function AnimatedDisclosure({ children, extraTitleContent, title }: DisclosurePanelProps) {
	return (
		<Disclosure
			as="div"
			className="block w-full items-stretch overflow-hidden rounded-xl border border-border bg-surface-2 p-4 dark:bg-surface-2"
		>
			{({ open: isDisclosureOpen }) => (
				<Fragment>
					<div className="my-auto flex w-full flex-col items-start justify-start">
						<DisclosureButton className="flex w-full flex-row items-center justify-between">
							<div
								aria-hidden="true"
								className="flex flex-row items-center justify-start gap-2 text-start text-foreground text-sm"
							>
								{title}
							</div>
							<span className="flex cursor-pointer flex-row items-center justify-start gap-2 text-foreground">
								{extraTitleContent}
								{isDisclosureOpen ? (
									<ArrowsInIcon
										className="size-4"
										color="currentColor"
										weight="duotone"
									/>
								) : (
									<ArrowsOutIcon
										className="size-4"
										color="currentColor"
										weight="duotone"
									/>
								)}
							</span>
						</DisclosureButton>
					</div>
					<AnimatePresence>
						{isDisclosureOpen && (
							<DisclosurePanel static as="div" className="origin-top">
								<motion.div
									animate={{ height: "auto", opacity: 1, y: 0 }}
									exit={{ height: 0, opacity: 0, y: -0 }}
									initial={{ height: 0, opacity: 0, y: -0 }}
									transition={{ duration: 0.2, ease: "easeOut" }}
								>
									<div className="flex w-full flex-col items-start justify-start gap-2 pt-5">
										<div className="flex w-full flex-col items-start justify-start gap-2">
											{children}
										</div>
									</div>
								</motion.div>
							</DisclosurePanel>
						)}
					</AnimatePresence>
				</Fragment>
			)}
		</Disclosure>
	);
}

export default AnimatedDisclosure;
