"use client";

export default function Loading() {
	return (
		<div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-surface-50 dark:bg-surface-950">
			<div className="relative z-10 p-4">
				<svg
					className="size-10 animate-spin-slow-reverse"
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<title>System Loading</title>
					<rect
						x="2"
						y="2"
						width="20"
						height="20"
						className="stroke-surface-200 dark:stroke-surface-800"
						strokeWidth="2"
					/>

					<rect
						x="2"
						y="2"
						width="20"
						height="20"
						className="origin-center animate-draw-square stroke-surface-900 dark:stroke-surface-50"
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
