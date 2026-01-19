import { registerOTel } from "@vercel/otel";

/**
 * Register the instrumentation hook.
 * This runs at startup to initialize observability and monitoring.
 */
export function register() {
	// Enable high-fidelity route monitoring and tagging
	registerOTel({
		serviceName: "yaschet-website",
	});
}
