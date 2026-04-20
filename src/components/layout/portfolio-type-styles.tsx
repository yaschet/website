import { createStyleString } from "@capsizecss/core";
import spaceGrotesk from "@capsizecss/metrics/spaceGrotesk";

const capsizeStyles = [
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
	createStyleString("portfolio-capsize-article-xl", {
		fontMetrics: spaceGrotesk,
		fontSize: 32,
		leading: 35,
	}),
	createStyleString("portfolio-capsize-article-lg", {
		fontMetrics: spaceGrotesk,
		fontSize: 24,
		leading: 29,
	}),
	createStyleString("portfolio-capsize-article-sm", {
		fontMetrics: spaceGrotesk,
		fontSize: 18,
		leading: 24,
	}),
	createStyleString("portfolio-capsize-article-xs", {
		fontMetrics: spaceGrotesk,
		fontSize: 16,
		leading: 22,
	}),
].join("\n");

export function PortfolioTypeStyles() {
	return (
		<style
			// biome-ignore lint/security/noDangerouslySetInnerHtml: Static capsize output generated from trusted font metrics
			dangerouslySetInnerHTML={{ __html: capsizeStyles }}
		/>
	);
}
