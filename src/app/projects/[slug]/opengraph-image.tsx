import { allProjects } from "contentlayer2/generated";
import { ImageResponse } from "next/og";
import { loadOgFonts, OG_COLORS, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og";

// Route segment config
export const runtime = "edge";

// Image metadata
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params;
	const project = allProjects.find((p) => p.slug === slug);

	// Fallback if project is not found
	const title = project?.title ?? "Case Study";
	const description = project?.description ?? "Product Engineer Portfolio";
	const status = project?.status ?? "Production";

	return new ImageResponse(
		<div
			style={{
				height: "100%",
				width: "100%",
				display: "flex",
				flexDirection: "column",
				alignItems: "flex-start",
				justifyContent: "space-between",
				backgroundColor: OG_COLORS.surface900, // Dark theme for Case Studies
				color: OG_COLORS.white,
				padding: "80px",
				fontFamily: '"Space Grotesk"',
			}}
		>
			{/* Top Branding */}
			<div
				style={{
					width: "100%",
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
				}}
			>
				<div
					style={{
						fontSize: 20,
						fontWeight: 400,
						color: "#a1a1aa",
						letterSpacing: "-0.02em",
						textTransform: "uppercase",
						fontFamily: '"Space Mono"',
					}}
				>
					Case Study
				</div>
				<div
					style={{
						fontSize: 20,
						fontWeight: 400,
						color: OG_COLORS.surface500,
						letterSpacing: "-0.02em",
						fontFamily: '"Space Mono"',
					}}
				>
					YASCHET.DEV
				</div>
			</div>

			{/* Main Content */}
			<div
				style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "900px" }}
			>
				<div
					style={{
						fontSize: 96,
						fontWeight: 700,
						color: OG_COLORS.white,
						lineHeight: 0.9,
						letterSpacing: "-0.05em",
					}}
				>
					{title}
				</div>
				<div
					style={{
						fontSize: 40,
						color: OG_COLORS.surface300,
						letterSpacing: "-0.03em",
						lineHeight: 1.2,
						// Truncate simplistic simulation
						display: "flex",
						overflow: "hidden",
						fontWeight: 500,
					}}
				>
					{description.length > 140 ? `${description.slice(0, 140)}...` : description}
				</div>
			</div>

			{/* Footer / Meta */}
			<div
				style={{
					width: "100%",
					display: "flex",
					justifyContent: "space-between",
					alignItems: "flex-end",
					borderTop: `1px solid ${OG_COLORS.surface800}`,
					paddingTop: "32px",
				}}
			>
				<div style={{ display: "flex", gap: "40px" }}>
					<div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
						<div
							style={{
								fontSize: 14,
								color: OG_COLORS.surface500,
								textTransform: "uppercase",
								fontFamily: '"Space Mono"',
							}}
						>
							Status
						</div>
						<div style={{ fontSize: 24, color: OG_COLORS.white, fontWeight: 500 }}>
							{status}
						</div>
					</div>
				</div>

				{/* Digital noise / texture hint could go here, but keeping it clean Swiss */}
				<div
					style={{
						width: "48px",
						height: "48px",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						backgroundColor: OG_COLORS.white,
						color: OG_COLORS.surface900,
						borderRadius: "0px",
						fontSize: 32,
						fontWeight: 400,
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
