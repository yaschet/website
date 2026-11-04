declare module "*.mdx?content" {
	import type { MDXComponents } from "mdx/types";
	import type { ComponentType } from "react";

	const Content: ComponentType<{ components?: MDXComponents }>;
	export default Content;
	export const metadata: unknown;
}
