/** Content-only fallback. Shared navigation stays visible and interactive while it streams. */
export function PageLoader() {
	return (
		<div className="portfolio-page-loading" role="status" aria-label="Loading page">
			<svg
				className="portfolio-page-loading-glyph"
				width="32"
				height="32"
				viewBox="0 0 24 24"
				fill="none"
				aria-hidden="true"
			>
				<rect
					x="2"
					y="2"
					width="20"
					height="20"
					stroke="currentColor"
					strokeWidth="2"
					opacity="0.1"
				/>
				<rect
					x="2"
					y="2"
					width="20"
					height="20"
					stroke="currentColor"
					strokeWidth="2"
					strokeDasharray="80"
					strokeDashoffset="80"
					strokeLinecap="square"
					className="portfolio-page-loading-mark animate-draw-square"
				/>
			</svg>
		</div>
	);
}
