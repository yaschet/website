"use client";

import { useReportWebVitals } from "next/web-vitals";
import { toast } from "sonner";

/**
 * Web Vitals Reporter
 *
 * Displays Core Web Vitals metrics in real-time during development.
 * Uses Sonner toasts to create a non-intrusive "HUD" for performance.
 *
 * @remarks
 * THRESHOLDS (Google Standards):
 * - LCP: Good < 2.5s
 * - FID: Good < 100ms
 * - CLS: Good < 0.1
 * - INP: Good < 200ms
 * - TTFB: Good < 0.8s
 */
export function WebVitals() {
	useReportWebVitals((metric) => {
		// Only trigger in development
		if (process.env.NODE_ENV !== "development") return;

		const { id, name, value, rating } = metric;

		// Threshold logic for color coding
		const isPoor = rating === "poor";
		const isNeedsImprovement = rating === "needs-improvement";
		const isGood = rating === "good";

		// Format value based on metric type
		const formattedValue = name === "CLS" ? value.toFixed(3) : `${Math.round(value)}ms`;

		// Icons based on rating
		const icon = isGood ? "✅" : isNeedsImprovement ? "⚠️" : "🚨";

		// biome-ignore lint/suspicious/noConsoleLog: Development only
		console.debug(`[Web Vital] ${name}:`, metric);

		// Toast notification for immediate feedback
		// We use a custom ID to update existing toasts if needed, or just unique stacks
		toast(`${icon} ${name}: ${formattedValue}`, {
			id: `vital-${name}-${id}`, // Unique per metric instance
			duration: 4000,
			description: isPoor
				? `Poor result (>${getThreshold(name)})`
				: isNeedsImprovement
					? "Needs Improvement"
					: "Good",
			style: {
				borderLeft: `4px solid ${getColor(rating)}`,
			},
		});
	});

	return null;
}

function getColor(rating: string) {
	switch (rating) {
		case "good":
			return "#22c55e"; // green-500
		case "needs-improvement":
			return "#eab308"; // yellow-500
		case "poor":
			return "#ef4444"; // red-500
		default:
			return "#3b82f6"; // blue-500
	}
}

function getThreshold(name: string) {
	switch (name) {
		case "LCP":
			return "2.5s";
		case "FID":
			return "100ms";
		case "CLS":
			return "0.1";
		case "INP":
			return "200ms";
		case "TTFB":
			return "0.8s";
		default:
			return "N/A";
	}
}
