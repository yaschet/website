"use client";

import { useState } from "react";

const places = [
	"hour-tens",
	"hour-ones",
	"hour-separator",
	"minute-tens",
	"minute-ones",
	"minute-separator",
	"second-tens",
	"second-ones",
];

/** Each changed column advances one masked step, including carries such as 59 → 00. */
export function RollingTime({
	value,
	instant = false,
}: {
	value: string | null;
	instant?: boolean;
}) {
	const [frame, setFrame] = useState({ current: value, previous: value });
	// Retain the preceding value in the same commit, without an effect or animation loop.
	if (frame.current !== value) {
		setFrame({ current: value, previous: frame.current });
	}
	const previous = frame.previous ?? value;
	const animate = value !== null && frame.previous !== null && !instant;

	return (
		<span
			className="portfolio-clock-readout"
			data-ready={value !== null}
			data-instant={instant || undefined}
			aria-hidden="true"
		>
			<span className="portfolio-clock-placeholder">--:--:--</span>
			<span className="portfolio-clock-digits">
				{Array.from(value ?? "00:00:00", (character, index) =>
					character === ":" ? (
						<span key={places[index]} className="portfolio-clock-separator">
							:
						</span>
					) : (
						<span key={places[index]} className="portfolio-clock-digit">
							<span
								key={character}
								data-rolling={
									(animate && previous?.[index] !== character) || undefined
								}
							>
								<i data-digit={previous?.[index] ?? character} />
								<i data-digit={character} />
							</span>
						</span>
					),
				)}
			</span>
		</span>
	);
}
