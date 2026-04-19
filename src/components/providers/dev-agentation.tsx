"use client";

import dynamic from "next/dynamic";

const Agentation = dynamic(() => import("agentation").then((module) => module.Agentation), {
	ssr: false,
});

const agentationEndpoint = process.env.NEXT_PUBLIC_AGENTATION_ENDPOINT;

export function DevAgentation() {
	if (process.env.NODE_ENV !== "development" || !agentationEndpoint) {
		return null;
	}

	return <Agentation endpoint={agentationEndpoint} />;
}
