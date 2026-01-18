/**
 * Static Image Asset Map
 *
 * @module assets
 * @description
 * Central registry for project images.
 * By using static imports, we enable Next.js "automatic blur" placeholders
 * and optimized image handling for dynamic string paths.
 */

import type { StaticImageData } from "next/image";
import VertoAdmin from "@/public/images/verto/admin-dashboard.jpg";
import VertoArchitecture from "@/public/images/verto/architecture-overview.jpg";
import VertoAuth from "@/public/images/verto/auth-mfa-flow.jpg";
import VertoCredit from "@/public/images/verto/credit-system.jpg";
import VertoPipeline from "@/public/images/verto/document-pipeline.jpg";
import VertoEditorAfter from "@/public/images/verto/editor-after.jpg";
import VertoEditorBefore from "@/public/images/verto/editor-before.jpg";
import VertoHeroBilling from "@/public/images/verto/hero-billing.jpg";
// Verto Case Study Assets
import VertoHeroDashboard from "@/public/images/verto/hero-dashboard.jpg";
import VertoHeroEditor from "@/public/images/verto/hero-editor.jpg";
import VertoHeroTranslation from "@/public/images/verto/hero-translation.jpg";
import VertoMetrics from "@/public/images/verto/metrics-results.jpg";

export const assetMap: Record<string, StaticImageData> = {
	// Verto Mapping
	"/images/verto/hero-dashboard.jpg": VertoHeroDashboard,
	"/images/verto/hero-editor.jpg": VertoHeroEditor,
	"/images/verto/hero-translation.jpg": VertoHeroTranslation,
	"/images/verto/hero-billing.jpg": VertoHeroBilling,
	"/images/verto/architecture-overview.jpg": VertoArchitecture,
	"/images/verto/document-pipeline.jpg": VertoPipeline,
	"/images/verto/editor-before.jpg": VertoEditorBefore,
	"/images/verto/editor-after.jpg": VertoEditorAfter,
	"/images/verto/admin-dashboard.jpg": VertoAdmin,
	"/images/verto/credit-system.jpg": VertoCredit,
	"/images/verto/metrics-results.jpg": VertoMetrics,
	"/images/verto/auth-mfa-flow.jpg": VertoAuth,
};

/**
 * Resolve a string path to a StaticImageData object if available.
 * Returns the original string if no match is found.
 */
export function resolveAsset(src: string): string | StaticImageData {
	return assetMap[src] || src;
}
