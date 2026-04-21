import { ImageResponse } from "next/og";
import {
	loadAvatarDataUrl,
	loadOgFonts,
	OG_COLORS,
	OG_CONTENT_TYPE,
	OG_LAYOUT,
	OG_SIZE,
	sharedGridStyles,
} from "@/lib/og";

// export const runtime = "edge";

// Image metadata
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
	const avatarUrl = await loadAvatarDataUrl();

	const layout = OG_LAYOUT;

	return new ImageResponse(
		<div style={sharedGridStyles}>
			{/* SIDEBAR (IDENTITY ANCHOR) */}
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					width: layout.SIDEBAR_WIDTH,
					height: "100%",
					backgroundColor: layout.BG_DARK,
					borderRight: layout.BORDER_DARK,
					color: OG_COLORS.surface50,
					justifyContent: "space-between",
				}}
			>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						padding: layout.PADDING_SM,
						gap: layout.PADDING_SM,
					}}
				>
					<div
						style={{
							display: "flex",
							width: 140,
							height: 140,
							borderRadius: 0,
							overflow: "hidden",
							border: layout.BORDER_DARK,
							backgroundColor: OG_COLORS.surface900,
						}}
					>
						{/* biome-ignore lint/performance/noImgElement: required for ImageResponse */}
						<img
							src={avatarUrl}
							width={140}
							height={140}
							style={{ objectFit: "cover" }}
							alt="Avatar"
						/>
					</div>
					<div style={{ display: "flex", flexDirection: "column", gap: layout.UNIT * 2 }}>
						<div
							style={{
								fontSize: 24,
								fontWeight: 700,
								color: OG_COLORS.white,
								letterSpacing: "-0.02em",
							}}
						>
							Yassine Chettouch
						</div>
						<div
							style={{
								fontSize: 16,
								fontFamily: '"Space Mono"',
								color: OG_COLORS.surface400,
								textTransform: "uppercase",
								letterSpacing: "0.08em",
							}}
						>
							Software Engineer
						</div>
					</div>
				</div>

				<div
					style={{
						display: "flex",
						flexDirection: "column",
						padding: layout.PADDING_SM,
						gap: layout.UNIT * 3,
						borderTop: `1px solid ${OG_COLORS.surface900}`,
					}}
				>
					<div
						style={{
							fontSize: layout.FONT_MONO,
							fontFamily: '"Space Mono"',
							color: OG_COLORS.surface500,
							textTransform: "uppercase",
						}}
					>
						Location
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

			{/* MAIN PANEL */}
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					flex: 1,
					height: "100%",
					backgroundColor: layout.BG,
				}}
			>
				{/* HEADER ROW */}
				<div
					style={{
						display: "flex",
						width: "100%",
						height: layout.HEADER_HEIGHT,
						borderBottom: layout.BORDER,
						alignItems: "center",
						padding: `0 ${layout.PADDING}px`,
						justifyContent: "space-between",
					}}
				>
					<div
						style={{
							fontSize: 28,
							fontWeight: 700,
							letterSpacing: "-0.04em",
							color: OG_COLORS.surface900,
						}}
					>
						yaschet.dev
					</div>
					<div
						style={{
							display: "flex",
							fontSize: layout.FONT_MONO,
							fontFamily: '"Space Mono"',
							color: OG_COLORS.surface400,
							textTransform: "uppercase",
							letterSpacing: "0.1em",
						}}
					>
						Index
					</div>
				</div>

				{/* CONTENT AREA */}
				<div
					style={{
						display: "flex",
						flex: 1,
						flexDirection: "column",
						padding: layout.PADDING,
						justifyContent: "center",
						gap: layout.PADDING_SM,
					}}
				>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							gap: layout.UNIT * 6,
						}}
					>
						<div
							style={{
								display: "flex",
								fontSize: layout.FONT_HEADLINE,
								fontWeight: 700,
								lineHeight: 1.1,
								letterSpacing: "-0.05em",
								color: OG_COLORS.surface900,
							}}
						>
							Build. Ship. Improve.
						</div>
						<div
							style={{
								display: "flex",
								fontSize: layout.FONT_SUBHEAD,
								color: OG_COLORS.surface800,
								lineHeight: 1.4,
								maxWidth: 720,
							}}
						>
							Product engineering for interfaces and systems—measured, shipped,
							iterated.
						</div>
					</div>
				</div>

				{/* FOOTER REMOVED FOR CLEAN LOOK */}
			</div>
		</div>,
		{
			...size,
			fonts: await loadOgFonts(),
		},
	);
}
