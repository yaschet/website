"use client";

// ZERO ATMOSPHERE. PURE CONTRAST.

export default function Loading() {
	return (
		<div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-surface-50 dark:bg-surface-950">
			{/* 
				THE ARCHITECT'S LOOP
				"Satisfying" = Kinetic completion.
				Instead of a static "acne" dot, we draw the perimeter of a perfect square.
				It feels like the system is "drafting" or "constructing".
				
				- Size: 48px (Significant but minimal)
				- Stroke: 2px (The Blade)
				- Animation: Dash offset tracing
			*/}
			<div className="relative z-10 p-4">
				<svg
					className="size-10 animate-spin-slow-reverse"
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<title>System Loading</title>
					{/* The Track (faint structure) */}
					<rect
						x="2"
						y="2"
						width="20"
						height="20"
						className="stroke-surface-200 dark:stroke-surface-800"
						strokeWidth="2"
					/>

					{/* The Ink (Drawing head) */}
					<rect
						x="2"
						y="2"
						width="20"
						height="20"
						className="stroke-surface-900 dark:stroke-surface-50 origin-center animate-draw-square"
						strokeWidth="2"
						strokeDasharray="80" /* Perimeter: 20*4 = 80 */
						strokeDashoffset="80"
						strokeLinecap="square"
					/>
				</svg>
			</div>
		</div>
	);
}
