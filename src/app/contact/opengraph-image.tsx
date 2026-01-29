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
				{/* SIDEBAR (DEEP DARK) */}
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						width: `${sidebarWidth}px`,
						height: "100%",
						backgroundColor: OG_COLORS.surface950,
						borderRight: `1px solid ${OG_COLORS.surface800}`,
						color: OG_COLORS.surface50,
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
								border: `1px solid ${OG_COLORS.surface700}`,
								backgroundColor: OG_COLORS.surface900,
							}}
						>
							{/* biome-ignore lint/performance/noImgElement: required for ImageResponse */}
							<img
								src={avatarUrl}
								width="120"
								height="120"
								style={{ objectFit: "cover" }}
								alt="Avatar"
							/>
						</div>
						<div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
							<div
								style={{
									fontSize: 24,
									fontWeight: 700,
									color: OG_COLORS.white,
								}}
							>
								Yassine Chettouch
							</div>
							<div
								style={{
									fontSize: 18,
									fontFamily: '"Space Mono"',
									color: OG_COLORS.surface400,
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
							borderTop: `1px solid ${OG_COLORS.surface900}`,
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
								color: OG_COLORS.surface50,
							}}
						>
							Rabat, Morocco
						</div>
					</div>
				</div>

				{/* MAIN AREA */}
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						flex: 1,
						height: "100%",
						backgroundColor: OG_COLORS.surface50,
					}}
				>
					<div
						style={{
							display: "flex",
							width: "100%",
							height: `${headerHeight}px`,
							borderBottom: `1px solid ${OG_COLORS.surface200}`,
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
								High-leverage
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
								help.
							</div>
						</div>
						<div
							style={{
								fontSize: 30,
								color: OG_COLORS.surface700,
								fontFamily: '"Space Mono"',
								maxWidth: "680px",
								lineHeight: 1.4,
							}}
						>
							Open to senior product engineering roles and focused consulting where
							shipping quality quickly matters.
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
