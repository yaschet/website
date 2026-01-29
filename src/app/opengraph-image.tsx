import { ImageResponse } from "next/og";
import { loadAvatar, loadOgFonts, OG_COLORS, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og";

// export const runtime = "edge"; // node runtime for fs access
export const alt = "Yassine Chettouch - Product Engineer";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
	const avatarBuffer = await loadAvatar();
	const avatarUrl = avatarBuffer
		? `data:image/jpeg;base64,${avatarBuffer.toString("base64")}`
		: "";

	// Grid configuration
	const sidebarWidth = 340;
	const headerHeight = 100;
	// Main bg is light, sidebar bg is dark. Border color depends on context.
	// For light main: surface-200. For dark sidebar: surface-800.
	const mainBorderColor = OG_COLORS.surface200;

	return new ImageResponse(
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				width: "100%",
				height: "100%",
				backgroundColor: OG_COLORS.surface50,
				fontFamily: '"Space Grotesk"',
				position: "relative",
			}}
		>
			{/* MAIN GRID WRAPPER */}
			<div
				style={{
					display: "flex",
					flex: 1,
					width: "100%",
					height: "100%",
				}}
			>
				{/* -------------------------------------------------------------
                        LEFT SIDEBAR (DARK THEME)
                       ------------------------------------------------------------- */}
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						width: `${sidebarWidth}px`,
						height: "100%",
						borderRight: `1px solid ${OG_COLORS.surface800}`, // Distinct border for dark mode
						backgroundColor: OG_COLORS.surface900, // DARK BACKGROUND
						color: OG_COLORS.surface50, // LIGHT TEXT
						justifyContent: "space-between",
						position: "relative",
					}}
				>
					{/* TOP: Avatar + Name */}
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							padding: "40px",
							gap: "24px",
						}}
					>
						{/* Avatar Frame - ZERO RADIUS */}
						<div
							style={{
								display: "flex",
								width: "120px",
								height: "120px",
								borderRadius: "0px", // STRICT ZERO
								overflow: "hidden",
								border: `1px solid ${OG_COLORS.surface600}`, // Softer border on dark
								backgroundColor: OG_COLORS.surface800,
							}}
						>
							{/* biome-ignore lint/a11y/useAltText: generated image */}
							{/* biome-ignore lint/performance/noImgElement: required for ImageResponse */}
							<img
								src={avatarUrl}
								width="120"
								height="120"
								style={{ objectFit: "cover" }}
							/>
						</div>

						<div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
							<div
								style={{
									fontSize: 24,
									fontWeight: 700,
									color: OG_COLORS.surface50, // Light text
								}}
							>
								Yassine Chettouch
							</div>
							<div
								style={{
									fontSize: 18,
									fontFamily: '"Space Mono"',
									color: OG_COLORS.surface400, // Muted light text
									textTransform: "uppercase",
								}}
							>
								Product Engineer
							</div>
						</div>
					</div>

					{/* BOTTOM: Meta */}
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							padding: "40px",
							borderTop: `1px solid ${OG_COLORS.surface800}`, // Dark border
							gap: "12px",
						}}
					>
						<div
							style={{
								fontSize: 16,
								fontFamily: '"Space Mono"',
								color: OG_COLORS.surface500,
								textTransform: "uppercase",
							}}
						>
							Based in
						</div>
						<div
							style={{
								fontSize: 20,
								fontWeight: 500,
								color: OG_COLORS.surface50, // Light text
							}}
						>
							Rabat, Morocco
						</div>
					</div>
				</div>

				{/* -------------------------------------------------------------
                        RIGHT MAIN AREA (LIGHT THEME)
                       ------------------------------------------------------------- */}
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						flex: 1,
						height: "100%",
						backgroundColor: OG_COLORS.surface50, // Light BG
						position: "relative",
					}}
				>
					{/* TOP ROW: LOGO / URL */}
					<div
						style={{
							display: "flex",
							width: "100%",
							height: `${headerHeight}px`,
							borderBottom: `1px solid ${mainBorderColor}`,
							alignItems: "center",
							padding: "0 48px",
							justifyContent: "space-between",
						}}
					>
						<div
							style={{
								fontSize: 24,
								fontWeight: 700,
								letterSpacing: "-0.03em",
								color: OG_COLORS.surface900,
							}}
						>
							yaschet.dev
						</div>
						<div
							style={{
								fontSize: 16,
								fontFamily: '"Space Mono"',
								color: OG_COLORS.surface400,
								textTransform: "uppercase",
							}}
						>
							Home
						</div>
					</div>

					{/* MAIN CONTENT */}
					<div
						style={{
							display: "flex",
							flex: 1,
							flexDirection: "column",
							padding: "64px 48px",
							justifyContent: "center",
							gap: "32px",
						}}
					>
						<div style={{ display: "flex", flexDirection: "column", gap: "0px" }}>
							<div
								style={{
									fontSize: 96,
									fontWeight: 700,
									lineHeight: 0.95,
									letterSpacing: "-0.04em",
									color: OG_COLORS.surface900,
								}}
							>
								Ship.
							</div>
							<div
								style={{
									fontSize: 96,
									fontWeight: 700,
									lineHeight: 0.95,
									letterSpacing: "-0.04em",
									color: OG_COLORS.surface900,
								}}
							>
								Measure.
							</div>
							<div
								style={{
									fontSize: 96,
									fontWeight: 700,
									lineHeight: 0.95,
									letterSpacing: "-0.04em",
									color: OG_COLORS.surface900,
								}}
							>
								Iterate.
							</div>
						</div>
						<div
							style={{
								fontSize: 30, // Reduced from 32
								color: OG_COLORS.surface500,
								fontFamily: '"Space Mono"',
								maxWidth: "680px", // Increased width for better flow
								lineHeight: 1.4,
							}}
						>
							Production web systems built with clear constraints, fast feedback
							loops, and durable architecture.
						</div>
					</div>
				</div>
			</div>

			{/* NO DECORATIVE ELEMENTS */}
		</div>,
		{
			...size,
			fonts: await loadOgFonts(),
		},
	);
}
