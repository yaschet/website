import "@fontsource-variable/space-grotesk";
import "@fontsource/space-mono/400.css";
import { addons } from "storybook/manager-api";
import { create } from "storybook/theming/create";

/**
 * Swiss Design theme for Storybook Manager
 * High contrast, sharp edges, and precise typography.
 */
const theme = create({
	base: "dark",

	// Brand identity
	brandTitle: "YASCHET",
	brandUrl: "https://yaschet.com",
	brandTarget: "_self",

	colorSecondary: "#d4d4d4",

	// UI Colors
	appBg: "#141414",
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
	barBg: "#141414",

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
	},
	toolbar: {
		title: { hidden: false },
		zoom: { hidden: false },
		eject: { hidden: false },
		copy: { hidden: false },
		fullscreen: { hidden: false },
	},
});
