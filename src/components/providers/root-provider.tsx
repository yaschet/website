"use client";

import dynamic from "next/dynamic";
import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";
import { RevealProvider } from "./reveal-provider";

const DeferredRootEnhancements = dynamic(
	() =>
		import("./root-enhancements").then((module) => ({
			default: module.RootEnhancements,
		})),
	{
		ssr: false,
	},
);

export default function RootProvider({ children }: { children: ReactNode }) {
	return (
		<ThemeProvider attribute="class" defaultTheme="system" enableSystem={true}>
			<RevealProvider>
				{children}
				<DeferredRootEnhancements />
			</RevealProvider>
		</ThemeProvider>
	);
}
