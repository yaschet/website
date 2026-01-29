import { ImageResponse } from "next/og";
import { loadAvatar, loadOgFonts, OG_COLORS, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og";

// export const runtime = "edge";
export const alt = "Contact Yassine Chettouch";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
	const avatarBuffer = await loadAvatar();
	const avatarUrl = avatarBuffer
		? `data:image/jpeg;base64,${avatarBuffer.toString("base64")}`
		: "";
	const sidebarWidth = 340;
	const headerHeight = 100;
	const borderColor = OG_COLORS.surface200;

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
			<div style={{ display: "flex", flex: 1, width: "100%", height: "100%" }}>
				{/* LEFT SIDEBAR */}
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						width: `${sidebarWidth}px`,
						height: "100%",
						borderRight: `1px solid ${borderColor}`,
						backgroundColor: OG_COLORS.surface50,
						justifyContent: "space-between",
					}}
				>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							padding: "40px",
							gap: "24px",
						}}
					>
						<div
							style={{
								display: "flex",
								width: "120px",
								height: "120px",
								borderRadius: "0px",
								overflow: "hidden",
								border: `1px solid ${OG_COLORS.surface200}`,
								backgroundColor: OG_COLORS.surface100,
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
									color: OG_COLORS.surface900,
								}}
							>
								Yassine Chettouch
							</div>
							<div
								style={{
									fontSize: 18,
									fontFamily: '"Space Mono"',
									color: OG_COLORS.surface500,
									textTransform: "uppercase",
								}}
							>
								Product Engineer
							</div>
						</div>
					</div>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							padding: "40px",
							borderTop: `1px solid ${borderColor}`,
							gap: "12px",
						}}
					>
						<div
							style={{
								fontSize: 16,
								fontFamily: '"Space Mono"',
								color: OG_COLORS.surface400,
								textTransform: "uppercase",
							}}
						>
							Based in
						</div>
						<div
							style={{
								fontSize: 20,
								fontWeight: 500,
								color: OG_COLORS.surface900,
							}}
						>
							Rabat, Morocco
						</div>
					</div>
				</div>

				{/* RIGHT MAIN AREA */}
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						flex: 1,
						height: "100%",
					}}
				>
					<div
						style={{
							display: "flex",
							width: "100%",
							height: `${headerHeight}px`,
							borderBottom: `1px solid ${borderColor}`,
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
							Contact
						</div>
					</div>

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
								Get in
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
								touch.
							</div>
						</div>
						<div
							style={{
								fontSize: 32,
								color: OG_COLORS.surface500,
								fontFamily: '"Space Mono"',
								maxWidth: "600px",
								lineHeight: 1.4,
							}}
						>
							Available for high-impact consulting and senior roles.
						</div>
					</div>
				</div>
			</div>
		</div>,
		{
			...size,
			fonts: await loadOgFonts(),
		},
	);
}
