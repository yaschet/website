import { addons } from "storybook/manager-api";
import { create } from "storybook/theming/create";

/**
 * Swiss Design theme for Storybook Manager
 * High contrast, sharp edges, and precise typography.
 */
const theme = create({
	base: "dark",

	// Brand identity
	brandTitle: "Architecture of the Blade",
	brandUrl: "https://yaschet.website",
	brandImage: "", // You can add a small SVG logo here if available
	brandTarget: "_self",

	// UI Colors
	appBg: "#030712",
	appContentBg: "#09090b",
	appBorderColor: "#27272a",
	appBorderRadius: 0,

	// Typography
	fontBase: '"Space Grotesk Variable", sans-serif',
	fontCode: '"Space Mono", monospace',

	// Text colors
	textColor: "#f4f4f5",
	textInverseColor: "#09090b",

	// Toolbar default and active colors
	barTextColor: "#a1a1aa",
	barSelectedColor: "#f4f4f5",
	barBg: "#030712",

	// Form colors
	inputBg: "#09090b",
	inputBorder: "#27272a",
	inputTextColor: "#f4f4f5",
	inputBorderRadius: 0,
});

addons.setConfig({
	theme,
	sidebar: {
		showRoots: true,
		collapsedRoots: ["other"],
	},
	toolbar: {
		title: { hidden: false },
		zoom: { hidden: false },
		eject: { hidden: false },
		copy: { hidden: false },
		fullscreen: { hidden: false },
	},
});
