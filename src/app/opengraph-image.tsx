import { ImageResponse } from "next/og";
import { loadOgFonts, OG_COLORS, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og";

// Route segment config
export const runtime = "edge";

// Image metadata
export const alt = "Yassine Chettouch - Senior Product Engineer";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
	return new ImageResponse(
		<div
			style={{
				height: "100%",
				width: "100%",
				display: "flex",
				flexDirection: "column",
				alignItems: "flex-start",
				justifyContent: "space-between",
				backgroundColor: OG_COLORS.surface50,
				padding: "80px",
				fontFamily: '"Space Grotesk"',
			}}
		>
			{/* Top Branding */}
			<div
				style={{
					display: "flex",
					fontSize: 32,
					fontWeight: 700,
					color: OG_COLORS.surface900,
					letterSpacing: "-0.03em",
				}}
			>
				yaschet.dev
			</div>

			{/* Main Content */}
			<div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
				<div
					style={{
						fontSize: 84,
						fontWeight: 700,
						color: OG_COLORS.surface900,
						lineHeight: 0.95,
						letterSpacing: "-0.05em",
					}}
				>
					Yassine
					<br />
					Chettouch
				</div>
				<div
					style={{
						fontSize: 36,
						color: OG_COLORS.surface500,
						letterSpacing: "-0.04em",
						marginTop: "16px",
						fontWeight: 400,
						fontFamily: '"Space Mono"',
					}}
				>
					SENIOR PRODUCT ENGINEER
				</div>
			</div>

			{/* Footer / Decorative */}
			<div
				style={{
					width: "100%",
					display: "flex",
					justifyContent: "space-between",
					alignItems: "flex-end",
				}}
			>
				<div
					style={{
						fontSize: 20,
						color: "#a1a1aa", // Needs to be slightly lighter than 500
						letterSpacing: "-0.02em",
						fontFamily: '"Space Mono"',
					}}
				>
					BASED IN MOROCCO
				</div>
				{/* Swiss Cross / Plus Decoration */}
				<div
					style={{
						width: "48px",
						height: "48px",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						backgroundColor: OG_COLORS.surface900,
						color: OG_COLORS.surface50,
						borderRadius: "0px",
						fontSize: 32,
						fontWeight: 500,
						paddingBottom: "4px",
					}}
				>
					+
				</div>
			</div>
		</div>,
		{
			...size,
			fonts: await loadOgFonts(),
		},
	);
}
