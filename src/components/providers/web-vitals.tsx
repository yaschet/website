"use client";

import { useReportWebVitals } from "next/web-vitals";

type ReportWebVitalsCallback = Parameters<typeof useReportWebVitals>[0];

// A stable callback prevents Next from replaying metrics after each render.
const reportWebVitals: ReportWebVitalsCallback = ({ name, value, rating }) => {
	if (process.env.NODE_ENV === "development") {
		// biome-ignore lint/suspicious/noConsole: Local diagnostics are deliberately confined to developer tools.
		console.debug("[Web Vitals]", { name, value, rating });
	}
};

/** Diagnostics belong in developer tools; visitor notifications report real actions. */
export function WebVitals() {
	useReportWebVitals(reportWebVitals);
	return null;
}
