import { ImageResponse } from "next/og";
import { loadOgFonts, OG_COLORS, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og";

export const runtime = "edge";
export const alt = "Contact Yassine Chettouch";
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
			<div
				style={{
					display: "flex",
					fontSize: 20,
					fontWeight: 400,
					color: OG_COLORS.surface500,
					letterSpacing: "-0.02em",
					textTransform: "uppercase",
					fontFamily: '"Space Mono"',
				}}
			>
				Inquiries
			</div>

			<div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
				<div
					style={{
						fontSize: 96,
						fontWeight: 700,
						color: OG_COLORS.surface900,
						lineHeight: 0.9,
						letterSpacing: "-0.05em",
					}}
				>
					Get in Touch
				</div>
				<div
					style={{
						fontSize: 40,
						color: OG_COLORS.surface500,
						letterSpacing: "-0.03em",
						fontWeight: 500,
						maxWidth: "900px",
					}}
				>
					Available for high-impact consulting
					<br />
					and senior engineering roles.
				</div>
			</div>

			<div style={{ width: "100%", display: "flex", justifyContent: "flex-end" }}>
				<div
					style={{
						fontSize: 32,
						color: OG_COLORS.surface900,
						fontWeight: 700,
						letterSpacing: "-0.03em",
					}}
				>
					yaschet.dev
				</div>
			</div>
		</div>,
		{
			...size,
			fonts: await loadOgFonts(),
		},
	);
}
