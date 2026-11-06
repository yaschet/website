"use client";

/**
 * Accordion component.
 *
 * @remarks
 * Built on Radix UI's Accordion primitive.
 *
 * @example
 * ```tsx
 * <Accordion type="single" collapsible>
 *   <AccordionItem value="1">
 *     <AccordionTrigger>Open</AccordionTrigger>
 *     <AccordionContent>Content</AccordionContent>
 *   </AccordionItem>
 * </Accordion>
 * ```
 *
 * @public
 */
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { MinusIcon, PlusIcon } from "@radix-ui/react-icons";
import { motion, useReducedMotion } from "motion/react";
import * as React from "react";
import { cn } from "@/src/lib/index";
import { distances, springs } from "@/src/lib/physics";

const AccordionValues = React.createContext<string[]>([]);
const AccordionOpen = React.createContext(false);

function Accordion(props: React.ComponentProps<typeof AccordionPrimitive.Root>) {
	const [single, setSingle] = React.useState(
		props.type === "single" ? (props.defaultValue ?? "") : "",
	);
	const [multiple, setMultiple] = React.useState<string[]>(
		props.type === "multiple" ? (props.defaultValue ?? []) : [],
	);
	if (props.type === "multiple") {
		const value = props.value ?? multiple;
		return (
			<AccordionValues.Provider value={value}>
				<AccordionPrimitive.Root
					{...props}
					value={value}
					onValueChange={(next: string[]) => {
						setMultiple(next);
						props.onValueChange?.(next);
					}}
				/>
			</AccordionValues.Provider>
		);
	}
	const value = props.value ?? single;
	return (
		<AccordionValues.Provider value={[value]}>
			<AccordionPrimitive.Root
				{...props}
				value={value}
				onValueChange={(next: string) => {
					setSingle(next);
					props.onValueChange?.(next);
				}}
			/>
		</AccordionValues.Provider>
	);
}

const AccordionItem = React.forwardRef<
	React.ComponentRef<typeof AccordionPrimitive.Item>,
	React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item> & { className?: string }
>(({ className, ...props }, ref) => {
	const values = React.useContext(AccordionValues);
	return (
		<AccordionOpen.Provider value={values.includes(props.value)}>
			<AccordionPrimitive.Item ref={ref} className={cn("border-b", className)} {...props} />
		</AccordionOpen.Provider>
	);
});
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef<
	React.ComponentRef<typeof AccordionPrimitive.Trigger>,
	React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> & { className?: string }
>(({ children, className, ...props }, ref) => (
	<AccordionPrimitive.Header className="flex">
		<AccordionPrimitive.Trigger
			ref={ref}
			data-slot="accordion-trigger"
			className={cn(
				"flex flex-1 items-center justify-between py-4 font-medium text-sm hover:underline",
				className,
			)}
			{...props}
		>
			{children}
			<span
				aria-hidden="true"
				className="t-icon-swap size-4 shrink-0"
				data-icon-swap="accordion"
			>
				<span className="t-icon" data-icon="a">
					<PlusIcon />
				</span>
				<span className="t-icon" data-icon="b">
					<MinusIcon />
				</span>
			</span>
		</AccordionPrimitive.Trigger>
	</AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef<
	React.ComponentRef<typeof AccordionPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content> & { className?: string }
>(({ children, className, ...props }, ref) => {
	const open = React.useContext(AccordionOpen);
	const reducedMotion = useReducedMotion();
	return (
		<AccordionPrimitive.Content {...props} ref={ref} forceMount asChild>
			<motion.div
				inert={!open}
				aria-hidden={!open}
				className="overflow-hidden text-sm"
				initial={false}
				animate={{ height: open ? "auto" : 0 }}
				transition={reducedMotion ? { duration: 0 } : springs.responsive}
			>
				<motion.div
					className={cn("pt-0 pb-4", className)}
					initial={false}
					animate={{
						opacity: open ? 1 : 0,
						y: open || reducedMotion ? 0 : -distances.micro,
					}}
					transition={reducedMotion ? { duration: 0 } : springs.responsive}
				>
					{children}
				</motion.div>
			</motion.div>
		</AccordionPrimitive.Content>
	);
});
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
