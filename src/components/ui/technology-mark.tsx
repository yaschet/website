import { RiGithubFill, RiOpenaiFill } from "@remixicon/react";
import type { CSSProperties } from "react";

interface TechnologyAsset {
	slug: string;
	size: number;
	color?: string;
	offsetX?: number;
	offsetY?: number;
}

// Optical sizes preserve the original artwork's proportions. Asset provenance:
// docs/technology-assets.md. Unknown technologies retain their authored name.
const marks: Readonly<Record<string, TechnologyAsset>> = {
	laravel: { slug: "laravel", size: 26, color: "#FF2D20" },
	php: { slug: "php-elephant", size: 24, color: "#0288D1" },
	livewire: { slug: "livewire", size: 23, color: "#4E56A6" },
	"alpine.js": { slug: "alpinedotjs", size: 30, color: "#8BC0D0" },
	mysql: { slug: "mysql-dolphin", size: 28, color: "#00618A" },
	redis: { slug: "redis", size: 24, color: "#FF4438" },
	meilisearch: { slug: "meilisearch", size: 26, color: "#FF5CAA" },
	"next.js": { slug: "nextdotjs", size: 21 },
	typescript: { slug: "typescript", size: 20, color: "#3178C6" },
	supabase: { slug: "supabase", size: 24, color: "#3FCF8E" },
	postgresql: { slug: "postgresql", size: 28, color: "#4169E1" },
	react: { slug: "react", size: 28, color: "#61DAFB" },
	"google docs api": { slug: "googledocs", size: 21, color: "#4285F4" },
	"google cloud": { slug: "googlecloud", size: 28, color: "#4285F4" },
	"tanstack query": { slug: "tanstack", size: 24, color: "#ECE8D1" },
	stripe: { slug: "stripe-symbol", size: 23, color: "#635BFF" },
	"cash plus": { slug: "cash-plus", size: 24, color: "#1F9097" },
	"trigger.dev": { slug: "triggerdotdev", size: 26, color: "#41FF54" },
	"next-intl": { slug: "next-intl", size: 24 },
	"aws textract": { slug: "aws-textract", size: 28, offsetX: -1 },
	s3: { slug: "amazon-s3", size: 28 },
	tiptap: { slug: "tiptap", size: 24 },
};

function Asset({
	slug,
	size,
	color,
	offsetX = 0,
	offsetY = 0,
	tone,
}: TechnologyAsset & { tone: "monochrome" | "brand" | "interactive" }) {
	if (tone !== "monochrome" && color) {
		return (
			<span
				className="portfolio-technology-color-mark"
				data-mark={slug}
				style={
					{
						maskImage: `url(/technology/${slug}.svg)`,
						width: size,
						height: size,
						transform: `translate(${offsetX}px, ${offsetY}px)`,
					} as CSSProperties
				}
			/>
		);
	}
	return (
		// A local vector already has intrinsic geometry; raster optimization adds no value.
		// biome-ignore lint/performance/noImgElement: locally served SVG artwork.
		<img
			src={`/technology/${slug}.svg`}
			alt=""
			width={size}
			height={size}
			className="portfolio-technology-mark"
			style={{ transform: `translate(${offsetX}px, ${offsetY}px)` }}
			draggable={false}
			decoding="async"
		/>
	);
}

interface TechnologyMarkProps {
	name: string;
	layout?: "stacked" | "inline";
	tone?: "monochrome" | "brand" | "interactive";
}

/** Symbol-only artwork and one caption, with shared geometry in both layouts. */
export function TechnologyMark({
	name,
	layout = "stacked",
	tone = "monochrome",
}: TechnologyMarkProps) {
	const key = name
		.trim()
		.toLowerCase()
		.replace(/\s+\d+(?:\.\d+)*$/, "");
	const mark = marks[key];
	return (
		<span
			className="portfolio-technology-identity"
			data-layout={layout}
			data-tone={tone}
			style={
				mark?.color ? ({ "--technology-brand": mark.color } as CSSProperties) : undefined
			}
		>
			<span aria-hidden="true" className="portfolio-technology-mark-chamber">
				<span className="portfolio-technology-symbol">
					{key === "openai" ? (
						<RiOpenaiFill className="size-7" />
					) : key === "github" ? (
						<RiGithubFill className="size-7" />
					) : (
						mark && <Asset {...mark} tone={tone} />
					)}
				</span>
			</span>
			<span className="portfolio-technology-label">{name}</span>
		</span>
	);
}
