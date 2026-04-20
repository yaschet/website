"use client";

import type { ComponentType } from "react";
import { useEffect, useRef, useState } from "react";
import type { DotGridLength, DotGridOrigin } from "./dot-grid-metrics";
import type {
	InstrumentFieldTone,
	InstrumentFieldVariant,
	InstrumentSurface,
} from "./topographic-dot-field";

interface DeferredInstrumentFieldProps {
	className?: string;
	interactive?: boolean;
	step?: DotGridLength;
	minInset?: DotGridLength;
	radius?: number;
	origin?: DotGridOrigin;
	speed?: number;
	surface?: InstrumentSurface;
	variant?: InstrumentFieldVariant;
	tone?: InstrumentFieldTone;
	rootMargin?: string;
}

type InstrumentFieldComponent = ComponentType<DeferredInstrumentFieldProps>;

export function DeferredInstrumentField({
	rootMargin = "320px 0px",
	...props
}: DeferredInstrumentFieldProps) {
	const hostRef = useRef<HTMLDivElement>(null);
	const [shouldLoad, setShouldLoad] = useState(false);
	const [Field, setField] = useState<InstrumentFieldComponent | null>(null);

	useEffect(() => {
		const host = hostRef.current;
		if (!host) return;
		if (!("IntersectionObserver" in window)) {
			setShouldLoad(true);
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				if (!entries.some((entry) => entry.isIntersecting)) return;
				setShouldLoad(true);
				observer.disconnect();
			},
			{ rootMargin },
		);

		observer.observe(host);

		return () => observer.disconnect();
	}, [rootMargin]);

	useEffect(() => {
		if (!shouldLoad || Field) return;

		let cancelled = false;

		void import("./topographic-dot-field").then((module) => {
			if (!cancelled) {
				setField(() => module.InstrumentField as InstrumentFieldComponent);
			}
		});

		return () => {
			cancelled = true;
		};
	}, [Field, shouldLoad]);

	return <div ref={hostRef}>{Field ? <Field {...props} /> : null}</div>;
}
