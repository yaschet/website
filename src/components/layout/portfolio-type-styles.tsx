import { createStyleString } from "@capsizecss/core";
import spaceGrotesk from "@capsizecss/metrics/spaceGrotesk";

const capsizeStyles = [
	createStyleString("portfolio-capsize-case-title", {
		fontMetrics: spaceGrotesk,
		fontSize: 32,
		leading: 40,
	}),
	createStyleString("portfolio-capsize-hero", {
		fontMetrics: spaceGrotesk,
		fontSize: 32,
		leading: 40,
	}),
	createStyleString("portfolio-capsize-project-title", {
		fontMetrics: spaceGrotesk,
		fontSize: 24,
		leading: 32,
	}),
	createStyleString("portfolio-capsize-heading-xl", {
		fontMetrics: spaceGrotesk,
		fontSize: 48,
		leading: 56,
	}),
	createStyleString("portfolio-capsize-heading-lg", {
		fontMetrics: spaceGrotesk,
		fontSize: 36,
		leading: 44,
	}),
	createStyleString("portfolio-capsize-heading-sm", {
		fontMetrics: spaceGrotesk,
		fontSize: 28,
		leading: 36,
	}),
	`@media (min-width: 22.5rem) {
		${createStyleString("portfolio-capsize-hero", {
			fontMetrics: spaceGrotesk,
			fontSize: 36,
			leading: 44,
		})}
	}
	@media (min-width: 40rem) {
		${createStyleString("portfolio-capsize-case-title", {
			fontMetrics: spaceGrotesk,
			fontSize: 36,
			leading: 44,
		})}
		${createStyleString("portfolio-capsize-hero", {
			fontMetrics: spaceGrotesk,
			fontSize: 48,
			leading: 56,
		})}
		${createStyleString("portfolio-capsize-project-title", {
			fontMetrics: spaceGrotesk,
			fontSize: 28,
			leading: 36,
		})}
	}`,
]
	.join("\n")
	// Preserve the authored scale while honoring a reader's root text size.
	.replace(
		/(font-size|line-height):\s*([\d.]+)px/g,
		(_, property, pixels) => `${property}: ${Number(pixels) / 16}rem`,
	);

export function PortfolioTypeStyles() {
	return (
		<style
			// biome-ignore lint/security/noDangerouslySetInnerHtml: Static capsize output generated from trusted font metrics
			dangerouslySetInnerHTML={{ __html: capsizeStyles }}
		/>
	);
}
