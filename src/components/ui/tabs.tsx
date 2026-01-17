/**
 * Tabs Component
 *
 * A set of layered sections of content—known as tab panels—that are displayed one at a time.
 */

"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import * as React from "react";
import { cn } from "@/src/lib/utils";

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

const Tabs = TabsPrimitive.Root;

// ═══════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

const TabsList = React.forwardRef<
	React.ComponentRef<typeof TabsPrimitive.List>,
	React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
		className?: string;
	}
>(({ className, ...props }, ref) => (
	<TabsPrimitive.List
		ref={ref}
		className={cn(
			"inline-flex h-10 items-center justify-center p-1",
			"bg-muted text-muted-foreground",
			"rounded-[var(--radius)]",
			className,
		)}
		{...props}
	/>
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
	React.ComponentRef<typeof TabsPrimitive.Trigger>,
	React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & {
		className?: string;
	}
>(({ className, ...props }, ref) => (
	<TabsPrimitive.Trigger
		ref={ref}
		className={cn(
			"inline-flex items-center justify-center whitespace-nowrap px-3 py-1.5",
			"font-bold text-sm transition-all duration-200",
			"rounded-[var(--radius)]", // Geometry: Absolute 0px Default
			"ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
			"disabled:pointer-events-none disabled:opacity-50",
			"data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
			className,
		)}
		{...props}
	/>
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

/**
 * TabsContent - The contextual data container associated with a trigger.
 */
const TabsContent = React.forwardRef<
	React.ComponentRef<typeof TabsPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content> & {
		className?: string;
	}
>(({ className, ...props }, ref) => (
	<TabsPrimitive.Content
		ref={ref}
		className={cn(
			"mt-3 p-1 outline-none",
			"ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
			className,
		)}
		{...props}
	/>
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
