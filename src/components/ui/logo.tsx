import { cn } from "@/src/lib/utils";

/**
 * The Falcon "Y" Logo.
 *
 * - The Shape: An inverted delta (The Dive).
 * - The Negative Space: A sharp geometric cut at the top (The Wings tucked back / The "Y").
 * - The Physics: Aerodynamic, cutting through the screen.
 * - The Style: Pure black/current. 0px radius. Stamped steel.
 */
export function Logo({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="currentColor"
			xmlns="http://www.w3.org/2000/svg"
			className={cn("shrink-0", className)}
			aria-label="Yaschet Logo"
		>
			<title>Yaschet Logo</title>
			<path d="M11 24L11 8L0 0L11 24Z" />
			<path d="M13 24L24 0L13 8L13 24Z" />
		</svg>
	);
}
