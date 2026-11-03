import type { Decorator, Parameters } from "@storybook/nextjs-vite";
import { FloatingNav } from "@/src/components/layout/floating-nav";
import { PortfolioScene } from "@/src/components/layout/portfolio-scene";
import { SiteHeader } from "@/src/components/layout/site-header";
import { Toaster } from "@/src/components/ui/sonner";
import { SinglePreviewDocsPage } from "./workshop-docs";

/** Full routes own their gutters and scroll with the document, just as on the website. */
export const fullPageDecorator: Decorator = (Story) => (
	<div className="workshop-full-page portfolio-theme-surface">
		<SiteHeader />
		<PortfolioScene>
			<Story />
		</PortfolioScene>
		<FloatingNav />
		{/* Keep feedback available for annotation; the website retains its normal timeout. */}
		<Toaster timeout={0} />
	</div>
);

export const fullPageParameters = {
	layout: "fullscreen",
	controls: { disable: true },
	docs: { page: SinglePreviewDocsPage },
} satisfies Parameters;
