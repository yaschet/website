import { createStyleString } from "@capsizecss/core";
import spaceGrotesk from "@capsizecss/metrics/spaceGrotesk";

const capsizeStyles = [
	createStyleString("portfolio-capsize-heading-xl", {
		fontMetrics: spaceGrotesk,
		fontSize: 48,
		leading: 48,
	}),
	createStyleString("portfolio-capsize-heading-lg", {
		fontMetrics: spaceGrotesk,
		fontSize: 36,
		leading: 40,
	}),
	createStyleString("portfolio-capsize-heading-sm", {
		fontMetrics: spaceGrotesk,
		fontSize: 28,
		leading: 32,
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
