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

// Verto Case Study Assets (New)
import VertoAccount from "@/public/images/verto/account-page.png";
import VertoBilling from "@/public/images/verto/billing-page.png";
import VertoCustomers from "@/public/images/verto/customers-page.png";
import VertoDashboard from "@/public/images/verto/dashboard-page.png";
import VertoEditor from "@/public/images/verto/editor.png";
import VertoLanding from "@/public/images/verto/landing-page.png";
import VertoLandingBlur from "@/public/images/verto/landing-page-blur.png";
import VertoNewTranslation from "@/public/images/verto/new-translation-page.png";
import VertoPipeline from "@/public/images/verto/pipeline-processing.png";
import VertoReviewEditor from "@/public/images/verto/review-editor.png";
import VertoTemplates from "@/public/images/verto/templates-page.png";
import VertoTopUp from "@/public/images/verto/top-up-page.png";
import VertoTransactions from "@/public/images/verto/transactions-filter-panel.png";
import VertoTranslationDetails from "@/public/images/verto/translation-details-page.png";
import VertoTranslations from "@/public/images/verto/translations-page.png";

export const assetMap: Record<string, StaticImageData> = {
	// Verto Mapping
	"/images/verto/account-page.png": VertoAccount,
	"/images/verto/billing-page.png": VertoBilling,
	"/images/verto/customers-page.png": VertoCustomers,
	"/images/verto/dashboard-page.png": VertoDashboard,
	"/images/verto/editor.png": VertoEditor,
	"/images/verto/landing-page-blur.png": VertoLandingBlur,
	"/images/verto/landing-page.png": VertoLanding,
	"/images/verto/new-translation-page.png": VertoNewTranslation,
	"/images/verto/pipeline-processing.png": VertoPipeline,
	"/images/verto/review-editor.png": VertoReviewEditor,
	"/images/verto/templates-page.png": VertoTemplates,
	"/images/verto/top-up-page.png": VertoTopUp,
	"/images/verto/transactions-filter-panel.png": VertoTransactions,
	"/images/verto/translation-details-page.png": VertoTranslationDetails,
	"/images/verto/translations-page.png": VertoTranslations,
};

/**
 * Resolve a string path to a StaticImageData object if available.
 * Returns the original string if no match is found.
 */
export function resolveAsset(src: string): string | StaticImageData {
	return assetMap[src] || src;
}
