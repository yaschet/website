"use client";

import { Badge } from "@components/ui/badge";
import { Command, CommandGroup, CommandItem } from "@components/ui/command";
import { cn } from "@library/utils";
import { XIcon } from "@phosphor-icons/react";
import { Command as CommandPrimitive } from "cmdk";
import * as React from "react";

type Framework = Record<"value" | "label", string>;

export function MultiSelect({
	className,
	defaultValue,
	onValueChange,
	options,
	value,
}: {
	className?: string;
	onValueChange?: (value: Framework[]) => void;
	defaultValue?: Framework[];
	value?: Framework[];
	options?: Framework[];
}) {
	const inputRef = React.useRef<HTMLInputElement>(null);
	const [isOpen, setOpen] = React.useState(false);
	const [selected, setSelected] = React.useState<Framework[]>(defaultValue ?? value ?? []);
	const [inputValue, setInputValue] = React.useState("");

	React.useEffect(() => {
		if (onValueChange) {
			onValueChange(selected);
		}
	}, [onValueChange, selected]);

	const handleUnselect = React.useCallback((framework: Framework) => {
		setSelected((prev) => prev.filter((s) => s.value !== framework.value));
	}, []);

	const handleKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
		const input = inputRef.current;
		if (input) {
			if (e.key === "Delete" || e.key === "Backspace") {
				if (input.value === "") {
					setSelected((prev) => {
						const newSelected = [...prev];
						newSelected.pop();
						return newSelected;
					});
				}
			}

			// This is not a default behaviour of the <input /> field
			if (e.key === "Escape") {
				input.blur();
			}
		}
	}, []);

	const selectables = React.useMemo(() => {
		return options?.filter((option) => {
			return !selected.find((framework) => framework.value === option.value);
		});
	}, [options, selected]);

	return (
		<Command className="overflow-visible bg-transparent" onKeyDown={handleKeyDown}>
			<div
				className={cn(
					"group rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
					className,
				)}
			>
				<div className="flex flex-wrap gap-1">
					{selected.map((framework) => {
						return (
							<Badge key={framework.value} color="secondary" variant="soft">
								{framework.label}
								<button
									className={cn(
										"ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2",
									)}
									title="Remove"
									type="button"
									onClick={() => handleUnselect(framework)}
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											handleUnselect(framework);
										}
									}}
									onMouseDown={(e) => {
										e.preventDefault();
										e.stopPropagation();
									}}
								>
									<XIcon
										className={cn("h-3 w-3 text-muted hover:text-foreground")}
									/>
								</button>
							</Badge>
						);
					})}
					{/* Avoid having the "Search" Icon */}
					<CommandPrimitive.Input
						ref={inputRef}
						className={cn(
							"ml-2 flex-1 bg-transparent outline-none placeholder:text-muted",
						)}
						placeholder="Select frameworks..."
						value={inputValue}
						onBlur={() => setOpen(false)}
						onFocus={() => setOpen(true)}
						onValueChange={setInputValue}
					/>
				</div>
			</div>
			<div className="relative mt-2">
				{isOpen && selectables?.length > 0 ? (
					<div
						className={cn(
							"absolute top-0 z-10 w-full animate-in rounded-md border bg-popover text-popover-foreground outline-none",
						)}
					>
						<CommandGroup className="h-full overflow-auto">
							{selectables?.map((framework) => {
								return (
									<CommandItem
										key={framework.value}
										className="cursor-pointer"
										onMouseDown={(e) => {
											e.preventDefault();
											e.stopPropagation();
										}}
										onSelect={(_value) => {
											setInputValue("");
											setSelected((prev) => [...prev, framework]);
										}}
									>
										{framework.label}
									</CommandItem>
								);
							})}
						</CommandGroup>
					</div>
				) : null}
			</div>
		</Command>
	);
}
