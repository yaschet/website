import { cn } from "@/src/lib/utils";
import * as React from "react";

const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
	({ className, ...props }, ref) => (
		<div className="relative w-full overflow-auto">
			<table
				ref={ref}
				className={cn(
					"w-full caption-bottom border-separate border-spacing-y-2 border-none text-sm",
					className,
				)}
				{...props}
			/>
		</div>
	),
);

Table.displayName = "Table";

const TableHeader = React.forwardRef<
	HTMLTableSectionElement,
	React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
	<thead
		ref={ref}
		className={cn(
			"&:last-child]:rounded-br-xl mb-6 border border-border border-solid bg-surface-50 dark:bg-surface-900 [&:first-child]:rounded-tl-xl [&:first-child]:rounded-bl-xl [&:last-child]:rounded-tr-xl",
			className,
		)}
		{...props}
	/>
));

TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<
	HTMLTableSectionElement,
	React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
	<tbody ref={ref} className={cn("[&_tr:last-child]:border-0", className)} {...props} />
));

TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<
	HTMLTableSectionElement,
	React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
	<tfoot
		ref={ref}
		className={cn("bg-muted/50 font-medium [&>tr]:last:border-b-0", className)}
		{...props}
	/>
));

TableFooter.displayName = "TableFooter";

export type TableRowProps = {
	variant?: "default" | "queued" | "success" | "error" | "processing" | "loading";
	className?: string;
} & React.HTMLAttributes<HTMLTableRowElement>;

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
	({ className, variant = "default", ...props }, ref) => (
		<tr
			ref={ref}
			className={cn(
				"overflow-hidden rounded-3xl transition-colors",
				{
					"odd:bg-destructive-50 even:bg-destructive-100/50 even:hover:bg-destructive-100 odd:hover:bg-destructive-100 data-[state=selected]:bg-destructive-100 dark:data-[state=selected]:bg-destructive-900 dark:even:bg-destructive-900/50 dark:even:hover:bg-destructive-900 dark:odd:bg-destructive-950 dark:odd:hover:bg-destructive-900":
						variant === "error",
					"odd:bg-info-50 even:bg-info-100/50 even:hover:bg-info-100 odd:hover:bg-info-100 data-[state=selected]:bg-info-100 dark:data-[state=selected]:bg-info-900 dark:even:bg-info-900/50 dark:even:hover:bg-info-900 dark:odd:bg-info-950/5 dark:odd:hover:bg-info-900":
						variant === "processing",
					"odd:bg-success-50 even:bg-success-100/50 even:hover:bg-success-100 odd:hover:bg-success-100 data-[state=selected]:bg-success-100 dark:data-[state=selected]:bg-success-900 dark:even:bg-success-950/50 dark:even:hover:bg-success-900 dark:odd:bg-success-950 dark:odd:hover:bg-success-900":
						variant === "success",
					"odd:bg-surface-50 even:bg-surface-100/50 even:hover:bg-surface-100 odd:hover:bg-surface-100 data-[state=selected]:bg-surface-100 dark:data-[state=selected]:bg-surface-900 dark:even:bg-surface-900/50 dark:even:hover:bg-surface-900 dark:odd:bg-surface-950 dark:odd:hover:bg-surface-900":
						!variant || variant === "default",
					"odd:bg-transparent even:bg-surface-100/50 even:hover:bg-surface-100 odd:hover:bg-surface-100 dark:even:bg-surface-900/50 dark:even:hover:bg-surface-900 dark:odd:bg-surface-950 dark:odd:hover:bg-surface-900":
						variant === "loading",
					"odd:bg-warning-50 even:bg-warning-100/50 even:hover:bg-warning-100 odd:hover:bg-warning-100 data-[state=selected]:bg-warning-100 dark:data-[state=selected]:bg-warning-900 dark:even:bg-warning-900/50 dark:even:hover:bg-warning-900 dark:odd:bg-warning-950 dark:odd:hover:bg-warning-900":
						variant === "queued",
				},
				className,
			)}
			{...props}
		/>
	),
);

TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<
	HTMLTableCellElement,
	React.ThHTMLAttributes<HTMLTableCellElement> & { className?: string }
>(({ className, ...props }, ref) => (
	<th
		ref={ref}
		className={cn(
			"h-10 whitespace-nowrap border-none p-4 text-left align-middle font-bold text-muted text-xs [&:first-child]:rounded-l-3xl [&:has([role=checkbox])]:pr-0 [&:last-child]:rounded-r-3xl [&>[role=checkbox]]:translate-y-[2px]",
			className,
		)}
		{...props}
	/>
));

TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<
	HTMLTableCellElement,
	React.TdHTMLAttributes<HTMLTableCellElement> & { className?: string }
>(({ className, ...props }, ref) => (
	<td
		ref={ref}
		className={cn(
			"mb-2 p-4 align-middle [&:first-child]:rounded-l-3xl [&:has([role=checkbox])]:pr-0 [&:last-child]:rounded-r-3xl [&>[role=checkbox]]:translate-y-[2px]",
			className,
		)}
		{...props}
	/>
));

TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<
	HTMLTableCaptionElement,
	React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
	<caption
		ref={ref}
		className={cn(
			"mt-4 whitespace-nowrap font-normal text-sm text-surface-900 capitalize not-italic leading-5 dark:text-surface-100",
			className,
		)}
		{...props}
	/>
));

TableCaption.displayName = "TableCaption";

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
